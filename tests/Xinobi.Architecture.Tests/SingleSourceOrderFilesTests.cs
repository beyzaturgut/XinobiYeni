using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using Microsoft.Extensions.DependencyInjection;
using SkiaSharp;
using Xinobi.Api.Designs;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

public sealed class SingleSourceOrderFilesTests
{
    const string Product = "DEMO-P101", Variant = "DEMO-V101-B";
    static string Sha(byte[] bytes) => Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();
    static byte[] Image(SKColor color, bool jpeg = false, int width = 31, int height = 19)
    {
        using var bitmap = new SKBitmap(width, height); bitmap.Erase(color);
        using var image = SKImage.FromBitmap(bitmap); using var encoded = image.Encode(jpeg ? SKEncodedImageFormat.Jpeg : SKEncodedImageFormat.Png, 90);
        return encoded.ToArray();
    }
    internal static byte[] Jpeg(bool alternate = false) => Image(alternate ? SKColors.Purple : SKColors.Orange, true);
    sealed class Fixture : IAsyncDisposable
    {
        public IsolatedApiFactory Factory = new();
        public HttpClient Customer = null!, Staff = null!;
        public IAccountStore Accounts => Factory.Services.GetRequiredService<IAccountStore>();
        public SavedDesignStore Designs => Factory.Services.GetRequiredService<SavedDesignStore>();
        public IFileStore Files => Factory.Services.GetRequiredService<IFileStore>();
        public string Owner = ""; public CustomerAddress Address = null!; public SingleSourceBinding Binding = null!;
        public readonly List<MyDesign> Patterns = [];
        public readonly byte[][] PatternBytes = [Image(SKColors.Red), Image(SKColors.Green)];
        public readonly byte[][] Compositions = [Image(SKColors.Blue, true), Image(SKColors.Yellow, true)];
        public readonly List<MyDesignConfiguration> Configs = [];
        public static async Task<Fixture> Create()
        {
            var f = new Fixture(); f.Customer = f.Factory.CreateClient();
            f.Staff = await TestStaff.Client(f.Factory);
            var account = await f.Accounts.Register("Synthetic Owner", "snapshot-owner@example.invalid", "synthetic-strong-password");
            f.Owner = account.Id; var tokens = await f.Accounts.IssueTokens(account.Id);
            f.Customer.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
            f.Binding = (await SingleSourcePurchaseTests.Prepare(f.Factory)).Binding!;
            var address = await f.Customer.PostAsJsonAsync("/api/v1/me/addresses", new SaveCustomerAddress("Test", "Synthetic Owner", "05321234567", "İstanbul", "Kadıköy", "SYNTHETIC Test Sokak No 1", null, true));
            address.EnsureSuccessStatusCode(); f.Address = (await address.Content.ReadFromJsonAsync<CustomerAddress>())!;
            for(var i=0;i<2;i++)
            {
                f.Patterns.Add(await f.Designs.Add(f.Owner,"upload","Synthetic pattern "+i,Product,"Synthetic product",null,null,[],f.PatternBytes[i]));
                f.Configs.Add(await f.Configure(i));
            }
            return f;
        }
        public async Task<MyDesignConfiguration> Configure(int i, MyDesignConfiguration? existing = null, double x = 2500)
        {
            var p = new DesignPlacement(Binding.Width, Binding.Height, Binding.MaskSha256,x,3,1,0,.4,Mode:"pattern");
            var response = await Customer.PostAsJsonAsync($"/api/v1/me/designs/{Patterns[i].Id}/configurations",new SaveDesignConfiguration(Variant,p,existing?.Id,existing?.Revision,SurfaceBinding:Binding));
            Assert.True(response.IsSuccessStatusCode,await response.Content.ReadAsStringAsync());
            var value=(await response.Content.ReadFromJsonAsync<MyDesignConfiguration>())!;
            using var preview = await Preview(value, Compositions[i]); Assert.Equal(HttpStatusCode.NoContent, preview.StatusCode); return value;
        }
        public async Task<HttpResponseMessage> Preview(MyDesignConfiguration config, byte[] bytes)
        {
            using var form=new MultipartFormDataContent{{new ByteArrayContent(bytes),"file","preview.jpg"}};
            return await Customer.PutAsync($"/api/v1/me/design-configurations/{config.Id}/revisions/{config.Revision}/preview",form);
        }
        public async Task<HttpResponseMessage> Place(string key="new-source-snapshot") => await Customer.PostAsJsonAsync("/api/v1/me/orders",new PlaceOrder(Address.Id,
            Configs.Select((c,i)=>new PlaceOrderItem(Product,Variant,1,Patterns[i].Id,c.Id,c.Revision)).ToArray(),key));
        public async Task<CustomerOrder> Order()
        { var response=await Place();Assert.True(response.IsSuccessStatusCode,await response.Content.ReadAsStringAsync());return (await response.Content.ReadFromJsonAsync<CustomerOrder>())!; }
        public string Route(CustomerOrder order,int line,string kind)=>$"/api/v1/admin/orders/{order.Id}/lines/{line}/{kind}";
        public async ValueTask DisposeAsync(){Customer.Dispose();Staff.Dispose();await Factory.DisposeAsync();}
    }

