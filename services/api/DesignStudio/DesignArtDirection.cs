namespace Xinobi.Api.DesignStudio;

/// <summary>Server-owned art direction. The questionnaire's stable option IDs, not random labels or question order, select the rules.</summary>
public static class DesignArtDirection
{
    public const string Version = "xinobi-art-direction-5";

    private static readonly Dictionary<string, string> Motifs = new()
    {
        ["forest"] = "elongated leaves on slender branching stems, larger foliage supported by smaller leaf shapes",
        ["ocean"] = "broad curling wave contours, layered flowing currents and fine foam crests",
        ["mountain"] = "mountain ridgelines and layered rocky contours",
        ["desert"] = "rolling dune ribbons and wind-shaped sand contours",
        ["garden"] = "expressive blossoms on fine botanical stems, larger petals supported by smaller buds",
        ["sky"] = "airy cloud curves and sweeping sky currents",
        ["river"] = "meandering river ribbons and rounded pebble forms",
        ["cosmos"] = "orbital arcs and star-like points"
    };

    // Ordered palette: the color limit takes precedence over the remaining optional colors.
    private static readonly Dictionary<string, string[]> Palettes = new()
    {
        ["neutral"] = ["ivory", "charcoal", "warm grey"],
        ["earth"] = ["cream", "terracotta", "sand", "burnt umber"],
        ["blue"] = ["warm white", "navy", "ocean blue", "pale blue"],
        ["pastel"] = ["ivory", "dusty rose", "lavender", "powder blue"],
        ["warm"] = ["peach", "muted red", "amber", "coral"],
        ["green"] = ["cream", "sage green", "olive", "moss"],
        ["jewel"] = ["sapphire", "emerald", "amethyst", "muted gold-colored ink"],
        ["mono"] = ["white", "charcoal"]
    };

    private static readonly Dictionary<string, string> Moods = new()
    {
        ["calm"] = "low contrast, gentle spacing and unhurried visual rhythm",
        ["joy"] = "rounded forms, light accents and a playful rhythm within the chosen palette",
        ["bold"] = "clear silhouette contrast and confident strokes within the chosen motif family and palette",
        ["dream"] = "soft transitions and floating forms; keep edges readable",
        ["nostalgia"] = "warm matte ink character and subtly rounded edges with clean, readable contours",
        ["curious"] = "small variations in orientation and scale within one motif family",
        ["balanced"] = "even visual weight, consistent spacing and measured contrast",
        ["energetic"] = "directional movement and lively spacing within the chosen motif family and palette"
    };

    private static readonly Dictionary<string, string> Compositions = new()
    {
        ["airy"] = "Sparse layout: 65-75% quiet background, widely separated motifs, at most two motif sizes",
        ["balanced"] = "Balanced layout: 40-50% quiet background, even spacing, one dominant motif family",
        ["rich"] = "Rich layout: 20-30% quiet background, structured motif clusters, clear spacing between clusters; open channels separate the clusters",
        ["focal"] = "Focal layout: one dominant motif in the central half, 60-70% quiet background; supporting forms stay subordinate to the single focal motif",
        ["flow"] = "Flow layout: 40-50% quiet background, two or three broad diagonal paths, consistent gaps between curves",
        ["repeat"] = "Repeat layout: 40-50% quiet background, a regular seamless tile with matching opposite edges, consistent motif spacing",
        ["asymmetric"] = "Asymmetric layout: 45-55% quiet background, offset motif clusters balanced by open space; deliberate variation in position and scale",
        ["layer"] = "Layered layout: 30-40% quiet background, translucent overlapping shapes with readable boundaries and depth through color"
    };

