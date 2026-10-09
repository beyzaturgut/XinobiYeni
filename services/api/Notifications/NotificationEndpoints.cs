using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Xinobi.Api.Notifications;

public record RemoveDevice(string Token);
public record NotificationChannelStatus(string Channel, bool Configured);

public static class NotificationEndpoints
{
    public static void MapCustomerNotifications(RouteGroupBuilder me)
    {
        me.MapGet("/notifications", async (ClaimsPrincipal user, NotificationCenter center) => TypedResults.Ok(await center.Inbox(Id(user))))
            .WithName("ListMyNotifications");

        me.MapPost("/notifications/read", async Task<NoContent> (MarkNotificationsRead request, ClaimsPrincipal user, NotificationCenter center) =>
            {
                await center.MarkRead(Id(user), request.Ids);
                return TypedResults.NoContent();
            })
            .WithName("MarkMyNotificationsRead");

        me.MapPost("/devices", async Task<NoContent> (RegisterDevice request, ClaimsPrincipal user, NotificationCenter center) =>
            {
                await center.RegisterDevice(Id(user), request);
                return TypedResults.NoContent();
            })
            .WithName("RegisterMyDevice")
            .ProducesProblem(StatusCodes.Status400BadRequest);

        me.MapPost("/devices/removal", async Task<NoContent> (RemoveDevice request, ClaimsPrincipal user, NotificationCenter center) =>
            {
                await center.RemoveDevice(Id(user), request.Token ?? "");
                return TypedResults.NoContent();
            })
            .WithName("RemoveMyDevice");
    }

    public static void MapPanelNotifications(RouteGroupBuilder panel)
    {
        panel.MapGet("/notifications", async (string? channel, string? status, NotificationCenter center) => TypedResults.Ok(new
        {
            channels = new[] { NotificationChannels.Email, NotificationChannels.Sms, NotificationChannels.Push }.Select(channel => new NotificationChannelStatus(channel, center.Configured(channel))),
            items = await center.Recent(channel, status),
        }));
        panel.MapPost("/notifications/{id}/retry", async (string id, NotificationCenter center) => TypedResults.Ok(await center.Retry(id)));
    }

    private static string Id(ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.NameIdentifier)!;
}
