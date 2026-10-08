namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;

public sealed class RoboflowSegmentationOptions
{
    public string BaseUrl { get; set; } = "https://serverless.roboflow.com";
    public int TimeoutSeconds { get; set; } = 60;
    public string? ApiKey { get; set; }
}

public sealed class SurfaceSegmentationOptions
{
    public string Provider { get; set; } = "reference";
    public bool ExternalInferenceEnabled { get; set; }
    public bool SingleAutomaticSmokeEnabled { get; set; }
    public bool SingleInteractiveSmokeEnabled { get; set; }
    public string? AutomaticSnapshotPath { get; set; }
    public string? AutomaticMaskPath { get; set; }
    public RoboflowSegmentationOptions Roboflow { get; set; } = new();
}

// Fixed safe codes only. Never retain provider exception, response body or credentials.
public sealed class SegmentationProviderException(string code, int status = 502) : Exception(code)
{
    public int Status { get; } = status;
}

// Step 4B-1 deliberately has NO socket-backed provider composition, even if opted in.
public sealed class OutboundDisabledHandler : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        => throw new SegmentationProviderException("external_inference_unavailable", 503);
}
