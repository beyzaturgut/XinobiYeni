using Microsoft.Extensions.Configuration;
using Xinobi.Api.DesignStudio;

namespace Xinobi.Architecture.Tests;

public sealed class LocalArtworkInspectorTests
{
    private static string Tsv(string text, string confidence) => "level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext\n5\t1\t1\t1\t1\t1\t0\t0\t30\t10\t" + confidence + "\t" + text;
    [Theory]
    [InlineData("Zo41", "15", true)]
    [InlineData("Zof47", "7.77", true)]
    [InlineData("SIGNATURE", "80", true)]
    [InlineData("2041", "40.5", true)]
    [InlineData("*", "90", false)]
    [InlineData("K", "90", false)]
    [InlineData("--", "90", false)]
    [InlineData("word", "-1", false)]
    public void MarksDoNotNeedHighConfidenceButSingleNoiseCharactersAreIgnored(string text, string confidence, bool expected)
        => Assert.Equal(expected, LocalArtworkInspector.Suspicious(Tsv(text, confidence)));
    [Theory]
    [InlineData("")]
    [InlineData("unexpected output")]
    public void MissingTsvHeaderCannotApproveAnImage(string output)
        => Assert.Equal("artwork_review_unavailable", Assert.Throws<DesignProviderException>(() => LocalArtworkInspector.Suspicious(output)).Code);

    [Fact]
    public async Task MissingExecutableNeverApprovesOrFallsBackToAnExternalService()
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string?> { ["DesignStudio:Ocr:Executable"] = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString(), "missing-tesseract") }).Build();
        var inspector = new LocalArtworkInspector(config);
        Assert.False(inspector.IsConfigured);
        var error = await Assert.ThrowsAsync<DesignProviderException>(() => inspector.InspectAsync(new([1,2,3], "image/png", "test", null), CancellationToken.None));
        Assert.Equal("artwork_review_unavailable", error.Code);
    }
}
