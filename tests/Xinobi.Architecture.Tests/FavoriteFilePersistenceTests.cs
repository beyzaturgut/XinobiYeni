using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Identity;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Architecture.Tests;

public sealed class FavoriteFilePersistenceTests
{
    [Fact]
    public async Task FavoritesSurviveStoreRecreationRemainOwnedAndAreRemovedWithTheAccount()
    {
        using var factory = new IsolatedApiFactory();
        var store = factory.Services.GetRequiredService<DevFileAccountStore>();
        var first = await store.Register("First", "favorite-first@example.invalid", "test-password-1");
        var second = await store.Register("Second", "favorite-second@example.invalid", "test-password-2");
        await store.AddFavorite(first.Id, "DEMO-P101");
        await store.AddFavorite(first.Id, "DEMO-P101");
        var reopened = new DevFileAccountStore(factory.Services.GetRequiredService<LocalCommerceStore>(), TimeProvider.System);
        Assert.Equal(new[] { "DEMO-P101" }, await reopened.Favorites(first.Id));
        Assert.Empty(await reopened.Favorites(second.Id));
        Assert.False(await reopened.DeleteFavorite(second.Id, "DEMO-P101"));
        Assert.Equal(new[] { "DEMO-P101" }, await reopened.Favorites(first.Id));
        Assert.Single((await reopened.Export()).Favorites!);
        await reopened.AddFavorite(second.Id, "DEMO-P101");
        Assert.True(await reopened.Delete(first.Id, "test-password-1"));
        var finalStore = new DevFileAccountStore(factory.Services.GetRequiredService<LocalCommerceStore>(), TimeProvider.System);
        Assert.Empty(await finalStore.Favorites(first.Id));
        Assert.Equal(new[] { "DEMO-P101" }, await finalStore.Favorites(second.Id));
        Assert.True(await finalStore.DeleteFavorite(second.Id, "DEMO-P101"));
        Assert.False(await finalStore.DeleteFavorite(second.Id, "DEMO-P101"));
    }

    [Fact]
    public async Task FavoriteCookieWritesRequireCsrfAndValidateProducts()
    {
        using var factory = new IsolatedApiFactory();
        using var client = factory.CreateClient();
        var store = factory.Services.GetRequiredService<IAccountStore>();
        var account = await store.Register("Customer", "favorite-cookie@example.invalid", "test-password-1");
        client.DefaultRequestHeaders.Add(WebSessionCookies.CsrfHeader, "1");
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/web/login", new LoginAccount(account.Email, "test-password-1"))).StatusCode);
        client.DefaultRequestHeaders.Remove(WebSessionCookies.CsrfHeader);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/me/favorites", new AddFavorite("DEMO-P101"))).StatusCode);
        client.DefaultRequestHeaders.Add(WebSessionCookies.CsrfHeader, "1");
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/v1/me/favorites", new AddFavorite(new string('a', 129)))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync("/api/v1/me/favorites", new AddFavorite("not-a-product"))).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await client.PostAsJsonAsync("/api/v1/me/favorites", new AddFavorite("DEMO-P101"))).StatusCode);
        client.DefaultRequestHeaders.Remove(WebSessionCookies.CsrfHeader);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.DeleteAsync("/api/v1/me/favorites/DEMO-P101")).StatusCode);
        Assert.Equal(new[] { "DEMO-P101" }, await store.Favorites(account.Id));
        client.DefaultRequestHeaders.Add(WebSessionCookies.CsrfHeader, "1");
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/api/v1/me/favorites/DEMO-P101")).StatusCode);
        Assert.Empty(await store.Favorites(account.Id));
    }
}
