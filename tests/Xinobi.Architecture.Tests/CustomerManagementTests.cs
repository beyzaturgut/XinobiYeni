using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Architecture.Tests;

public sealed class CustomerManagementTests
{
    const string Root="/api/v1/admin/customers";
    static async Task<AdminCustomerDetails> Detail(HttpClient client,string id) => (await client.GetFromJsonAsync<AdminCustomerDetails>(Root+"/"+id))!;
    static async Task<AdminCustomerDetails> Change(HttpClient client,AdminCustomerDetails detail,string status)
    {
        using var response=await client.PostAsJsonAsync(Root+"/"+detail.Customer.Id+(status=="deleted"?"/delete":"/access"),new {status,expectedVersion=detail.Customer.Version});
        Assert.True(response.IsSuccessStatusCode,await response.Content.ReadAsStringAsync());return (await response.Content.ReadFromJsonAsync<AdminCustomerDetails>())!;
    }
    [Fact]
    public async Task SuspendReactivateAndDeleteRevokeSessionsAndPreserveOrdersAndAudit()
    {
        await using var f=new IsolatedApiFactory();using var staff=await TestStaff.Client(f);using var customer=f.CreateClient();
        var store=f.Services.GetRequiredService<IAccountStore>();var account=await store.Register("Synthetic Customer","managed@example.invalid","synthetic-password");
        var tokens=await store.IssueTokens(account.Id);customer.DefaultRequestHeaders.Authorization=new AuthenticationHeaderValue("Bearer",tokens.AccessToken);
        var addr=await store.SaveAddress(account.Id,null,new("Test","Synthetic Customer","05321234567","İstanbul","Kadıköy","SYNTHETIC TEST",null,true));
        var orderResponse=await customer.PostAsJsonAsync("/api/v1/me/orders",new PlaceOrder(addr.Id,[new("DEMO-P101","DEMO-V101-B",1)],"managed-customer-order"));
        orderResponse.EnsureSuccessStatusCode();var before=JsonSerializer.Serialize(await store.Orders(account.Id));
        var detail=await Detail(staff,account.Id);Assert.Equal(1,detail.Customer.OrderCount);Assert.DoesNotContain(account.Email,detail.Customer.Email);
        var suspended=await Change(staff,detail,"disabled");Assert.Equal("disabled",suspended.Customer.Status);Assert.NotEqual(detail.Customer.Version,suspended.Customer.Version);
        Assert.Null(await store.Login(account.Email,"synthetic-password"));Assert.Null(await store.FindByAccessToken(tokens.AccessToken));
        await Assert.ThrowsAsync<AccountException>(()=>store.Refresh(tokens.RefreshToken));await Assert.ThrowsAsync<AccountException>(()=>store.IssueTokens(account.Id));
        Assert.Equal(HttpStatusCode.Unauthorized,(await customer.GetAsync("/api/v1/me")).StatusCode);
        var built=false;await Assert.ThrowsAsync<AccountException>(()=>store.PlaceOrder(account.Id,"inflight-after-suspension",()=>{built=true;throw new InvalidOperationException("Inactive customer must not build an order");}));Assert.False(built);
        Assert.Equal(HttpStatusCode.Conflict,(await staff.PostAsJsonAsync(Root+"/"+account.Id+"/access",new ChangeCustomerAccess("active",detail.Customer.Version!))).StatusCode);
        var activated=await Change(staff,suspended,"active");Assert.NotNull(await store.Login(account.Email,"synthetic-password"));Assert.Null(await store.FindByAccessToken(tokens.AccessToken));
        var fresh=await store.IssueTokens(account.Id);var deleted=await Change(staff,activated,"deleted");Assert.Equal("deleted",deleted.Customer.Status);
        Assert.Null(await store.Login(account.Email,"synthetic-password"));Assert.Null(await store.FindByAccessToken(fresh.AccessToken));
        await Assert.ThrowsAsync<AccountException>(()=>store.Refresh(fresh.RefreshToken));
        Assert.Equal(HttpStatusCode.Conflict,(await staff.PostAsJsonAsync(Root+"/"+account.Id+"/access",new ChangeCustomerAccess("active",deleted.Customer.Version!))).StatusCode);
        Assert.Equal(before,JsonSerializer.Serialize(await store.Orders(account.Id)));Assert.Single(await store.Addresses(account.Id));
        var folder=f.Services.GetRequiredService<LocalCommerceStore>().DataDirectory;
        var json=JsonDocument.Parse(await File.ReadAllTextAsync(Path.Combine(folder,"identity/accounts.json")));
        var audit=json.RootElement.GetProperty("customerManagementAudits");Assert.Equal(3,audit.GetArrayLength());
        Assert.DoesNotContain(account.Email,audit.GetRawText());Assert.DoesNotContain("synthetic-password",audit.GetRawText());
        Assert.All(audit.EnumerateArray(),entry=>Assert.NotEmpty(entry.GetProperty("actorId").GetString()!));
    }
    [Fact]
    public async Task StaffAccountsAreNeverTargetsAndConcurrentStaleActionsCannotBothSucceed()
    {
        await using var f=new IsolatedApiFactory();using var staff=await TestStaff.Client(f);var store=f.Services.GetRequiredService<IAccountStore>();
        var owner=await store.Register("Staff","staff-target@example.invalid","synthetic-password");await store.AssignRole(owner.Email,Roles.Admin);
        Assert.Equal(HttpStatusCode.NotFound,(await staff.GetAsync(Root+"/"+owner.Id)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await staff.PostAsJsonAsync(Root+"/"+owner.Id+"/delete",new DeleteManagedCustomer("not-used"))).StatusCode);
        var user=await store.Register("Customer","race@example.invalid","synthetic-password");var detail=await Detail(staff,user.Id);
        var responses=await Task.WhenAll(Enumerable.Range(0,2).Select(_=>staff.PostAsJsonAsync(Root+"/"+user.Id+"/access",new ChangeCustomerAccess("disabled",detail.Customer.Version!))));
        Assert.Single(responses,x=>x.StatusCode==HttpStatusCode.OK);Assert.Single(responses,x=>x.StatusCode==HttpStatusCode.Conflict);
        var rows=(await staff.GetFromJsonAsync<AdminCustomerPage>(Root))!.Items;Assert.DoesNotContain(rows,x=>x.Id.ToString("N")==owner.Id);
    }
    [Fact]
    public async Task FixtureFilesAndGenerationJobsNeverUseTheLocalRecoveryDirectory()
    {
        await using var f=new IsolatedApiFactory();var directory=f.Services.GetRequiredService<LocalCommerceStore>().DataDirectory;
        var config=f.Services.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>();
        Assert.StartsWith(Path.GetTempPath(),directory);Assert.Equal(directory,config["Storage:LocalRoot"]);
        Assert.Equal(Path.Combine(directory,"design-studio"),config["DesignStudio:DataDirectory"]);
        Assert.Equal("false",config["DesignStudio:ExternalInferenceEnabled"]);
    }
    sealed class ReadOnlyClaims : IClaimsTransformation
    {
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal){foreach(var i in principal.Identities)foreach(var c in i.FindAll(PermissionAuthorization.PermissionClaim).Where(x=>x.Value is "customers.write" or "customers.delete").ToArray())i.RemoveClaim(c);return Task.FromResult(principal);}
    }
    [Fact]
    public async Task AccessAndDeleteRequireStaffMfaAndTheirOwnPermissions()
    {
        await using var f=new IsolatedApiFactory();using var anonymous=f.CreateClient();var store=f.Services.GetRequiredService<IAccountStore>();
        var customer=await store.Register("Customer","denied@example.invalid","synthetic-password");var path=Root+"/"+customer.Id;
        Assert.Equal(HttpStatusCode.Unauthorized,(await anonymous.PostAsJsonAsync(path+"/delete",new DeleteManagedCustomer("v"))).StatusCode);
        var tokens=await store.IssueTokens(customer.Id);anonymous.DefaultRequestHeaders.Authorization=new("Bearer",tokens.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden,(await anonymous.PostAsJsonAsync(path+"/access",new ChangeCustomerAccess("disabled","v"))).StatusCode);
        await store.AssignRole(customer.Email,Roles.Admin);tokens=await store.IssueTokens(customer.Id);anonymous.DefaultRequestHeaders.Authorization=new("Bearer",tokens.AccessToken);
        Assert.Equal(HttpStatusCode.Unauthorized,(await anonymous.PostAsJsonAsync(path+"/delete",new DeleteManagedCustomer("v"))).StatusCode);
        await using var limited=new IsolatedApiFactory().WithWebHostBuilder(b=>b.ConfigureTestServices(s=>s.AddTransient<IClaimsTransformation,ReadOnlyClaims>()));
        using var reader=await TestStaff.Client(limited);var account=await limited.Services.GetRequiredService<IAccountStore>().Register("Customer","reader-target@example.invalid","synthetic-password");
        Assert.Equal(HttpStatusCode.OK,(await reader.GetAsync(Root)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await reader.PostAsJsonAsync(Root+"/"+account.Id+"/access",new ChangeCustomerAccess("disabled","v"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await reader.PostAsJsonAsync(Root+"/"+account.Id+"/delete",new DeleteManagedCustomer("v"))).StatusCode);
    }
    [Fact]
    public async Task WritePermissionCannotInvokeDeleteThroughStatusEndpointAndMissingVersionFails()
    {
        await using var f=new IsolatedApiFactory();using var staff=await TestStaff.Client(f);var store=f.Services.GetRequiredService<IAccountStore>();var user=await store.Register("Customer","invalid@example.invalid","synthetic-password");
        var d=await Detail(staff,user.Id);
        Assert.Equal(HttpStatusCode.BadRequest,(await staff.PostAsJsonAsync(Root+"/"+user.Id+"/access",new ChangeCustomerAccess("deleted",d.Customer.Version!))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest,(await staff.PostAsJsonAsync(Root+"/"+user.Id+"/delete",new DeleteManagedCustomer(""))).StatusCode);
        Assert.Equal("active",(await store.FindById(user.Id))!.Status);
    }
    [Fact]
    public async Task FileWriteFailureDoesNotRevokeOrChangeAccountOrRecordSuccessfulAudit()
    {
        await using var f=new IsolatedApiFactory();using var staff=await TestStaff.Client(f);var store=f.Services.GetRequiredService<IAccountStore>();var user=await store.Register("Customer","failure@example.invalid","synthetic-password");var token=await store.IssueTokens(user.Id);var d=await Detail(staff,user.Id);
        var file=Path.Combine(f.Services.GetRequiredService<LocalCommerceStore>().DataDirectory,"identity/accounts.json");var before=await File.ReadAllTextAsync(file);Directory.CreateDirectory(file+".tmp");
        var result=await staff.PostAsJsonAsync(Root+"/"+user.Id+"/access",new ChangeCustomerAccess("disabled",d.Customer.Version!));Assert.Equal(HttpStatusCode.ServiceUnavailable,result.StatusCode);
        Assert.Equal(before,await File.ReadAllTextAsync(file));Assert.NotNull(await store.FindByAccessToken(token.AccessToken));
    }
    sealed class WithoutDelete : IClaimsTransformation
    {
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal){foreach(var i in principal.Identities)foreach(var c in i.FindAll(PermissionAuthorization.PermissionClaim).Where(x=>x.Value=="customers.delete").ToArray())i.RemoveClaim(c);return Task.FromResult(principal);}
    }
    [Fact]
    public async Task DeletePermissionIsIndependentOfCustomerWrite()
    {
        await using var f=new IsolatedApiFactory().WithWebHostBuilder(b=>b.ConfigureTestServices(s=>s.AddTransient<IClaimsTransformation,WithoutDelete>()));
        using var staff=await TestStaff.Client(f);var user=await f.Services.GetRequiredService<IAccountStore>().Register("Customer","write-only@example.invalid","synthetic-password");var d=await Detail(staff,user.Id);
        Assert.Equal(HttpStatusCode.Forbidden,(await staff.PostAsJsonAsync(Root+"/"+user.Id+"/delete",new DeleteManagedCustomer(d.Customer.Version!))).StatusCode);
        Assert.Equal("disabled",(await Change(staff,d,"disabled")).Customer.Status);
    }
    sealed class SqlGuardStaff(Microsoft.Extensions.Options.IOptionsMonitor<AuthenticationSchemeOptions> options,Microsoft.Extensions.Logging.ILoggerFactory logs,System.Text.Encodings.Web.UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options,logs,encoder)
    {
        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var identity=new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier,Guid.Empty.ToString()),new Claim(PermissionAuthorization.AccountKindClaim,AccountKinds.Staff),..PermissionAuthorization.ClaimsFor([Roles.SuperAdmin])],Scheme.Name);
            return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity),Scheme.Name)));
        }
    }
    [Fact]
    public async Task ExplicitSqlFailureCannotFallBackToTheFileDirectory()
    {
        await using var f=new IsolatedApiFactory().WithWebHostBuilder(b=>b.ConfigureTestServices(s=>{
            s.RemoveAll<IAccountStore>();s.AddSingleton<IAccountStore>(p=>p.GetRequiredService<SqlAccountStore>());
            s.AddAuthentication(o=>{o.DefaultAuthenticateScheme="SqlGuardFixture";o.DefaultChallengeScheme="SqlGuardFixture";}).AddScheme<AuthenticationSchemeOptions,SqlGuardStaff>("SqlGuardFixture",null);
        }));
        await f.Services.GetRequiredService<DevFileAccountStore>().Register("Local only","file-only@example.invalid","synthetic-password");
        using var client=f.CreateClient();using var response=await client.GetAsync(Root);
        Assert.Equal(HttpStatusCode.ServiceUnavailable,response.StatusCode);Assert.Contains("admin_sql_unavailable",await response.Content.ReadAsStringAsync());
    }
    [Fact]
    public void SqlProjectionUsesConcurrencyWithoutCredentials()
    {
        using var db=new XinobiDbContext(new DbContextOptionsBuilder<XinobiDbContext>().UseSqlServer("Server=unused;Database=unused").Options);
        var sql=AdminCustomerEndpoints.Project(db,AdminCustomerEndpoints.Customers(db)).ToQueryString();
        Assert.Contains("RowVersion",sql);Assert.DoesNotContain("PasswordHash",sql);
    }
}
