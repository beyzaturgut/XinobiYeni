using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Api.Identity;

/// <summary>Transaction-owned application lock serializes challenge/cooldown/grant writes across processes.</summary>
public sealed class SqlAdminMfaStore(IServiceScopeFactory scopes, TimeProvider clock)
{
    private async Task<T> Run<T>(Func<XinobiDbContext,Task<T>> action)
    {
        try
        {
            await using var scope=scopes.CreateAsyncScope();
            var db=scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
            await using var tx=await db.Database.BeginTransactionAsync();
            await db.Database.ExecuteSqlRawAsync("DECLARE @r int; EXEC @r=sys.sp_getapplock @Resource=N'Xinobi.AdminMfa', @LockMode=N'Exclusive', @LockOwner=N'Transaction', @LockTimeout=10000; IF @r<0 THROW 51000, 'MFA lock unavailable', 1;");
            var result=await action(db);
            await db.SaveChangesAsync();
            await tx.CommitAsync();
            return result;
        }
        catch(Exception error) when(error is Microsoft.Data.SqlClient.SqlException or DbUpdateException or InvalidOperationException {InnerException: Microsoft.Data.SqlClient.SqlException})
        {throw new AccountException("mfa_unavailable","MFA deposu şu anda kullanılamıyor.",503);}
    }
    public Task Start(AccountRecord account,string id,string code,Func<Task> send)=>Run(async db=>
    {
        var now=clock.GetUtcNow();var userId=Guid.Parse(account.Id);
        if(await db.AdminMfaChallenges.AnyAsync(x=>x.UserId==userId&&x.CreatedAt>now.AddMinutes(-1)))
            throw new AccountException("mfa_rate_limited","Yeni kod için bir dakika bekle.",429);
        if(await db.AdminMfaChallenges.CountAsync(x=>x.ConsumedAt==null&&x.ExpiresAt>now)>=1000)
            throw new AccountException("mfa_rate_limited","Lütfen daha sonra tekrar dene.",429);
        await send();
        await db.AdminMfaChallenges.Where(x=>x.UserId==userId&&x.ConsumedAt==null).ExecuteUpdateAsync(set=>set.SetProperty(x=>x.ConsumedAt,now));
        db.AdminMfaChallenges.Add(new(){TokenHash=AccountRules.Hash(id),UserId=userId,CodeHash=AccountRules.Hash(id+":"+code),CredentialStamp=AccountRules.Hash(account.PasswordHash),CreatedAt=now,ExpiresAt=now.AddMinutes(10)});
        return true;
    });
    public async Task<(string AccountId,string CredentialStamp)> Consume(string id,string code)
    {
        var proof=await Run<(string,string)?>(async db=>
        {
            var hash=AccountRules.Hash(id);
            var row=await db.AdminMfaChallenges.FirstOrDefaultAsync(x=>x.TokenHash==hash);
            var now=clock.GetUtcNow();
            if(row is null||row.ConsumedAt!=null||row.ExpiresAt<=now||row.Attempts>=5)return null;
            row.Attempts++;
            var correct=code.Length==6&&code.All(char.IsAsciiDigit)&&CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(row.CodeHash),Encoding.ASCII.GetBytes(AccountRules.Hash(id+":"+code)));
            if(correct||row.Attempts==5)row.ConsumedAt=now;
            return correct?(row.UserId.ToString("N"),row.CredentialStamp):null;
        });
        return proof??throw new AccountException("invalid_mfa","Kod geçersiz veya süresi dolmuş.",401);
    }
    public Task Grant(string accountId,IssuedTokens tokens,string? stamp)=>Run(async db=>
    {
        foreach(var item in new[]{(tokens.AccessToken,tokens.AccessTokenExpiresAt),(tokens.RefreshToken,tokens.RefreshTokenExpiresAt)})
        {
            var hash=AccountRules.Hash(item.Item1);
            if(!await db.AdminMfaGrants.AnyAsync(x=>x.TokenHash==hash))db.AdminMfaGrants.Add(new(){TokenHash=hash,UserId=Guid.Parse(accountId),CredentialStamp=stamp,ExpiresAt=item.Item2});
        }
        return true;
    });
    public Task<bool> Allowed(string token,string? accountId,string? stamp)=>Run(async db=>
    {
        var hash=AccountRules.Hash(token);var now=clock.GetUtcNow();
        var grant=await db.AdminMfaGrants.AsNoTracking().FirstOrDefaultAsync(x=>x.TokenHash==hash&&x.ExpiresAt>now);
        return grant!=null&&(accountId is null||grant.UserId==Guid.Parse(accountId))&&(grant.CredentialStamp is null||stamp is null||grant.CredentialStamp==stamp);
    });
}
