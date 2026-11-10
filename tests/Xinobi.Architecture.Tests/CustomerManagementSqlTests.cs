using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Identity;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Architecture.Tests;

public sealed class CustomerManagementSqlTests
{
    sealed class DisposableSqlFactAttribute : FactAttribute
    {
        public DisposableSqlFactAttribute(){if(Environment.GetEnvironmentVariable("XINOBI_CUSTOMER_MANAGEMENT_DISPOSABLE_SQL")!="1")Skip="Requires explicit local SQLEXPRESS opt-in; creates/drops only a fresh customer-management test database.";}
    }
    [DisposableSqlFact]
    public async Task SqlMigrationConcurrencySessionRevocationAuditAndGuardedRollback()
    {
        var name="XinobiCustomerManagementTest_"+Guid.NewGuid().ToString("N");
        var connection=new SqlConnectionStringBuilder {DataSource=@"lpc:.\SQLEXPRESS",InitialCatalog=name,IntegratedSecurity=true,TrustServerCertificate=true};
        var services=new ServiceCollection().AddLogging().AddDbContext<XinobiDbContext>(options=>options.UseSqlServer(connection.ConnectionString)).BuildServiceProvider();
        await using var provider=services;await using var scope=provider.CreateAsyncScope();var db=scope.ServiceProvider.GetRequiredService<XinobiDbContext>();var created=false;
        try
        {
            // The name is generated here; no configured production/user connection can be used.
            await db.GetService<IMigrator>().MigrateAsync("20261013123801_AdminPasswordResetPersistence");created=true;
            await db.Database.MigrateAsync();await db.Database.MigrateAsync();Assert.Equal(10,(await db.Database.GetAppliedMigrationsAsync()).Count());
            var store=new SqlAccountStore(provider.GetRequiredService<IServiceScopeFactory>(),TimeProvider.System);
            var staff=await store.Register("Synthetic staff","sql-staff@example.invalid","synthetic-password");await store.AssignRole(staff.Email,Roles.SuperAdmin);
            var customer=await store.Register("Synthetic customer","sql-customer@example.invalid","synthetic-password");var tokens=await store.IssueTokens(customer.Id);
            var address=await store.SaveAddress(customer.Id,null,new("Test","Synthetic customer","05321234567","İstanbul","Kadıköy","SYNTHETIC TEST",null,true));
            await store.PlaceOrder(customer.Id,"sql-management-order",()=>new(Guid.NewGuid().ToString("N"),"XN-SQL-TEST",DateTimeOffset.UtcNow,"received",address,
                [new("test-product","test-variant","Synthetic","Black",null,new(100,"TRY"),1,new(100,"TRY"))],new(100,"TRY")));
            var detail=await AdminCustomerEndpoints.Details(db,Guid.Parse(customer.Id));
            var outcomes=await Task.WhenAll(Enumerable.Range(0,2).Select(async _=>{try{await store.ManageCustomer(Guid.Parse(customer.Id),"disabled",detail.Customer.Version!,staff.Id,"synthetic-trace");return 200;}catch(AccountException e){return e.Status;}}));
            Assert.Equal(1,outcomes.Count(x=>x==200));Assert.Equal(1,outcomes.Count(x=>x==409));Assert.Null(await store.FindByAccessToken(tokens.AccessToken));
            await Assert.ThrowsAsync<AccountException>(()=>store.Refresh(tokens.RefreshToken));
            await Assert.ThrowsAsync<AccountException>(()=>store.PlaceOrder(customer.Id,"inflight-after-suspension",()=>throw new InvalidOperationException("Inactive customer must not build an order")));
            var current=await AdminCustomerEndpoints.Details(db,Guid.Parse(customer.Id));
            var deleted=await store.ManageCustomer(Guid.Parse(customer.Id),"deleted",current.Customer.Version!,staff.Id,"synthetic-delete");Assert.Equal("deleted",deleted.Customer.Status);
            Assert.Single(await store.Orders(customer.Id));Assert.Single(await store.Addresses(customer.Id));
            Assert.Equal(2,await db.AuditLogs.CountAsync(x=>x.EntityId==customer.Id&&x.Action.StartsWith("customer.")));
            await Assert.ThrowsAnyAsync<Exception>(()=>db.GetService<IMigrator>().MigrateAsync("20261013123801_AdminPasswordResetPersistence"));
            Assert.Equal("deleted",(await AdminCustomerEndpoints.Details(db,Guid.Parse(customer.Id))).Customer.Status);
        }
        finally
        {
            if(created){Assert.StartsWith("XinobiCustomerManagementTest_",db.Database.GetDbConnection().Database);await db.Database.EnsureDeletedAsync();}
        }
    }
}