    [Fact]
    public async Task ThreeCopiesStayOnExactOrderedLinesRevisionsAfterSourceSkuAndDesignDeletion()
    {
        await using var f=await Fixture.Create();
        await f.Configure(0,f.Configs[0],3100); // newer editable revision must not replace ordered revision 1
        var order=await f.Order();Assert.Equal(2,order.Lines.Length);
        await SingleSourcePurchaseTests.Prepare(f.Factory); // different source revision / mask ID
        foreach(var p in f.Patterns)await f.Designs.Delete(f.Owner,p.Id);
        await f.Factory.Services.GetRequiredService<LocalCommerceStore>().Update(s=>s with {Products=s.Products.Where(p=>p.Id!=Product).ToArray(),Prices=[]});
        for(var i=0;i<2;i++)
        {
            var p=order.Lines[i].Personalization!;Assert.Equal(f.Binding,p.SurfaceBinding);Assert.Equal(1,p.ConfigurationRevision);
            var expected=new Dictionary<string,byte[]>{{"pattern",f.PatternBytes[i]},{"source",SingleSourcePurchaseTests.Image()},{"composition",f.Compositions[i]}};
            foreach(var (kind,bytes) in expected)
            {
                using var response=await f.Staff.GetAsync(f.Route(order,i,kind));Assert.True(response.IsSuccessStatusCode,await response.Content.ReadAsStringAsync());
                Assert.Equal(bytes,await response.Content.ReadAsByteArrayAsync());Assert.Equal("sha256",response.Headers.GetValues("X-Xinobi-File-Check").Single());
                Assert.Contains("satir-"+(i+1),response.Content.Headers.ContentDisposition!.ToString());
                using var denied=await f.Customer.GetAsync(f.Route(order,i,kind));Assert.Equal(HttpStatusCode.Forbidden,denied.StatusCode);
            }
            using var preview=await f.Customer.GetAsync($"/api/v1/me/orders/{order.Id}/lines/{i}/preview");Assert.Equal(f.Compositions[i],await preview.Content.ReadAsByteArrayAsync());
        }
        var stored=(await f.Accounts.Orders(f.Owner)).Single();
        Assert.Equal(order.Lines.Select(l=>l.Personalization!.Files),stored.Lines.Select(l=>l.Personalization!.Files));
        Assert.Equal(order.Lines.Select(l=>l.Personalization!.Placement),stored.Lines.Select(l=>l.Personalization!.Placement));
        using var stranger=f.Factory.CreateClient();Assert.Equal(HttpStatusCode.Unauthorized,(await stranger.GetAsync(f.Route(order,0,"source"))).StatusCode);
    }

    [Fact]
    public async Task RawLargeSourceDownloadKeepsRealCanvasWithoutCurrentPixelLimitOrCatalogue()
    {
        await using var f=await Fixture.Create();var order=await f.Order();
        var bytes=Image(SKColors.Teal,width:5001,height:4000);var binding=f.Binding with {Width=5001,Height=4000,ProductSourceSha256=Sha(bytes)};
        var source=await f.Designs.CopySourceToOrder(new(Sha(bytes),bytes),order.Id,0,singleSource:true);
        await f.Accounts.ChangeOrder(f.Owner,order.Id,o=>o with {Lines=[o.Lines[0] with {Personalization=o.Lines[0].Personalization! with {SurfaceBinding=binding,Placement=o.Lines[0].Personalization!.Placement! with {SourceWidth=5001,SourceHeight=4000},Files=o.Lines[0].Personalization!.Files! with {ProductSource=source}}},o.Lines[1]]});
        var response=await f.Staff.GetAsync(f.Route(order,0,"source"));Assert.True(response.IsSuccessStatusCode,await response.Content.ReadAsStringAsync());Assert.Equal(bytes,await response.Content.ReadAsByteArrayAsync());
    }

