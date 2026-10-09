using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Infrastructure.Readiness;

namespace Xinobi.Architecture.Tests;

public sealed class ApiContractTests : IClassFixture<IsolatedApiFactory>, IDisposable
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly string _dataDirectory = Path.Combine(Path.GetTempPath(), "xinobi-health-test-" + Guid.NewGuid());

    public ApiContractTests(IsolatedApiFactory factory)
    {
        _factory = factory.WithWebHostBuilder(builder => builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["LocalCommerce:DataDirectory"] = _dataDirectory,
            ["ConnectionStrings:Xinobi"] = ""
        })));
        _client = _factory
            .WithWebHostBuilder(builder => builder.UseEnvironment("Development"))
            .CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
    }

    [Fact]
    public async Task HealthEndpointReturnsContractAndPreservesRequestId()
    {
        const string requestId = "integration-health-001";
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/health");
        request.Headers.Add(RequestCorrelationMiddleware.HeaderName, requestId);

        using var response = await _client.SendAsync(request);
        using var payload = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(requestId, response.Headers.GetValues(RequestCorrelationMiddleware.HeaderName).Single());
        Assert.Equal("Xinobi.Api", payload.RootElement.GetProperty("service").GetString());
        Assert.Equal("healthy", payload.RootElement.GetProperty("status").GetString());
        Assert.Equal(requestId, payload.RootElement.GetProperty("requestId").GetString());
        Assert.True(payload.RootElement.TryGetProperty("timestampUtc", out _));
    }

    [Fact]
    public async Task LivenessDoesNotDependOnSqlServerConfiguration()
    {
        using var response = await _client.GetAsync("/api/v1/health/live");
        using var payload = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("healthy", payload.RootElement.GetProperty("status").GetString());
    }

    [Fact]
    public async Task ReadinessFailsSafelyWhenSqlServerIsNotConfigured()
    {
        const string requestId = "integration-readiness-001";
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/health/ready");
        request.Headers.Add(RequestCorrelationMiddleware.HeaderName, requestId);

        using var response = await _client.SendAsync(request);
        using var payload = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("not_ready", payload.RootElement.GetProperty("status").GetString());
        Assert.Equal(requestId, payload.RootElement.GetProperty("requestId").GetString());

        var sqlCheck = payload.RootElement.GetProperty("checks")[0];
        Assert.Equal("sqlServer", sqlCheck.GetProperty("name").GetString());
        Assert.False(sqlCheck.GetProperty("isReady").GetBoolean());
        Assert.Equal("sql_not_configured", sqlCheck.GetProperty("code").GetString());

        var rawPayload = payload.RootElement.GetRawText();
        Assert.DoesNotContain("connectionString", rawPayload, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("password", rawPayload, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("server=", rawPayload, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ReadinessSucceedsWhenSqlServerProbeIsReady()
    {
        using var client = _factory
            .WithWebHostBuilder(builder => builder.ConfigureServices(services =>
            {
                services.RemoveAll<ISqlServerReadinessProbe>();
                services.AddSingleton<ISqlServerReadinessProbe>(new ReadySqlServerProbe());
            }))
            .CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });

        using var response = await client.GetAsync("/api/v1/health/ready");
        using var payload = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("ready", payload.RootElement.GetProperty("status").GetString());
        Assert.True(payload.RootElement.GetProperty("checks")[0].GetProperty("isReady").GetBoolean());
        Assert.Equal("ok", payload.RootElement.GetProperty("checks")[0].GetProperty("code").GetString());
    }

    [Fact]
    public async Task UnknownEndpointReturnsProblemDetailsWithRequestId()
    {
        const string requestId = "integration-not-found-001";
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/unknown");
        request.Headers.Add(RequestCorrelationMiddleware.HeaderName, requestId);

        using var response = await _client.SendAsync(request);
        using var payload = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal(404, payload.RootElement.GetProperty("status").GetInt32());
        Assert.Equal(requestId, payload.RootElement.GetProperty("requestId").GetString());
        Assert.True(payload.RootElement.TryGetProperty("timestampUtc", out _));
    }

    [Fact]
    public async Task OpenApiDocumentPublishesHealthEndpoint()
    {
        using var response = await _client.GetAsync("/openapi/v1.json");
        using var payload = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var healthOperation = payload.RootElement
            .GetProperty("paths")
            .GetProperty("/api/v1/health")
            .GetProperty("get");
        var responseSchema = healthOperation
            .GetProperty("responses")
            .GetProperty("200")
            .GetProperty("content")
            .GetProperty("application/json")
            .GetProperty("schema");

        Assert.Equal("#/components/schemas/HealthResponse", responseSchema.GetProperty("$ref").GetString());
        Assert.True(payload.RootElement
            .GetProperty("components")
            .GetProperty("schemas")
            .TryGetProperty("HealthResponse", out _));
        Assert.True(payload.RootElement
            .GetProperty("paths")
            .TryGetProperty("/api/v1/health/live", out _));
        Assert.True(payload.RootElement
            .GetProperty("paths")
            .TryGetProperty("/api/v1/health/ready", out _));
    }

    public void Dispose() { _client.Dispose(); _factory.Dispose(); if (Directory.Exists(_dataDirectory)) Directory.Delete(_dataDirectory, true); }

    private sealed class ReadySqlServerProbe : ISqlServerReadinessProbe
    {
        public Task<ReadinessCheckResult> CheckAsync(CancellationToken cancellationToken) =>
            Task.FromResult(new ReadinessCheckResult(true, "ok"));
    }
}
