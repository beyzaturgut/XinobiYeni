using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using SkiaSharp;
using Xinobi.Api.Designs;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;
namespace Xinobi.Architecture.Tests;
public sealed class SingleSourcePurchaseTests
{
    const string Product = "DEMO-P101", Variant = "DEMO-V101-B";
    internal static byte[] Image(bool mask = false)
    {
        using var bitmap = new SKBitmap(7001, 7); bitmap.Erase(mask ? SKColors.Transparent : SKColors.Gray);
        if(mask) { using var c = new SKCanvas(bitmap); using var p = new SKPaint { Color = SKColors.White }; c.DrawRect(0,0,3500,7,p); }
        using var pixels=bitmap.PeekPixels();
        using var encoded=mask ? pixels.Encode(new SKWebpEncoderOptions(SKWebpEncoderCompression.Lossless,100)) : pixels.Encode(SKEncodedImageFormat.Png,100);
        return encoded!.ToArray();
    }
    internal static async Task<SingleSourcePurchase> Prepare(WebApplicationFactory<Program> factory, bool bind = true)
    {
        var sources=factory.Services.GetRequiredService<PersonalizationSourceStore>();
        var key=Guid.NewGuid().ToString("N")+".png"; var bytes=Image();
        await factory.Services.GetRequiredService<IFileStore>().Save(FileAreas.Media,key,new MemoryStream(bytes),"image/png");
        var path="/api/v1/local-commerce/media/"+key; var candidate=await sources.Candidate(Product,path);
        await sources.Save(Product,new(path,candidate.Sha256,(await sources.Get(Product)).Revision));
        var detail=await sources.GetMask(Product);
        detail=await sources.UploadMask(Product,new(detail.Source!.Image,detail.Source.Sha256,detail.SourceRevision,detail.ProfileRevision,Convert.ToBase64String(Image(true)),"alpha"));
        await sources.MaskAction(Product,new(detail.Source!.Sha256,detail.SourceRevision,detail.ProfileRevision,detail.Draft!.Id),"approve");
        if(bind)await sources.SetFulfillment(Product,new(Variant,(await sources.Get(Product)).Revision));
        return await sources.Purchase(Product);
    }
    static DesignPlacement Placement(SingleSourceBinding b)=>new(b.Width,b.Height,b.MaskSha256,3500,3,1,0,.4,Mode:"pattern");
    [Fact]
    public async Task MissingMappingDoesNotChooseFirstVariantAndPriceStockRemainActual()
    {
        using var factory=new IsolatedApiFactory();var value=await Prepare(factory,false);
        Assert.Equal("commercial_binding_missing",value.Status);Assert.Null(value.Binding);Assert.Null(value.PriceMinor);
        var sources=factory.Services.GetRequiredService<PersonalizationSourceStore>();
        await Assert.ThrowsAsync<ProblemException>(()=>sources.SetFulfillment(Product,new("foreign",value.ProfileRevision)));
        await sources.SetFulfillment(Product,new(Variant,value.ProfileRevision));
        var ready=await sources.Purchase(Product);Assert.Equal(Variant,ready.Binding!.FulfillmentVariantId);Assert.Equal(7001,ready.Binding.Width);
        var catalog=factory.Services.GetRequiredService<LocalCommerceStore>();var state=await catalog.Read();
        Assert.Equal(state.Prices[Variant],ready.PriceMinor);Assert.Equal(state.Products.Single(p=>p.Id==Product).Variants.Single(v=>v.Id==Variant).Stock,ready.Stock);
        using var staff=await TestStaff.Client(factory);
        var product=state.Products.Single(p=>p.Id==Product);
        Assert.Equal(HttpStatusCode.Conflict,(await staff.PutAsJsonAsync("/api/v1/local-commerce/products/"+Product,product with { Variants=product.Variants.Where(v=>v.Id!=Variant).ToArray() })).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict,(await staff.DeleteAsync("/api/v1/local-commerce/products/"+Product)).StatusCode);
        await catalog.Update(s=>s with {Prices=s.Prices.Where(p=>p.Key!=Variant).ToDictionary()});
        Assert.Equal("price_missing",(await sources.Purchase(Product)).Status);
    }
    [Fact]
    public async Task ExactSourceBindingRawDimensionsAndCommercialRevisionAreRequired()
    {
        using var factory=new IsolatedApiFactory();var value=await Prepare(factory);var b=value.Binding!;
        var sources=factory.Services.GetRequiredService<PersonalizationSourceStore>();var p=Placement(b);
        var photo=await sources.ValidateSelection(Product,Variant,p,b);Assert.Equal(b.ProductSourceSha256,photo.Sha256);Assert.Equal(Image(),photo.Bytes);
        foreach(var wrong in new[]{b with { ProductId="other" },b with {SurfaceId="other"},b with {ProductSourceSha256=new string('a',64)},b with {SourceRevision=b.SourceRevision+1},b with {Width=b.Width-1}})
            await Assert.ThrowsAsync<ProblemException>(()=>sources.ValidateSelection(Product,Variant,p,wrong));
        await Assert.ThrowsAsync<ProblemException>(()=>sources.ValidateSelection(Product,Variant,p with {SourceWidth=6000},b));
        await sources.SetFulfillment(Product,new(null,value.ProfileRevision));
        Assert.Equal("commercial_binding_changed",(await Assert.ThrowsAsync<ProblemException>(()=>sources.ValidateSelection(Product,Variant,p,b))).Code);
    }
    [Fact]
    public async Task NewConfigurationsEnforceOwnershipDesignRevisionAndCheckoutSurfaceValidation()
    {
        using var factory=new IsolatedApiFactory();using var client=factory.CreateClient();var purchase=await Prepare(factory);var binding=purchase.Binding!;
        var email="single-source@example.com";
        var challenge=(await (await client.PostAsJsonAsync("/api/v1/auth/email-verification",new StartAccountEmailVerification(email))).Content.ReadFromJsonAsync<AccountEmailVerification>())!;
        var auth=(await (await client.PostAsJsonAsync("/api/v1/auth/register",new RegisterAccount("Ayşe Yılmaz",email,"guclu-parola-1",challenge.VerificationId,challenge.PreviewCode!))).Content.ReadFromJsonAsync<AuthSession>())!;
        client.DefaultRequestHeaders.Authorization=new AuthenticationHeaderValue("Bearer",auth.AccessToken);
        async Task<MyDesign> Upload(){using var form=new MultipartFormDataContent{{new ByteArrayContent(Image(true)),"file","pattern.png"},{new StringContent(Product),"productId"}};var r=await client.PostAsync("/api/v1/me/designs/upload",form);Assert.True(r.IsSuccessStatusCode,await r.Content.ReadAsStringAsync());return (await r.Content.ReadFromJsonAsync<MyDesign>())!;}
        var design=await Upload();var other=await Upload();var route="/api/v1/me/designs/"+design.Id+"/configurations";
        var request=new SaveDesignConfiguration(Variant,Placement(binding),SurfaceBinding:binding);
        Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync(route,request with {SurfaceBinding=null})).StatusCode);
        var savedResponse=await client.PostAsJsonAsync(route,request);Assert.True(savedResponse.IsSuccessStatusCode,await savedResponse.Content.ReadAsStringAsync());
        var config=(await savedResponse.Content.ReadFromJsonAsync<MyDesignConfiguration>())!;Assert.Equal(2,config.SchemaVersion);Assert.Equal(binding,config.SurfaceBinding);
        Assert.NotEqual(binding.ProductSourceSha256,config.SourceSha256); // pattern bytes have independent identity (alter next upload below if equal)
        Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync("/api/v1/me/designs/"+other.Id+"/configurations",request with {ConfigurationId=config.Id,ExpectedRevision=1})).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync(route,request with {ConfigurationId=config.Id,ExpectedRevision=0})).StatusCode);
        var addressResponse=await client.PostAsJsonAsync("/api/v1/me/addresses",new SaveCustomerAddress("Ev","Ayşe Yılmaz","05321234567","İstanbul","Kadıköy","SYNTHETIC Test Sokak No 1",null,true));
        var address=(await addressResponse.Content.ReadFromJsonAsync<CustomerAddress>())!;
        var line=new PlaceOrderItem(Product,Variant,1,design.Id,config.Id,config.Revision);
        var orderRequest=new PlaceOrder(address.Id,[line],"single-source-order-01");
        Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync("/api/v1/me/orders",orderRequest with {Items=[new(Product,Variant,1,design.Id)],ClientRequestId="single-source-no-config"})).StatusCode);
        // Missing revision preview cannot be mistaken for a complete deliverable.
        Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync("/api/v1/me/orders",orderRequest)).StatusCode);
        using(var image=new SKBitmap(15,15)){image.Erase(SKColors.Gray);using var img=SKImage.FromBitmap(image);using var jpeg=img.Encode(SKEncodedImageFormat.Jpeg,80);using var form=new MultipartFormDataContent{{new ByteArrayContent(jpeg.ToArray()),"file","preview.jpg"}};Assert.Equal(HttpStatusCode.NoContent,(await client.PutAsync($"/api/v1/me/design-configurations/{config.Id}/revisions/1/preview",form)).StatusCode);}
        var placed=await client.PostAsJsonAsync("/api/v1/me/orders",orderRequest);Assert.True(placed.IsSuccessStatusCode,await placed.Content.ReadAsStringAsync());
        var order=(await placed.Content.ReadFromJsonAsync<CustomerOrder>())!;
        Assert.Equal(binding,Assert.Single(order.Lines).Personalization!.SurfaceBinding);
        var retry=(await (await client.PostAsJsonAsync("/api/v1/me/orders",orderRequest)).Content.ReadFromJsonAsync<CustomerOrder>())!;Assert.Equal(order.Id,retry.Id);
        var mixed=new PlaceOrder(address.Id,[line,new(Product,Variant,99)],"single-source-overstock");Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync("/api/v1/me/orders",mixed)).StatusCode);
        await factory.Services.GetRequiredService<PersonalizationSourceStore>().SetFulfillment(Product,new(null,purchase.ProfileRevision));
        Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync("/api/v1/me/orders",orderRequest with {ClientRequestId="single-source-stale"})).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync(route,request with {ConfigurationId=config.Id,ExpectedRevision=1})).StatusCode);
        var stored=(await client.GetFromJsonAsync<MyDesignConfiguration>("/api/v1/me/design-configurations/"+config.Id+"/revisions/1"))!;Assert.Equal(binding,stored.SurfaceBinding);
    }
}
