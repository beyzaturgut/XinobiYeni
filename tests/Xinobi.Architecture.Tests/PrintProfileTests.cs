using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Designs;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Print;

namespace Xinobi.Architecture.Tests;

public sealed class PrintProfileTests
{
    private static PrintProfileDefinition Complete()=>new("DEMO-P101","DEMO-V101-B","front","Synthetic calibration, not a real product profile",
        100,80,300,3,2,"Test-only process","RGB","Synthetic test profile","PNG",false,1200,1000,new string('a',64),new(10,20,1000,800),"planar-reference","TEST-ONLY-REFERENCE",[]);
    private static PrintProfileRevision Approved(PrintProfileDefinition? d=null)=>new(new string('f',32),2,"approved","TEST-SKU",d??Complete(),"test-actor",DateTimeOffset.UtcNow,"TEST-ONLY-EVIDENCE");
    [Fact] public void IncompleteDraftNeverPassesApproval()
    {
        var draft=new PrintProfileDefinition("P","V","front","Draft");PrintProfileRules.Validate(draft,false);
        Assert.Equal("invalid_print_profile",Assert.Throws<ProblemException>(()=>PrintProfileRules.Validate(draft,true)).Code);
        Assert.Equal("invalid_print_profile",Assert.Throws<ProblemException>(()=>PrintProfileRules.Validate(null,true)).Code);
        Assert.Equal("invalid_print_profile",Assert.Throws<ProblemException>(()=>PrintProfileRules.Validate(Complete() with {ReferenceRectPx=new(0,0,.000000001m,100)},true)).Code);
    }
    [Fact] public void MillimetresDpiAndBleedUseCalibratedAreaNotPhotoResolution()
    {
        var p=Approved();var result=PrintProfileRules.Measure(p,new(1200,1000,new string('a',64),510,420,400,200,0,600,300));
        Assert.Equal(50,result.CenterXmm);Assert.Equal(40,result.CenterYmm);Assert.Equal(40,result.WidthMm);Assert.Equal(20,result.HeightMm);
        Assert.Equal(381,result.DpiX);Assert.Equal(381,result.DpiY);Assert.Equal(1252,result.RequiredWidthPx);Assert.Equal(1016,result.RequiredHeightPx);
        Assert.True(result.FitsSafeArea);Assert.True(result.MeetsDpi);Assert.False(result.IntersectsExclusion);Assert.False(result.ProductionReady);
        var low=PrintProfileRules.Measure(p,new(1200,1000,new string('a',64),510,420,400,200,0,80,40));Assert.False(low.MeetsDpi);
    }
    [Fact] public void RotationProtectedAreasAndSurfaceIdentityFailSafely()
    {
        var request=new MeasurePrintPlacement(1200,1000,new string('a',64),510,420,400,200,90,600,300);
        Assert.True(PrintProfileRules.Measure(Approved(),request).FitsSafeArea);
        Assert.False(PrintProfileRules.Measure(Approved(),request with {X=10,Y=20}).FitsSafeArea);
        Assert.True(PrintProfileRules.Measure(Approved(Complete() with {ExclusionsMm=[new(48,38,4,4)]}),request).IntersectsExclusion);
        Assert.Equal("print_surface_mismatch",Assert.Throws<ProblemException>(()=>PrintProfileRules.Measure(Approved(),request with {SurfaceVersion=new string('b',64)})).Code);
        Assert.Equal("manual_prepress_required",Assert.Throws<ProblemException>(()=>PrintProfileRules.Measure(Approved(Complete() with {MappingKind="manual-template"}),request)).Code);
        Assert.Equal("manual_prepress_required",Assert.Throws<ProblemException>(()=>PrintProfileRules.Measure(Approved(Complete() with {ReferenceRectPx=new(10,20,1000,400)}),request)).Code);
        Assert.Equal("invalid_print_placement",Assert.Throws<ProblemException>(()=>PrintProfileRules.Measure(Approved(),request with {X=decimal.MinValue})).Code);
    }
    [Fact] public void UnsafeProfilesAreRejectedAndCalibrationHasPhysicalDimensions()
    {
        foreach(var definition in new[]{Complete() with {SafeInsetMm=50},Complete() with {WidthMm=0},Complete() with {Dpi=0},Complete() with {ReferenceRectPx=new(1000,0,1000,800)},Complete() with {ExclusionsMm=[new(99,0,3,3)]},Complete() with {WidthMm=2000,HeightMm=2000,Dpi=2400},Complete() with {ReferenceRectPx=new(decimal.MaxValue,0,100,100)},Complete() with {ExclusionsMm=[new(0,0,decimal.MaxValue,2)]}})
            Assert.Throws<ProblemException>(()=>PrintProfileRules.Validate(definition,true));
        var svg=PrintProfileStore.CalibrationSvg(Approved());Assert.Contains("width=\"106mm\"",svg);Assert.Contains("height=\"86mm\"",svg);Assert.Contains("viewBox=\"-3 -3 106 86\"",svg);
        var first=PrintProfileRules.Snapshot(Approved());Assert.Equal(64,first.Sha256.Length);Assert.NotEqual(first.Sha256,PrintProfileRules.Snapshot(Approved() with {Revision=3}).Sha256);
    }
    [Fact] public async Task FileStorePersistsRevisionsAndRejectsConcurrentStaleWriters()
    {
        using var factory=new IsolatedApiFactory();using var staff=await TestStaff.Client(factory);var catalog=factory.Services.GetRequiredService<Xinobi.Api.Catalog.ICatalogSource>();var product=(await catalog.ReadAsync()).Products.First(p=>p.Id=="DEMO-P101");(await staff.PutAsJsonAsync("/api/v1/local-commerce/products/"+product.Id,product with {Personalizable=true})).EnsureSuccessStatusCode();var store=factory.Services.GetRequiredService<PrintProfileStore>();
        var first=await store.Save(new(null,null,Complete()),"test");Assert.Equal(1,first.Revision);Assert.Equal("draft",first.Status);
        var outcomes=await Task.WhenAll(Enumerable.Range(0,2).Select(async i=>{try{await store.Save(new(first.Id,1,Complete() with {Title="Writer "+i}),"test");return "ok";}catch(ProblemException e){return e.Code;}}));
        Assert.Single(outcomes,x=>x=="ok");Assert.Single(outcomes,x=>x=="print_profile_changed");Assert.Equal(JsonSerializer.Serialize(first),JsonSerializer.Serialize(await store.Revision(first.Id,1)));
        var reopened=new PrintProfileStore(factory.Services.GetRequiredService<FeatureDocuments>(),factory.Services.GetRequiredService<Xinobi.Api.Catalog.ICatalogSource>(),TimeProvider.System);
        Assert.Equal(2,(await reopened.List()).Single().Revision);
        Assert.Equal("print_variant_mismatch",(await Assert.ThrowsAsync<ProblemException>(()=>store.Save(new(first.Id,2,Complete() with {VariantId="missing"}),"test"))).Code);
        Assert.Equal("print_profile_exists",(await Assert.ThrowsAsync<ProblemException>(()=>store.Save(new(null,null,Complete()),"test"))).Code);
    }
    [Fact] public async Task AdminPermissionBoundariesAreEnforcedOnEveryOperation()
    {
        using var isolated=new IsolatedApiFactory();using var anonymous=isolated.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized,(await anonymous.GetAsync("/api/v1/admin/print-profiles")).StatusCode);
        using var factory=isolated.WithWebHostBuilder(b=>b.ConfigureServices(services=>services.AddTransient<IClaimsTransformation,ReadOnly>()));
        using var staff=await TestStaff.Client(factory);
        Assert.Equal(HttpStatusCode.OK,(await staff.GetAsync("/api/v1/admin/print-profiles")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await staff.PostAsJsonAsync("/api/v1/admin/print-profiles",new SavePrintProfile(null,null,Complete()))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await staff.PostAsJsonAsync("/api/v1/admin/print-profiles/absent/approve",new ActOnPrintProfile(1,"fixture","fixture"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await staff.PostAsJsonAsync("/api/v1/admin/print-profiles/absent/retire",new ActOnPrintProfile(1,"fixture","fixture"))).StatusCode);
    }
    private sealed class ReadOnly:IClaimsTransformation
    {
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal){foreach(var identity in principal.Identities)foreach(var claim in identity.FindAll(PermissionAuthorization.PermissionClaim).Where(c=>c.Value is "print.write" or "print.operate").ToArray())identity.RemoveClaim(claim);return Task.FromResult(principal);}
    }
    [Fact] public async Task RealSurfaceBindingApprovalRetirementAndConfigurationSnapshotsAreImmutable()
    {
        var root=Path.Combine(Path.GetTempPath(),"xinobi-print-calibration-"+Guid.NewGuid());Directory.CreateDirectory(root);
        try{
            using var isolated=new IsolatedApiFactory();using var factory=isolated.WithWebHostBuilder(b=>b.ConfigureAppConfiguration((_,c)=>c.AddInMemoryCollection(new Dictionary<string,string?>{["ProductSurfaces:PublishedRoot"]=root})));
            using var staff=await TestStaff.Client(factory);var catalog=factory.Services.GetRequiredService<Xinobi.Api.Catalog.ICatalogSource>();var state=await catalog.ReadAsync();var product=state.Products.First(p=>p.Id=="DEMO-P101");
            (await staff.PutAsJsonAsync("/api/v1/local-commerce/products/"+product.Id,product with {Personalizable=true})).EnsureSuccessStatusCode();
            byte[] bytes=[1,2,3,4];var sha=Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();var version=Guid.NewGuid().ToString("D");var path=Path.Combine(root,"DEMO-P101","DEMO-V101-B");Directory.CreateDirectory(Path.Combine(path,version));
            await File.WriteAllBytesAsync(Path.Combine(path,version,"source.webp"),bytes);await File.WriteAllBytesAsync(Path.Combine(path,version,"mask.png"),bytes);
            var prefix=$"/assets/product-previews/DEMO-P101/DEMO-V101-B/{version}/";
            await File.WriteAllTextAsync(Path.Combine(path,"inputs.json"),JsonSerializer.Serialize(new {productReference="DEMO-P101",variantReference="DEMO-V101-B",sourceImage=product.Variants.First(v=>v.Id=="DEMO-V101-B").Image,inputs=new{width=1200,height=1000,surfaceVersion=sha,source=new{url=prefix+"source.webp?v="+sha,sha256=sha},mask=new{url=prefix+"mask.png?v="+sha,sha256=sha},branding=(object?)null}}));
            var store=factory.Services.GetRequiredService<PrintProfileStore>();var surfaces=factory.Services.GetRequiredService<DesignSurfaceValidator>();var d=Complete() with {SurfaceVersion=sha};
            var first=await store.Save(new(null,null,d),"fixture");
            Assert.Equal(HttpStatusCode.BadRequest,(await staff.PostAsJsonAsync($"/api/v1/admin/print-profiles/{first.Id}/approve",new ActOnPrintProfile(1,"",""))).StatusCode);
            var approved=await store.Decide(first.Id,new(1,"SYNTHETIC-NOT-PRODUCTION","test calibration"),"fixture",true,surfaces);Assert.Equal(2,approved.Revision);
            using var calibration=await staff.GetAsync($"/api/v1/admin/print-profiles/{first.Id}/revisions/2/calibration.svg");
            calibration.EnsureSuccessStatusCode();Assert.Equal("image/svg+xml",calibration.Content.Headers.ContentType!.MediaType);
            Assert.Equal("nosniff",calibration.Headers.GetValues("X-Content-Type-Options").Single());Assert.Contains("106mm",await calibration.Content.ReadAsStringAsync());
            var placement=new DesignPlacement(1200,1000,sha,510,420,1,0,0,Mode:"artwork");var setup=await store.Setup(d.ProductId,d.VariantId,placement);
            Assert.Equal("reference-ready",setup.Status);Assert.Single(setup.Profiles);Assert.False(setup.ProductionReady);
            var designs=factory.Services.GetRequiredService<SavedDesignStore>();var image=Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==");var design=await designs.Add("owner","upload","Synthetic",d.ProductId,"Product",d.VariantId,"Blue",[],image);
            var config=await designs.SaveConfiguration("owner",design.Id,new(d.VariantId,placement),setup);var frozen=JsonSerializer.Serialize(config.PrintSetup);
            var next=await store.Save(new(first.Id,2,d with {WidthMm=120}),"fixture");Assert.Equal(3,next.Revision);Assert.Equal(2,(await store.Setup(d.ProductId,d.VariantId,placement)).Profiles.Single().Revision);
            await store.Decide(first.Id,new(3,"SYNTHETIC-NEW","test-only updated calibration"),"fixture",true,surfaces);Assert.Equal(4,(await store.Setup(d.ProductId,d.VariantId,placement)).Profiles.Single().Revision);
            Assert.Equal(frozen,JsonSerializer.Serialize((await designs.Configuration("owner",config.Id,config.Revision)).PrintSetup));
            var line=new OrderPersonalization(design.Id,"upload","Synthetic","image/png",PrintSetup:config.PrintSetup);var serialized=JsonSerializer.Serialize(line);
            await store.Decide(first.Id,new(4,"SYNTHETIC-RETIRE","test-only removal"),"fixture",false,surfaces);
            Assert.Equal("not-configured",(await store.Setup(d.ProductId,d.VariantId,placement)).Status);Assert.Equal(serialized,JsonSerializer.Serialize(line));
            Assert.Equal("reference-stale",(await StaleSetup()).Status);
            async Task<PrintSetupSnapshot> StaleSetup(){var newest=await store.Save(new(first.Id,5,d),"fixture");await store.Decide(first.Id,new(newest.Revision,"SYNTHETIC-AGAIN","test-only reapprove"),"fixture",true,surfaces);return await store.Setup(d.ProductId,d.VariantId,placement with {SurfaceVersion=new string('b',64)});}
        }finally{Directory.Delete(root,true);}
    }
}
