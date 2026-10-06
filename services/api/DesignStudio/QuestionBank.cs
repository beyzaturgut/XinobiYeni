using System.Security.Cryptography;
using System.Text.Json;

namespace Xinobi.Api.DesignStudio;

public record DesignAxis(string Id, string Label);
public record BankQuestion(string Id, string Axis, string Text);
public record BankOption(string Id, string Prompt, string[] Labels);
public record BankData(string Version, DesignAxis[] Axes, BankQuestion[] Questions, Dictionary<string, BankOption[]> Options);
public record QuestionOption(string Id, string Label);
public record SessionQuestion(string Id, string Axis, string AxisLabel, string Text, QuestionOption[] Options);
public record DesignAnswer(string QuestionId, string OptionId);

public sealed class QuestionBank
{
    public BankData Data { get; }
    public QuestionBank(IWebHostEnvironment environment)
    {
        Data = JsonSerializer.Deserialize<BankData>(File.ReadAllText(Path.Combine(environment.ContentRootPath, "DesignStudio", "question-bank.json")), new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
        if (Data.Questions.Length < 500 || Data.Questions.Select(q => q.Id).Distinct().Count() != Data.Questions.Length || Data.Questions.Select(q => q.Text).Distinct().Count() != Data.Questions.Length || Data.Axes.Length != 5)
            throw new InvalidDataException("Question bank requires 500 unique questions and five axes.");
        foreach (var axis in Data.Axes)
            if (Data.Questions.Count(q => q.Axis == axis.Id) < 100 || Data.Options[axis.Id].Length < 4 || Data.Options[axis.Id].Any(o => o.Labels.Distinct().Count() < 2))
                throw new InvalidDataException("Every axis needs 100 questions and varied answer wording.");
    }
    public SessionQuestion[] Draw(string[] previousQuestions, Dictionary<string, string> previousLabels)
    {
        return Data.Axes.Select(axis =>
        {
            var pool = Data.Questions.Where(q => q.Axis == axis.Id && !previousQuestions.Contains(q.Id)).ToArray();
            if (pool.Length == 0) pool = Data.Questions.Where(q => q.Axis == axis.Id).ToArray();
            var question = pool[RandomNumberGenerator.GetInt32(pool.Length)];
            var choices = Data.Options[axis.Id].OrderBy(_ => RandomNumberGenerator.GetInt32(int.MaxValue)).Take(4).Select(option =>
            {
                var key = question.Id + ":" + option.Id;
                var labels = option.Labels.Where(label => previousLabels.GetValueOrDefault(key) != label).ToArray();
                var label = labels[RandomNumberGenerator.GetInt32(labels.Length)];
                previousLabels[key] = label;
                return new QuestionOption(option.Id, label);
            }).ToArray();
            return new SessionQuestion(question.Id, axis.Id, axis.Label, question.Text, choices);
        }).OrderBy(_ => RandomNumberGenerator.GetInt32(int.MaxValue)).ToArray();
    }
    public string BuildPrompt(SessionQuestion[] questions, DesignAnswer[] answers)
    {
        if (answers.Length != 5 || answers.Select(a => a.QuestionId).Distinct().Count() != 5)
            throw new ArgumentException("Beş sorunun tamamını yanıtlayın.");
        var preferences = questions.Select(question =>
        {
            var answer = answers.SingleOrDefault(a => a.QuestionId == question.Id);
            if (answer is null || !question.Options.Any(option => option.Id == answer.OptionId)) throw new ArgumentException("Bu oturuma ait geçerli bir seçenek seçin.");
            return Data.Options[question.Axis].Single(o => o.Id == answer.OptionId).Prompt;
        });
        return "Seamless repeating decorative pattern, flat two-dimensional illustration, full-frame original surface texture. " + string.Join(". ", preferences) +
            ". Edge-to-edge graphic pattern, coherent palette, crisp visual forms, even lighting, top-down flat artwork without perspective. The entire image is filled with decorative motifs and their background, a standalone pattern swatch. No text, letters, numbers, logos, signatures, brands, people, faces, copyrighted characters, violent, sexual or hateful imagery.";
    }
}
