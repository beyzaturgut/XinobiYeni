using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.DesignStudio;

namespace Xinobi.Architecture.Tests;

public sealed class DesignArtDirectionTests
{
    private static Dictionary<string, string> Choices(string style = "minimal", string nature = "forest", string visual = "airy", string color = "blue", string mood = "calm") =>
        new() { ["style"] = style, ["nature"] = nature, ["visual"] = visual, ["color"] = color, ["mood"] = mood };

    [Theory]
    [InlineData("minimal", "ocean", "Minimal Graphic")]
    [InlineData("geometry", "mountain", "Geometric Graphic")]
    [InlineData("watercolor", "garden", "Botanical Watercolor")]
    [InlineData("engraving", "forest", "Botanical Engraving")]
    [InlineData("ink", "ocean", "Ink Illustration")]
    [InlineData("abstract", "river", "Fluid Abstract")]
    [InlineData("watercolor", "ocean", "Flowing Watercolor")]
    public void StylesRespectTheSelectedNatureInsteadOfAddingUnrelatedMotifs(string style, string nature, string expected)
    {
        var prompt = DesignArtDirection.Build(Choices(style, nature));
        Assert.Contains("Art direction: " + expected, prompt);
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
        Assert.Contains("at most 3 base colors", prompt);
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
        Assert.Contains("single focal motif", prompt);
        Assert.DoesNotContain("matching opposite edges", prompt);
        Assert.Contains("60-70% quiet background", prompt);
        Assert.Contains("at most 2 base colors", prompt);
        Assert.Contains("Background: white. Main motifs: charcoal.", prompt);
        Assert.DoesNotContain("Sparse accents:", prompt);
        Assert.DoesNotContain("Seamless repeating decorative pattern", prompt);
        Assert.DoesNotContain("entire image is filled", prompt);
    }

    [Theory]
    [InlineData("engraving")]
    [InlineData("ink")]
    [InlineData("watercolor")]
    [InlineData("abstract")]
    public void RichIllustrationsAllowDetailWithoutMinimalOnlyRestrictions(string style)
    {
        var prompt = DesignArtDirection.Build(Choices(style, "ocean", "rich"));
        Assert.Contains("Rich illustration", prompt);
        Assert.Contains("foam crests", prompt);
        Assert.Contains("tonal variations", prompt);
        Assert.DoesNotContain("Minimal styling takes priority", prompt);
        Assert.DoesNotContain("no intricate detail", prompt);
        Assert.DoesNotContain("no texture", prompt);
    }

    [Fact]
    public void WatercolorAndEngravingKeepTheirDistinctTechniquesForBotanicalMotifs()
    {
        var watercolor = DesignArtDirection.Build(Choices("watercolor", "garden", "layer"));
        var engraving = DesignArtDirection.Build(Choices("engraving", "garden", "layer"));
        Assert.Contains("pigment blooms", watercolor);
        Assert.Contains("fine hatching", engraving);
        Assert.DoesNotContain("at most two overlapping shape layers", watercolor);
    }

    [Fact]
    public void PaletteRolesAndRepeatRulesFollowTheAnswers()
    {
        var blue = DesignArtDirection.Build(Choices("watercolor", "ocean", "repeat"));
        Assert.Contains("Background: warm white. Main motifs: navy.", blue);
        Assert.Contains("Supporting forms: ocean blue. Sparse accents: pale blue.", blue);
        Assert.Contains("matching opposite edges", blue);
        Assert.Contains("larger forms set the rhythm", blue);
        var minimal = DesignArtDirection.Build(Choices("scandi", "forest", "asymmetric", "green"));
        Assert.Contains("Background: cream. Main motifs: sage green.", minimal);
        Assert.Contains("Supporting forms: olive.", minimal);
        Assert.DoesNotContain("Sparse accents:", minimal);
        Assert.DoesNotContain("matching opposite edges", minimal);
        Assert.Contains("controlled asymmetry", minimal);
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
            Assert.Contains("Text-free, unlettered, unbranded", prompt);
            Assert.Contains("composed exclusively of the selected nature motifs", prompt);
            Assert.Contains("No text, letters, numbers, typography", prompt);
            Assert.Contains("signatures, initials, dates, logos, watermarks", prompt);
            Assert.Contains("No products, appliances, kitchenware", prompt);
            Assert.Contains("cups, teapots, furniture, interiors, product mockups", prompt);
            Assert.Contains("watermark-free", prompt);
            Assert.DoesNotContain("Xinobi", prompt);
            Assert.DoesNotContain("home appliance collection", prompt);
            Assert.DoesNotContain("for the kitchen", prompt);
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
