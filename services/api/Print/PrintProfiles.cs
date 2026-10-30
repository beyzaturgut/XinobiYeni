using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Xinobi.Api.Catalog;
using Xinobi.Api.Designs;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Print;

public record PrintRect(decimal X, decimal Y, decimal Width, decimal Height);
public record PrintProfileDefinition(string ProductId, string VariantId, string Face, string Title,
    decimal? WidthMm = null, decimal? HeightMm = null, int? Dpi = null, decimal? BleedMm = null, decimal? SafeInsetMm = null,
    string? Process = null, string? ColorSpace = null, string? ColorProfile = null, string? OutputFormat = null, bool? AllowTransparency = null,
    int? SourceWidth = null, int? SourceHeight = null, string? SurfaceVersion = null, PrintRect? ReferenceRectPx = null,
    string? MappingKind = null, string? TemplateReference = null, PrintRect[]? ExclusionsMm = null, string? Notes = null);
public record SavePrintProfile(string? Id, int? ExpectedRevision, PrintProfileDefinition Definition);
public record ActOnPrintProfile(int ExpectedRevision, string EvidenceReference, string Note);
public record PrintProfileRevision(string Id, int Revision, string Status, string Sku, PrintProfileDefinition Definition,
    string ActorId, DateTimeOffset CreatedAt, string? EvidenceReference = null, string? DecisionNote = null);
/// <summary>Production references are copied into configurations/orders, never resolved from a mutable latest profile.</summary>
public record PrintProfileSnapshot(string Id, int Revision, string Sku, PrintProfileDefinition Definition, string Sha256);
public record PrintSetupSnapshot(string Status, PrintProfileSnapshot[] Profiles, bool ProductionReady = false);
public record MeasurePrintPlacement(int SourceWidth, int SourceHeight, string SurfaceVersion, decimal X, decimal Y,
    decimal ArtworkWidthPx, decimal ArtworkHeightPx, decimal Rotation, int ArtworkPixelWidth, int ArtworkPixelHeight);
public record PrintMeasurement(decimal CenterXmm, decimal CenterYmm, decimal WidthMm, decimal HeightMm, decimal DpiX, decimal DpiY,
    int RequiredWidthPx, int RequiredHeightPx, bool FitsSafeArea, bool MeetsDpi, bool IntersectsExclusion, bool ProductionReady = false);

