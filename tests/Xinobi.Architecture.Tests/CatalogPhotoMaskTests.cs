using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;
namespace Xinobi.Architecture.Tests;

public sealed class CatalogPhotoMaskTests
{
    const string Product="DEMO-P101",Root="/api/v1/local-commerce/surfaces/products/"+Product;
    static byte[] Image(int width,int height,bool mask=false)
    {
        using var bitmap=new SKBitmap(width,height);bitmap.Erase(mask?SKColors.Transparent:SKColors.Teal);
        if(mask){using var c=new SKCanvas(bitmap);using var p=new SKPaint{Color=SKColors.White};c.DrawRect(width/4,0,width/2,height,p);}
        using var pixels=bitmap.PeekPixels();using var data=mask?pixels.Encode(new SKWebpEncoderOptions(SKWebpEncoderCompression.Lossless,100)):pixels.Encode(SKEncodedImageFormat.Png,100);return data!.ToArray();
    }
    [Theory]
    [InlineData(113,67)]
    [InlineData(67,113)]
    [InlineData(79,79)]
    [InlineData(5001,4000)]
    public async Task ExistingPhotoDownloadsAndAcceptsOneMaskWithoutSeparateSourceRegistration(int width,int height)
    {
        await using var factory=new IsolatedApiFactory().WithWebHostBuilder(b=>b.ConfigureAppConfiguration((_,c)=>c.AddInMemoryCollection(new Dictionary<string,string?>{["ProductSurfaces:ExperimentalCatalogWorkspace:Enabled"]="true"})));
        using var staff=await TestStaff.Client(factory);var files=factory.Services.GetRequiredService<IFileStore>();var catalog=factory.Services.GetRequiredService<LocalCommerceStore>();
        var photo=Image(width,height);var key=Guid.NewGuid().ToString("N")+".png";await files.Save(FileAreas.Media,key,new MemoryStream(photo),"image/png");var image="/api/v1/local-commerce/media/"+key;
        await catalog.Update(s=>s with {Products=s.Products.Select(p=>p.Id==Product?p with {OriginalImage=null,Variants=p.Variants.Select(v=>v with {Image=image}).ToArray()}:p).ToArray()});
        var before=JsonSerializer.Serialize(await catalog.Read());var product=(await catalog.Read()).Products.Single(p=>p.Id==Product);var selected=product.Variants.Last().Id;
        var detail=(await staff.GetFromJsonAsync<SingleSourceMaskDetail>(Root+"?catalogPhotoId="+selected))!;
        Assert.Equal(selected,detail.CatalogPhotoId);Assert.Equal(width,detail.Source!.Width);Assert.Equal(height,detail.Source.Height);Assert.Equal(0,detail.SourceRevision);
        Assert.Equal(photo,await staff.GetByteArrayAsync(detail.Source.Image));
        var sources=factory.Services.GetRequiredService<PersonalizationSourceStore>();Assert.False(await sources.HasSourceProfile(Product));
        var upload=new SingleSourceMaskUpload(image,detail.Source.Sha256,0,0,Convert.ToBase64String(Image(37,29,true)),"alpha",selected);
        Assert.Equal(HttpStatusCode.BadRequest,(await staff.PostAsJsonAsync(Root+"/mask",upload)).StatusCode);Assert.False(await sources.HasSourceProfile(Product));
        Assert.Equal(HttpStatusCode.Conflict,(await staff.PostAsJsonAsync(Root+"/mask",upload with {CatalogPhotoId="foreign"})).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict,(await staff.PostAsJsonAsync(Root+"/mask",upload with {SourceSha256=new string('0',64)})).StatusCode);
        var request=upload with {WebpBase64=Convert.ToBase64String(Image(width,height,true))};
        var responses=await Task.WhenAll(staff.PostAsJsonAsync(Root+"/mask",request),staff.PostAsJsonAsync(Root+"/mask",request));
        Assert.Single(responses,r=>r.StatusCode==HttpStatusCode.OK);Assert.Single(responses,r=>r.StatusCode==HttpStatusCode.Conflict);
        var draft=(await staff.GetFromJsonAsync<SingleSourceMaskDetail>(Root))!;Assert.Equal(1,draft.SourceRevision);Assert.NotNull(draft.Draft);Assert.Null(draft.Approved);
        Assert.Equal(photo,await staff.GetByteArrayAsync(draft.Source!.Image));
        Assert.Equal(selected,await sources.FulfillmentVariant(Product));
        var action=new SingleSourceMaskAction(draft.Source.Sha256,draft.SourceRevision,draft.ProfileRevision,draft.Draft.Id);
        var approved=await staff.PostAsJsonAsync(Root+"/approval",action);approved.EnsureSuccessStatusCode();
        var published=await sources.RenderingInputs(Product);Assert.Equal(width,published.Inputs.Width);Assert.Equal(height,published.Inputs.Height);
        Assert.Equal(before,JsonSerializer.Serialize(await catalog.Read())); // no colour photo/mask is copied or rewritten
        Assert.Equal(HttpStatusCode.Gone,(await staff.PostAsJsonAsync("/api/v1/local-commerce/surfaces/"+Product+"/"+selected+"/approval/colors",new {colors=product.Variants.Select(v=>v.Id)})).StatusCode);
    }
}
