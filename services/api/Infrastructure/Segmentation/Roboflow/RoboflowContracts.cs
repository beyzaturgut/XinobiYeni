using System.Text.Json.Serialization;

namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;

internal sealed record RoboflowImage(string Type, string Value);
internal sealed record TextPrompt(string Type, string Text);
internal sealed record AutomaticPayload(RoboflowImage Image, TextPrompt[] Prompts, string Format = "rle");
internal sealed record ProviderPoint(double X, double Y, bool Positive);
internal sealed record PointPrompt(ProviderPoint[] Points);
internal sealed record PointPrompts(PointPrompt[] Prompts);
internal sealed record InteractivePayload(RoboflowImage Image, PointPrompts Prompts, string Format = "rle",
    [property: JsonPropertyName("multimask_output")] bool MultimaskOutput = false);

// Infrastructure evidence only; score is not business or manufacturing approval.
public sealed record ProviderSelectionEvidence(int SelectedOrder, int TotalResults, double? Score, int PromptIndex = 0);