public static class PrintProfileRules
{
    private static void Fail(string message) => throw new ProblemException("invalid_print_profile", message);
    public static void Validate(PrintProfileDefinition? d, bool complete)
    {
        if (d is null) { Fail("Baskı profili bilgilerini girin."); return; }
        static bool Text(string? s, int max, bool required = false) => (!required || !string.IsNullOrWhiteSpace(s)) && (s is null || s.Length <= max && !s.Any(char.IsControl));
        if (!Text(d.ProductId,128,true)||!Text(d.VariantId,128,true)||!Text(d.Title,120,true)||d.Face is not ("front" or "back" or "wrap")) Fail("Ürün, renk, yüz ve profil adını kontrol edin.");
        if (d.WidthMm is <.1m or >2000||d.HeightMm is <.1m or >2000||d.Dpi is <36 or >2400||d.BleedMm is <0 or >100||d.SafeInsetMm is <0 or >100) Fail("mm, DPI ve kenar payları geçerli aralıkta olmalı.");
        if (d.WidthMm is {} w && d.HeightMm is {} h && d.SafeInsetMm is {} margin && (margin*2>=w||margin*2>=h)) Fail("Güvenli alan payı baskı alanını kapatamaz.");
        if (d.SourceWidth is <1 or >6000||d.SourceHeight is <1 or >6000||d.SourceWidth is {} sw && d.SourceHeight is {} sh && (long)sw*sh>20_000_000) Fail("Kaynak önizleme boyutları geçersiz.");
        if (d.SurfaceVersion is not null&&!Regex.IsMatch(d.SurfaceVersion,"^[a-f0-9]{64}$")) Fail("Yüzey sürümü SHA256 olmalı.");
        if (d.ColorSpace is not (null or "RGB" or "CMYK" or "Gray")||d.OutputFormat is not (null or "PNG" or "TIFF" or "PDF")||d.MappingKind is not (null or "planar-reference" or "manual-template")) Fail("Renk, çıktı biçimi veya koordinat eşleme türü geçersiz.");
        if (!Text(d.Process,80)||!Text(d.ColorProfile,160)||!Text(d.TemplateReference,200)||!Text(d.Notes,1000)) Fail("Profil metinlerini ve uzunluklarını kontrol edin.");
        if (d.ReferenceRectPx is {} rect && (rect.X is <0 or >6000||rect.Y is <0 or >6000||rect.Width is <.001m or >6000||rect.Height is <.001m or >6000||rect.X+rect.Width>d.SourceWidth||rect.Y+rect.Height>d.SourceHeight)) Fail("Referans piksel alanı kaynak fotoğrafın içinde olmalı.");
        if (d.ExclusionsMm is {Length:>16}||d.ExclusionsMm?.Any(e=>e is null||e.X is <0 or >2000||e.Y is <0 or >2000||e.Width is <=0 or >2000||e.Height is <=0 or >2000||e.X+e.Width>d.WidthMm||e.Y+e.Height>d.HeightMm)==true) Fail("Baskı dışı bölgeleri alanın içinde tanımlayın (en fazla 16).");
        if (complete && (d.WidthMm is null||d.HeightMm is null||d.Dpi is null||d.BleedMm is null||d.SafeInsetMm is null
            ||d.AllowTransparency is null||d.SourceWidth is null||d.SourceHeight is null||d.SurfaceVersion is null||d.ReferenceRectPx is null
            ||d.MappingKind is null||d.ColorSpace is null||d.OutputFormat is null||!Text(d.Process,80,true)||!Text(d.ColorProfile,160,true)||!Text(d.TemplateReference,200,true))) Fail("Onay için ölçü, üretim, renk, format, yüzey ve kalibrasyon alanlarının tamamını doldurun.");
        if (d.WidthMm is {} width&&d.HeightMm is {} height&&d.Dpi is {} dpi){var bleed=d.BleedMm??0;if ((width+2*bleed)*dpi/25.4m*(height+2*bleed)*dpi/25.4m>200_000_000)Fail("Çıktı çözünürlüğü 200 megapiksel sınırını aşıyor.");}
    }
    public static PrintProfileSnapshot Snapshot(PrintProfileRevision profile)
    {
        var definition=profile.Definition with { Notes=null };
        var sha=Convert.ToHexString(SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(new {profile.Id,profile.Revision,profile.Sku,Definition=definition}))).ToLowerInvariant();
        return new(profile.Id,profile.Revision,profile.Sku,definition,sha);
    }
    public static PrintMeasurement Measure(PrintProfileRevision profile, MeasurePrintPlacement p)
    {
        if(profile.Status!="approved")throw new ProblemException("print_profile_not_approved","Onaylı bir baskı profili seçin.",409);
        var d=profile.Definition;Validate(d,true);
        if(d.MappingKind!="planar-reference")throw new ProblemException("manual_prepress_required","Bu profil üretim şablonunda manuel yerleşim gerektiriyor.",409);
        if(p.SourceWidth!=d.SourceWidth||p.SourceHeight!=d.SourceHeight||p.SurfaceVersion!=d.SurfaceVersion)throw new ProblemException("print_surface_mismatch","Baskı profili bu kaynak yüzeyle eşleşmiyor.",409);
        if(p.ArtworkWidthPx<=0||p.ArtworkHeightPx<=0||p.ArtworkWidthPx>60000||p.ArtworkHeightPx>60000||p.X is < -60000 or >60000||p.Y is < -60000 or >60000||p.Rotation is < -3600 or >3600||p.ArtworkPixelWidth is <1 or >30000||p.ArtworkPixelHeight is <1 or >30000)throw new ProblemException("invalid_print_placement","Fiziksel yerleşim girdilerini kontrol edin.");
        var rect=d.ReferenceRectPx!;var sx=d.WidthMm!.Value/rect.Width;var sy=d.HeightMm!.Value/rect.Height;
        // An anisotropic photo calibration cannot preserve a rotated rectangular artwork's angle/size.
        if(Math.Abs(sx-sy)>.000001m&&p.Rotation%180!=0)throw new ProblemException("manual_prepress_required","Bu kalibrasyonda döndürülmüş görsel manuel üretim kontrolü gerektiriyor.",409);
        var cx=(p.X-rect.X)*sx;var cy=(p.Y-rect.Y)*sy;var w=p.ArtworkWidthPx*sx;var h=p.ArtworkHeightPx*sy;
        var angle=(double)p.Rotation*Math.PI/180;var bw=(decimal)(Math.Abs(Math.Cos(angle))*(double)w+Math.Abs(Math.Sin(angle))*(double)h);var bh=(decimal)(Math.Abs(Math.Sin(angle))*(double)w+Math.Abs(Math.Cos(angle))*(double)h);
        var left=cx-bw/2;var top=cy-bh/2;var margin=d.SafeInsetMm!.Value;
        var fits=left>=margin&&top>=margin&&left+bw<=d.WidthMm-margin&&top+bh<=d.HeightMm-margin;
        var excluded=d.ExclusionsMm?.Any(e=>left<e.X+e.Width&&left+bw>e.X&&top<e.Y+e.Height&&top+bh>e.Y)==true;
        var dx=p.ArtworkPixelWidth*25.4m/w;var dy=p.ArtworkPixelHeight*25.4m/h;
        return new(cx,cy,w,h,dx,dy,(int)Math.Ceiling((d.WidthMm.Value+2*d.BleedMm!.Value)*d.Dpi!.Value/25.4m),(int)Math.Ceiling((d.HeightMm!.Value+2*d.BleedMm.Value)*d.Dpi.Value/25.4m),fits,dx>=d.Dpi&&dy>=d.Dpi,excluded);
    }
}