    [Fact]
    public async Task MissingCorruptOrMismatchedCopiesFailIndependentlyAndNeverFallBack()
    {
        await using var f=await Fixture.Create();var order=await f.Order();
        foreach(var (kind,suffix,bytes,mime) in new[]{("pattern","",f.PatternBytes[0],"image/png"),("source","-source",SingleSourcePurchaseTests.Image(),"image/png"),("composition","-preview",f.Compositions[0],"image/jpeg")})
        {
            var key=SavedDesignStore.OrderFile(order.Id,0)+suffix;
            await f.Files.Save(FileAreas.Designs,key,new MemoryStream([..bytes,0]),mime);
            Assert.Equal(HttpStatusCode.ServiceUnavailable,(await f.Staff.GetAsync(f.Route(order,0,kind))).StatusCode);
            await f.Files.Delete(FileAreas.Designs,key);Assert.Equal(HttpStatusCode.NotFound,(await f.Staff.GetAsync(f.Route(order,0,kind))).StatusCode);
            await f.Files.Save(FileAreas.Designs,key,new MemoryStream(bytes),mime);
            Assert.Equal(HttpStatusCode.OK,(await f.Staff.GetAsync(f.Route(order,0,kind))).StatusCode);
        }
        await f.Accounts.ChangeOrder(f.Owner,order.Id,o=>o with {Lines=[o.Lines[0] with {Personalization=o.Lines[0].Personalization! with {SurfaceBinding=f.Binding with {FulfillmentVariantId="wrong-sku"}}},o.Lines[1]]});
        foreach(var kind in new[]{"pattern","source","composition"})Assert.Equal(HttpStatusCode.ServiceUnavailable,(await f.Staff.GetAsync(f.Route(order,0,kind))).StatusCode);
        Assert.Equal(HttpStatusCode.ServiceUnavailable,(await f.Customer.GetAsync($"/api/v1/me/orders/{order.Id}/lines/0/preview")).StatusCode);
    }

    [Fact]
    public async Task UndecodableNewCompositionIsRejectedBeforeSavingOrPlacingOrder()
    {
        await using var f=await Fixture.Create();var config=f.Configs[0];
        using var invalid=await f.Preview(config,[255,216,255,217]);Assert.Equal(HttpStatusCode.BadRequest,invalid.StatusCode);
        // A broken on-disk preview with a JPEG signature must not pass the new checkout either.
        await f.Files.Save(FileAreas.Designs,$"preview-{config.Id}-{config.Revision}.jpg",new MemoryStream([255,216,255,217]),"image/jpeg");
        using var placed=await f.Place();Assert.Equal(HttpStatusCode.Conflict,placed.StatusCode);Assert.Empty(await f.Accounts.Orders(f.Owner));
    }
    [Fact]
    public async Task CorruptLegacyCompositionIsUnavailableEvenIfItsChecksumWasRecordedOrMissing()
    {
        await using var f=await Fixture.Create();var order=await f.Order();byte[] corrupt=[255,216,255,217];
        await f.Files.Save(FileAreas.Designs,SavedDesignStore.OrderFile(order.Id,0)+"-preview",new MemoryStream(corrupt),"image/jpeg");
        foreach(var recorded in new[]{false,true})
        {
            await f.Accounts.ChangeOrder(f.Owner,order.Id,o=>o with {Lines=[o.Lines[0] with {Personalization=o.Lines[0].Personalization! with {SchemaVersion=1,SurfaceBinding=null,Files=recorded ? order.Lines[0].Personalization!.Files! with {Composition=new(Sha(corrupt),"image/jpeg",corrupt.Length)} : null}},o.Lines[1]]});
            Assert.Equal(HttpStatusCode.ServiceUnavailable,(await f.Staff.GetAsync(f.Route(order,0,"composition"))).StatusCode);
            Assert.Equal(HttpStatusCode.ServiceUnavailable,(await f.Customer.GetAsync($"/api/v1/me/orders/{order.Id}/lines/0/preview")).StatusCode);
        }
    }

}
