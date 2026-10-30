using System.Security.Claims;
using System.Text;
using Microsoft.OpenApi;
using Xinobi.Api.Designs;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Print;

public static class PrintProfileEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        var profiles=admin.MapGroup("/print-profiles").RequirePermission("print.read").WithProblems();
        profiles.MapGet("",async(PrintProfileStore store)=>await store.List()).WithName("ListPrintProfiles");
        profiles.MapGet("/{id}/revisions/{revision:int}",async(string id,int revision,PrintProfileStore store)=>await store.Revision(id,revision)).WithName("GetPrintProfileRevision");
        profiles.MapPost("",async(SavePrintProfile request,ClaimsPrincipal user,PrintProfileStore store)=>await store.Save(request,Id(user))).RequirePermission("print.write").WithName("SavePrintProfileDraft");
        profiles.MapPost("/{id}/approve",async(string id,ActOnPrintProfile request,ClaimsPrincipal user,PrintProfileStore store,DesignSurfaceValidator surfaces)=>await store.Decide(id,request,Id(user),true,surfaces)).RequirePermission("print.operate").WithName("ApprovePrintProfile");
        profiles.MapPost("/{id}/retire",async(string id,ActOnPrintProfile request,ClaimsPrincipal user,PrintProfileStore store,DesignSurfaceValidator surfaces)=>await store.Decide(id,request,Id(user),false,surfaces)).RequirePermission("print.operate").WithName("RetirePrintProfile");
        profiles.MapPost("/{id}/revisions/{revision:int}/measure",async(string id,int revision,MeasurePrintPlacement request,PrintProfileStore store)=>PrintProfileRules.Measure(await store.Revision(id,revision),request)).WithName("MeasurePrintPlacement");
        profiles.MapGet("/{id}/revisions/{revision:int}/calibration.svg",async(string id,int revision,PrintProfileStore store,HttpContext http)=>
        {
            http.Response.Headers["X-Content-Type-Options"]="nosniff";
            return Results.File(Encoding.UTF8.GetBytes(PrintProfileStore.CalibrationSvg(await store.Revision(id,revision))),"image/svg+xml",$"print-calibration-{revision}.svg");
        }).WithName("DownloadPrintCalibration").Produces(200,contentType:"image/svg+xml")
        .AddOpenApiOperationTransformer((operation,_,_)=>
        {
            operation.Responses!["200"]=new OpenApiResponse
            {
                Description="Physical calibration reference only; not production artwork",
                Content=new Dictionary<string,OpenApiMediaType>{["image/svg+xml"]=new(){Schema=new OpenApiSchema{Type=JsonSchemaType.String,Format="binary"}}}
            };
            return Task.CompletedTask;
        });
    }
    private static string Id(ClaimsPrincipal user)=>user.FindFirstValue(ClaimTypes.NameIdentifier)??throw new ProblemException("staff_required","Personel oturumu gerekiyor.",401);
}
