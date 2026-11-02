using System.Data.Common;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Xinobi.Api.Identity;
using Xinobi.Api.Orders;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;
using System.Text.Json.Nodes;
using Xinobi.Persistence;

namespace Xinobi.Architecture.Tests;

public class AdminSafePushTests
{
    private sealed class NoSql:DbConnectionInterceptor
    {
        public override InterceptionResult ConnectionOpening(DbConnection c,ConnectionEventData e,InterceptionResult r)=>throw new InvalidOperationException("SQL forbidden by admin separation fixture");
        public override ValueTask<InterceptionResult> ConnectionOpeningAsync(DbConnection c,ConnectionEventData e,InterceptionResult r,CancellationToken ct=default)=>throw new InvalidOperationException("SQL forbidden by admin separation fixture");
    }
    private sealed class NoHttp:HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct)=>throw new InvalidOperationException("HTTP forbidden by admin separation fixture");
    }
    private sealed class Factory(string? directory=null):WebApplicationFactory<Program>
    {
        public string Root {get;}=directory??Path.Combine(Path.GetTempPath(),"xinobi-admin-order-separation-"+Guid.NewGuid().ToString("N"));
        protected override void ConfigureWebHost(IWebHostBuilder b)
        {
            b.UseEnvironment("Development");b.ConfigureAppConfiguration((_,c)=>{c.Sources.Clear();c.AddInMemoryCollection(new Dictionary<string,string?>{["LocalCommerce:DataDirectory"]=Root,["LocalCommerce:SeedFile"]=null,["ConnectionStrings:Xinobi"]="",["Catalog:StorageProvider"]="File",["Accounts:StorageProvider"]="File",["Features:StorageProvider"]="File",["Storage:LocalRoot"]=Root,["Email:DeliveryMode"]="Preview",["Notifications:WorkerEnabled"]="false",["DesignStudio:WorkerEnabled"]="false",["Maintenance:WorkerEnabled"]="false",["Assistant:ExternalInferenceEnabled"]="false",["DesignStudio:ExternalInferenceEnabled"]="false"});});
            b.ConfigureServices((context,s)=>
            {
                context.Configuration["ConnectionStrings:Xinobi"]="";context.Configuration["LocalCommerce:DataDirectory"]=Root;context.Configuration["Accounts:StorageProvider"]="File";context.Configuration["Catalog:StorageProvider"]="File";context.Configuration["Features:StorageProvider"]="File";
                s.RemoveAll<XinobiDbContext>();s.RemoveAll<DbContextOptions<XinobiDbContext>>();s.RemoveAll<DbContextOptions>();s.RemoveAll<IDbContextOptionsConfiguration<XinobiDbContext>>();
                s.AddDbContext<XinobiDbContext>(o=>o.UseSqlServer("Server=never-connected.invalid;Database=NeverConnected").AddInterceptors(new NoSql()));
                s.ConfigureHttpClientDefaults(h=>h.ConfigurePrimaryHttpMessageHandler(()=>new NoHttp()));
                foreach(var worker in s.Where(x=>x.ServiceType==typeof(IHostedService)&&x.ImplementationType?.Assembly==typeof(Program).Assembly).ToArray())s.Remove(worker);
            });
        }
    }
    [Fact]
    public async Task LoginMfaSessionLogoutAndForbiddenCustomerKeepTheirContracts()
    {
        await using var f=new Factory();var accounts=f.Services.GetRequiredService<IAccountStore>();var owner=await accounts.Register("Synthetic admin","admin@example.invalid","synthetic-password-123");await accounts.AssignRole(owner.Email,Roles.SuperAdmin);
        using var client=f.CreateClient();client.DefaultRequestHeaders.Add("X-Xinobi-Csrf","1");Assert.Equal(HttpStatusCode.Unauthorized,(await client.GetAsync("/api/v1/admin/session")).StatusCode);
        var login=await client.PostAsJsonAsync("/api/v1/auth/admin/login",new LoginAccount(owner.Email,"synthetic-password-123"));login.EnsureSuccessStatusCode();var challenge=(await login.Content.ReadFromJsonAsync<AdminMfaChallenge>())!;Assert.NotNull(challenge.PreviewCode);
        Assert.Equal(HttpStatusCode.Unauthorized,(await client.PostAsJsonAsync("/api/v1/auth/admin/mfa/verify",new VerifyAdminMfa(challenge.ChallengeId,"wrong"))).StatusCode);
        Assert.Equal(HttpStatusCode.OK,(await client.PostAsJsonAsync("/api/v1/auth/admin/mfa/verify",new VerifyAdminMfa(challenge.ChallengeId,challenge.PreviewCode!))).StatusCode);
        Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/api/v1/admin/session")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,(await client.PostAsJsonAsync("/api/v1/auth/admin/mfa/verify",new VerifyAdminMfa(challenge.ChallengeId,challenge.PreviewCode!))).StatusCode);
        (await client.PostAsJsonAsync("/api/v1/auth/admin/logout",new{})).EnsureSuccessStatusCode();Assert.Equal(HttpStatusCode.Unauthorized,(await client.GetAsync("/api/v1/admin/session")).StatusCode);
        var customer=await accounts.Register("Synthetic customer","customer@example.invalid","synthetic-password-123");using var mine=f.CreateClient();mine.DefaultRequestHeaders.Authorization=new AuthenticationHeaderValue("Bearer",(await accounts.IssueTokens(customer.Id)).AccessToken);Assert.Equal(HttpStatusCode.Forbidden,(await mine.GetAsync("/api/v1/admin/session")).StatusCode);
    }
    [Fact]
    public async Task ExistingPrintProfileConcurrencyAndAuditRemainAvailableWithoutProviders()
    {
        await using var f=new Factory();var local=f.Services.GetRequiredService<LocalCommerceStore>();Directory.CreateDirectory(f.Root);
        var state=new CommerceState([new("p","Synthetic","Fixture",true,"","",[new("v","SKU-fixture","Blue",4,"/assets/fixture.png")],true)],new(){["v"]=1000},new([],"","#000000"),["Fixture"]);
        await File.WriteAllTextAsync(Path.Combine(f.Root,"state.json"),JsonSerializer.Serialize(state,new JsonSerializerOptions(JsonSerializerDefaults.Web)));
        using var client=await TestStaff.Client(f);var definition=new Xinobi.Api.Print.PrintProfileDefinition("p","v","front","Synthetic profile");
        var first=await client.PostAsJsonAsync("/api/v1/admin/print-profiles",new Xinobi.Api.Print.SavePrintProfile(null,null,definition));first.EnsureSuccessStatusCode();var profile=(await first.Content.ReadFromJsonAsync<Xinobi.Api.Print.PrintProfileRevision>())!;
        var updates=await Task.WhenAll(Enumerable.Range(0,2).Select(i=>client.PostAsJsonAsync("/api/v1/admin/print-profiles",new Xinobi.Api.Print.SavePrintProfile(profile.Id,profile.Revision,definition with {Title="Synthetic "+i}))));Assert.Single(updates,x=>x.StatusCode==HttpStatusCode.OK);Assert.Single(updates,x=>x.StatusCode==HttpStatusCode.Conflict);
        var audit=await client.GetStringAsync("/api/v1/local-commerce/audit");Assert.Contains("print-profiles",audit);Assert.DoesNotContain("synthetic-password",audit);
        await using var scope=f.Services.CreateAsyncScope();await Assert.ThrowsAsync<InvalidOperationException>(()=>scope.ServiceProvider.GetRequiredService<XinobiDbContext>().Database.OpenConnectionAsync());using var http=f.Services.GetRequiredService<IHttpClientFactory>().CreateClient();await Assert.ThrowsAsync<InvalidOperationException>(()=>http.GetAsync("https://never-called.invalid"));
    }
}