    public static string Build(IReadOnlyDictionary<string, string> answers)
    {
        var nature = answers["nature"];
        var style = answers["style"];
        var visual = answers["visual"];
        var minimal = style is "minimal" or "scandi";
        var botanical = nature is "forest" or "garden";
        var direction = style switch
        {
            "minimal" => "Minimal Graphic: precise silhouettes, deliberate spacing and refined matte shapes",
            "geometry" => "Geometric Graphic: precise shapes and rhythmic interlocking contours",
            "scandi" when botanical => "Elegant Botanical: slender stems, elongated leaves, controlled asymmetry and carefully spaced organic forms",
            "scandi" => "Scandinavian Graphic: softly rounded organic shapes and quiet spacing",
            "watercolor" when botanical => "Botanical Watercolor: expressive petals and foliage with delicate pigment washes",
            "watercolor" => "Flowing Watercolor: fluid natural forms and luminous layered washes",
            "engraving" when botanical => "Botanical Engraving: detailed leaves, veins and finely drawn stems",
            "engraving" => "Illustrative Engraving: intricate flowing contours and rhythmic fine linework",
            "ink" => "Ink Illustration: graceful hand-drawn contours and expressive brushwork",
            "retro" => "Mid-century Graphic: rounded silhouettes, rhythmic shapes and confident color blocks",
            "abstract" => "Fluid Abstract: expressive natural shapes and layered sweeping contours",
            _ => throw new ArgumentException("Bu tarz için tasarım kuralları tanımlı değil.")
        };
        // Detail follows both style and density; rich illustration must not inherit minimal-only rules.
        var detailed = !minimal && (visual is "rich" or "layer");
        var treatment = style switch
        {
            "minimal" => "Flat fills, consistent fine outlines and refined simple shapes",
            "geometry" => "Crisp geometric edges, balanced proportions and consistent fine line weight",
            "scandi" => "Matte fills, slender stems, controlled fine line weight and refined organic contours",
            "retro" => "Refined mid-century proportions and subtle printed pigment texture",
            "watercolor" => "Visible pigment blooms, translucent washes and soft painted edges",
            "ink" => detailed ? "Intricate ink contours, varied line weight and flowing brush accents" : "Economical fine ink contours and one expressive brush accent",
            "engraving" => detailed ? "Detailed engraved linework, fine hatching and layered contours" : "Fine engraved contours and selective interior hatching",
            "abstract" => "Expressive painted shapes, layered color and controlled textural variation",
            _ => throw new ArgumentException("Bu tarz için tasarım kuralları tanımlı değil.")
        };
        var palette = Palettes[answers["color"]].Take(minimal ? 3 : 4).ToArray();
        // A density choice changes placement without cancelling a request for minimal styling.
        var composition = minimal && (visual is "rich" or "layer")
            ? "Structured minimal layout: 45-55% quiet background, a richer rhythm of simple motifs, one motif family and at most one shape layer; simple silhouettes carry the rhythm"
            : Compositions[visual];
        var colorRoles = $"Background: {palette[0]}. Main motifs: {palette[1]}. "
            + (palette.Length > 2 ? $"Supporting forms: {palette[2]}. " : "")
            + (palette.Length > 3 ? $"Sparse accents: {palette[3]}. " : "");
        var hierarchy = visual == "repeat"
            ? "Repeat a coherent motif unit with matching opposite edges; larger forms set the rhythm and smaller forms support it. "
            : visual == "focal"
                ? "One large focal form establishes the hierarchy, with restrained supporting detail and open surrounding space. "
                : "Larger forms establish the main rhythm; smaller forms provide supporting detail. Guide the eye through deliberate clusters and open channels. ";
        return "A standalone, straight-on, two-dimensional decorative illustration. "
            + $"Motifs: {Motifs[nature]}. Art direction: {direction}. Technique: {treatment}. "
            + $"Palette: {string.Join(", ", palette)}; at most {palette.Length} base colors including the background. "
            + colorRoles
            + (answers["color"] == "mono" ? "Monochrome only: charcoal marks on white. "
                : minimal ? "Use flat solid colors. " : "Allow tonal variations within the selected palette. ")
            + $"Composition: {composition}. Mood: {Moods[answers["mood"]]}. "
            + hierarchy
            + (minimal ? "Minimal styling takes priority: one motif family, at most two motif sizes, generous spacing and selective detail. "
                : detailed ? "Rich illustration: layered motifs, fine internal detail and varied linework; preserve a clear visual hierarchy. "
                : "Keep detail selective and follow the requested motif spacing. ")
            + "Refined motif contours, controlled line weight and balanced visual weight; supporting strokes stay finer than the main contours. Readable shapes remain clear at reduced size. "
            + "The complete canvas is a flat illustrated surface composed exclusively of the selected nature motifs and intentional background space. "
            + "Text-free, unlettered, unbranded, unsigned, watermark-free and borderless artwork. "
            + "No text, letters, numbers, typography, captions, labels, signatures, initials, dates, logos, watermarks or borders. "
            + "No products, appliances, kitchenware, utensils, cups, teapots, furniture, interiors, product mockups or 3D objects. "
            + "No people, faces, copyrighted characters, violent, sexual or hateful imagery.";
    }
}