public sealed class PrintProfileStore(FeatureDocuments documents,ICatalogSource catalog,TimeProvider clock)
{
    private sealed record State(List<PrintProfileRevision> Revisions);
    private readonly DocumentStore<State> store=documents.Open<State>("print/print-profiles.json",()=>new([]),"Baskı profilleri");
    public async Task<PrintProfileRevision[]> List()=>(await store.Read()).Revisions.GroupBy(p=>p.Id).Select(g=>g.MaxBy(p=>p.Revision)!).OrderBy(p=>p.Definition.ProductId).ThenBy(p=>p.Definition.VariantId).ThenBy(p=>p.Definition.Face).ToArray();
    public async Task<PrintProfileRevision> Revision(string id,int revision)=>(await store.Read()).Revisions.FirstOrDefault(p=>p.Id==id&&p.Revision==revision)??throw ProblemException.NotFound("print_profile_not_found","Baskı profili sürümü bulunamadı.");
    private async Task<string> Sku(PrintProfileDefinition d)
    {
        try{var state=await catalog.ReadAsync();var p=state.Products.FirstOrDefault(p=>p.Id==d.ProductId&&p.Active&&p.Personalizable==true);return p?.Variants.FirstOrDefault(v=>v.Id==d.VariantId)?.Sku??throw new ProblemException("print_variant_mismatch","Kişiselleştirilebilir gerçek ürün ve renk seçin.",409);}catch(CatalogUnavailableException){throw ProblemException.Unavailable("Katalog");}
    }
    public async Task<PrintProfileRevision> Save(SavePrintProfile request,string actor)
    {
        PrintProfileRules.Validate(request.Definition,false);var sku=await Sku(request.Definition);
        return await store.Update(state=>{
            var previous=request.Id is null?null:state.Revisions.Where(p=>p.Id==request.Id).MaxBy(p=>p.Revision);
            if(request.Id is not null&&previous is null)throw ProblemException.NotFound("print_profile_not_found","Baskı profili bulunamadı.");
            if(previous is null&&request.ExpectedRevision is not null||previous is not null&&previous.Revision!=request.ExpectedRevision)throw new ProblemException("print_profile_changed","Profil başka bir işlemde değişti. Yeniden yükleyin.",409);
            var d=request.Definition;
            if(previous is not null&&(previous.Definition.ProductId!=d.ProductId||previous.Definition.VariantId!=d.VariantId||previous.Definition.Face!=d.Face))throw new ProblemException("print_variant_mismatch","Mevcut profilin ürün, renk ve yüz kimliği değiştirilemez.",409);
            if(previous is null&&state.Revisions.Any(p=>p.Definition.ProductId==d.ProductId&&p.Definition.VariantId==d.VariantId&&p.Definition.Face==d.Face))throw new ProblemException("print_profile_exists","Bu renk ve yüz için mevcut profili düzenleyin.",409);
            if(state.Revisions.Count>=10000||previous?.Revision>=200)throw new ProblemException("print_profile_limit","Baskı profili kayıt sınırına ulaşıldı.",409);
            var saved=new PrintProfileRevision(previous?.Id??Guid.NewGuid().ToString("N"),(previous?.Revision??0)+1,"draft",sku,d,actor,clock.GetUtcNow());state.Revisions.Add(saved);return saved;
        });
    }
    public async Task<PrintProfileRevision> Decide(string id,ActOnPrintProfile request,string actor,bool approve,DesignSurfaceValidator surfaces)
    {
        if(string.IsNullOrWhiteSpace(request.Note)||request.Note.Length>1000||request.Note.Any(char.IsControl)||string.IsNullOrWhiteSpace(request.EvidenceReference)||request.EvidenceReference.Length>200||request.EvidenceReference.Any(char.IsControl))throw new ProblemException("print_evidence_required","Karar notu ve gerçek kalibrasyon/kabul kaydı referansı girin.");
        var previous=await Revision(id,request.ExpectedRevision);
        if(approve){if(previous.Status!="draft")throw new ProblemException("print_profile_not_draft","Yalnız taslak sürüm onaylanabilir.",409);PrintProfileRules.Validate(previous.Definition,true);var d=previous.Definition;if(await Sku(d)!=previous.Sku)throw new ProblemException("print_variant_mismatch","SKU değişti. Yeni taslak kaydedin.",409);await surfaces.Validate(d.ProductId,d.VariantId,new(d.SourceWidth!.Value,d.SourceHeight!.Value,d.SurfaceVersion!,0,0,1,0,0));}
        return await store.Update(state=>{
            var latest=state.Revisions.Where(p=>p.Id==id).MaxBy(p=>p.Revision);
            if(latest?.Revision!=request.ExpectedRevision)throw new ProblemException("print_profile_changed","Profil başka bir işlemde değişti. Yeniden yükleyin.",409);
            if(state.Revisions.Count>=10000||latest.Revision>=200)throw new ProblemException("print_profile_limit","Baskı profili kayıt sınırına ulaşıldı.",409);
            var next=latest with { Revision=latest.Revision+1,Status=approve?"approved":"retired",ActorId=actor,CreatedAt=clock.GetUtcNow(),EvidenceReference=request.EvidenceReference,DecisionNote=request.Note };state.Revisions.Add(next);return next;
        });
    }
    public async Task<PrintSetupSnapshot> Setup(string product,string variant,DesignPlacement placement)
    {
        var current=(await store.Read()).Revisions.Where(p=>p.Definition.ProductId==product&&p.Definition.VariantId==variant&&p.Status!="draft").GroupBy(p=>p.Id).Select(g=>g.MaxBy(p=>p.Revision)!).Where(p=>p.Status=="approved").ToArray();
        if(current.Length==0)return new("not-configured",[]);
        var state=await catalog.ReadAsync();var sku=state.Products.FirstOrDefault(p=>p.Id==product&&p.Active)?.Variants.FirstOrDefault(v=>v.Id==variant)?.Sku;
        if(current.Any(p=>p.Sku!=sku||p.Definition.SurfaceVersion!=placement.SurfaceVersion||p.Definition.SourceWidth!=placement.SourceWidth||p.Definition.SourceHeight!=placement.SourceHeight))return new("reference-stale",[]);
        return new("reference-ready",current.Select(PrintProfileRules.Snapshot).ToArray());
    }
    public static string CalibrationSvg(PrintProfileRevision p)
    {
        PrintProfileRules.Validate(p.Definition,true);var d=p.Definition;var width=d.WidthMm!.Value;var height=d.HeightMm!.Value;var bleed=d.BleedMm!.Value;var margin=d.SafeInsetMm!.Value;
        static string N(decimal n)=>n.ToString("0.######",CultureInfo.InvariantCulture);
        var xml=new StringBuilder($"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{N(width+2*bleed)}mm\" height=\"{N(height+2*bleed)}mm\" viewBox=\"{N(-bleed)} {N(-bleed)} {N(width+2*bleed)} {N(height+2*bleed)}\"><title>{System.Security.SecurityElement.Escape(p.Id)} r{p.Revision} - Calibration reference, not production artwork</title><rect x=\"{N(-bleed)}\" y=\"{N(-bleed)}\" width=\"{N(width+2*bleed)}\" height=\"{N(height+2*bleed)}\" fill=\"white\"/><rect width=\"{N(width)}\" height=\"{N(height)}\" fill=\"none\" stroke=\"black\" stroke-width=\"0.2\"/><rect x=\"{N(margin)}\" y=\"{N(margin)}\" width=\"{N(width-2*margin)}\" height=\"{N(height-2*margin)}\" fill=\"none\" stroke=\"blue\" stroke-width=\"0.2\" stroke-dasharray=\"1 1\"/>");
        foreach(var e in d.ExclusionsMm??[])xml.Append($"<rect x=\"{N(e.X)}\" y=\"{N(e.Y)}\" width=\"{N(e.Width)}\" height=\"{N(e.Height)}\" fill=\"none\" stroke=\"red\" stroke-width=\"0.2\"/>");
        for(decimal x=0;x<=width;x+=10)xml.Append($"<path d=\"M {N(x)} 0 v 2\" stroke=\"black\" stroke-width=\"0.2\"/>");
        return xml.Append("</svg>").ToString();
    }
}
