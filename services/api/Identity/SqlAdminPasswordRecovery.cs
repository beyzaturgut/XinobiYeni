using Microsoft.EntityFrameworkCore;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Api.Identity;

public sealed class SqlAdminPasswordRecovery(IServiceScopeFactory scopes, TimeProvider clock)
{
    public async Task<bool> Start(AccountRecord account,string token,Func<Task> send)
    {
        try
        {
            await using var scope=scopes.CreateAsyncScope();
            var db=scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
            await using var tx=await db.Database.BeginTransactionAsync();
            // Same registry lock as reset/role/credential operations; shared by all API instances.
            await db.Database.ExecuteSqlRawAsync("DECLARE @r int; EXEC @r=sys.sp_getapplock @Resource=N'Xinobi.Account.Registry', @LockMode=N'Exclusive', @LockOwner=N'Transaction', @LockTimeout=10000; IF @r<0 THROW 51000, 'Account lock unavailable', 1;");
            var now=clock.GetUtcNow();var id=Guid.Parse(account.Id);
            if(await db.AdminPasswordResets.AnyAsync(x=>x.UserId==id&&x.CreatedAt>now.AddMinutes(-1)))return false;
            if(await db.AdminPasswordResets.CountAsync(x=>x.ConsumedAt==null&&x.ExpiresAt>now)>=1000)return false;
            await send();
            await db.AdminPasswordResets.Where(x=>x.UserId==id&&x.ConsumedAt==null).ExecuteUpdateAsync(set=>set.SetProperty(x=>x.ConsumedAt,now));
            db.AdminPasswordResets.Add(new(){TokenHash=AccountRules.Hash(token),UserId=id,RequiredRole=account.RoleCodes.Contains(Roles.SuperAdmin)?Roles.SuperAdmin:Roles.Admin,
                CredentialStamp=AccountRules.Hash(account.PasswordHash),CreatedAt=now,ExpiresAt=now.AddMinutes(10)});
            await db.SaveChangesAsync();await tx.CommitAsync();return true;
        }
        catch(Exception error) when(error is Microsoft.Data.SqlClient.SqlException or DbUpdateException or InvalidOperationException {InnerException:Microsoft.Data.SqlClient.SqlException})
        {throw new AccountException("recovery_unavailable","Kurtarma deposu şu anda kullanılamıyor.",503);}
    }
}
