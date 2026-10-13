using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.DesignStudio;

namespace Xinobi.Architecture.Tests;

public sealed class DesignArtDirectionTests
{
    private static Dictionary<string, string> Choices(string style = "minimal", string nature = "forest", string visual = "airy", string color = "blue", string mood = "calm") =>
        new() { ["style"] = style, ["nature"] = nature, ["visual"] = visual, ["color"] = color, ["mood"] = mood };

    [Theory]
    [InlineData("minimal", "ocean", "Simple Geometry")]
    [InlineData("geometry", "mountain", "Simple Geometry")]
    [InlineData("watercolor", "garden", "Elegant Botanical")]
    [InlineData("engraving", "forest", "Elegant Botanical")]
    [InlineData("ink", "ocean", "Japanese Inspired")]
    [InlineData("abstract", "river", "Fluid Abstract")]
    [InlineData("watercolor", "ocean", "Fluid Abstract")]
    public void StylesRespectTheSelectedNatureInsteadOfAddingUnrelatedMotifs(string style, string nature, string expected)
    {
        var prompt = DesignArtDirection.Build(Choices(style, nature));
        Assert.Contains("Art direction: Xinobi " + expected, prompt);
        if (nature == "ocean")
        {
            Assert.Contains("wave contours", prompt);
            Assert.DoesNotContain("petal", prompt);
        }
    }

    [Theory]
    [InlineData("minimal", "rich")]
    [InlineData("minimal", "layer")]
    [InlineData("scandi", "rich")]
    public void RichOrLayeredAnswersCannotCancelMinimalStyling(string style, string visual)
    {
        var prompt = DesignArtDirection.Build(Choices(style, visual: visual, color: "jewel", mood: "energetic"));
        Assert.Contains("at most 3 ink colors", prompt);
        Assert.Contains("45-55% quiet background", prompt);
        Assert.Contains("at most one shape layer", prompt);
        Assert.DoesNotContain("gold-colored", prompt);
        Assert.DoesNotContain("dense", prompt);
    }

    [Fact]
    public void FocalCompositionAndMonochromeRemainExplicitEvenWithBoldMood()
    {
        var prompt = DesignArtDirection.Build(Choices("abstract", visual: "focal", color: "mono", mood: "bold"));
        Assert.Contains("one dominant motif", prompt);
        Assert.Contains("no repeated focal motifs or forced seamless tiling", prompt);
        Assert.Contains("60-70% quiet background", prompt);
        Assert.Contains("at most 2 ink colors", prompt);
        Assert.Contains("no colored accents", prompt);
        Assert.DoesNotContain("Seamless repeating decorative pattern", prompt);
        Assert.DoesNotContain("entire image is filled", prompt);
    }

    [Fact]
    public void EveryQuestionnaireCombinationHasRulesAndFitsTheProviderPromptLimit()
    {
        using var factory = new IsolatedApiFactory();
        using var client = factory.CreateClient();
        var bank = factory.Services.GetRequiredService<QuestionBank>();
        foreach (var nature in bank.Data.Options["nature"])
        foreach (var mood in bank.Data.Options["mood"])
        foreach (var color in bank.Data.Options["color"])
        foreach (var visual in bank.Data.Options["visual"])
        foreach (var style in bank.Data.Options["style"])
        {
            var prompt = DesignArtDirection.Build(Choices(style.Id, nature.Id, visual.Id, color.Id, mood.Id));
            Assert.InRange(prompt.Length, 1, 2048);
            Assert.Contains("No text, letters, numbers, logos", prompt);
        }
    }

    [Fact]
    public void PromptIsIndependentOfQuestionOrderAndRandomLabelsAndRejectsWrongAxes()
    {
        using var factory = new IsolatedApiFactory();
        using var client = factory.CreateClient();
        var bank = factory.Services.GetRequiredService<QuestionBank>();
        var choices = Choices();
        var questions = bank.Data.Axes.Select(axis => new SessionQuestion(axis.Id + "-test", axis.Id, axis.Label, "Soru", bank.Data.Options[axis.Id].Select(option => new QuestionOption(option.Id, option.Labels[0])).ToArray())).ToArray();
        var answers = questions.Select(q => new DesignAnswer(q.Id, choices[q.Axis])).ToArray();
        var expected = bank.BuildPrompt(questions, answers);
        Assert.Equal(expected, bank.BuildPrompt(questions.Reverse().Select(q => q with { Options = q.Options.Select(o => o with { Label = "Başka ifade" }).ToArray() }).ToArray(), answers.Reverse().ToArray()));
        Assert.Throws<ArgumentException>(() => bank.BuildPrompt(questions.Select(q => q with { Axis = "style" }).ToArray(), answers));
        Assert.Throws<ArgumentException>(() => bank.BuildPrompt(questions, answers.Select(a => a with { OptionId = "free-form-prompt" }).ToArray()));
    }
}
