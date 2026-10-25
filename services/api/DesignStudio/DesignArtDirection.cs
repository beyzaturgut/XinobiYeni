namespace Xinobi.Api.DesignStudio;

/// <summary>Server-owned art direction. The questionnaire's stable option IDs, not random labels or question order, select the rules.</summary>
public static class DesignArtDirection
{
    public const string Version = "xinobi-art-direction-2";

    private static readonly Dictionary<string, string> Motifs = new()
    {
        ["forest"] = "leaves, branching stems and woodland foliage",
        ["ocean"] = "curling wave contours, flowing currents and foam crests",
        ["mountain"] = "mountain ridgelines and layered rocky contours",
        ["desert"] = "rolling dune ribbons and wind-shaped sand contours",
        ["garden"] = "petals, blossoms and fine botanical stems",
        ["sky"] = "airy cloud curves and sweeping sky currents",
        ["river"] = "meandering river ribbons and rounded pebble forms",
        ["cosmos"] = "orbital arcs and star-like points"
    };

    // Ordered palette: the color limit takes precedence over the remaining optional colors.
    private static readonly Dictionary<string, string[]> Palettes = new()
    {
        ["neutral"] = ["ivory", "charcoal", "warm grey"],
        ["earth"] = ["cream", "terracotta", "sand", "burnt umber"],
        ["blue"] = ["navy", "pale blue", "white", "ocean blue"],
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
        ["bold"] = "clear silhouette contrast and confident strokes; no extra motifs or colors",
        ["dream"] = "soft transitions and floating forms; keep edges readable",
        ["nostalgia"] = "warm matte ink character and subtly rounded edges; no distressed noise",
        ["curious"] = "small variations in orientation and scale within one motif family",
        ["balanced"] = "even visual weight, consistent spacing and measured contrast",
        ["energetic"] = "directional movement and lively spacing; no extra motifs or colors"
    };

    private static readonly Dictionary<string, string> Compositions = new()
    {
        ["airy"] = "Sparse layout: 65-75% quiet background, widely separated motifs, no more than two motif sizes",
        ["balanced"] = "Balanced layout: 40-50% quiet background, even spacing, one dominant motif family",
        ["rich"] = "Rich layout: 20-30% quiet background, structured motif clusters, clear spacing between clusters; no visual clutter",
        ["focal"] = "Focal layout: one dominant motif in the central half, 60-70% quiet background; no repeated focal motifs or forced seamless tiling",
        ["flow"] = "Flow layout: 40-50% quiet background, two or three broad diagonal paths, consistent gaps between curves",
        ["repeat"] = "Repeat layout: 40-50% quiet background, a regular seamless tile with matching opposite edges, consistent motif spacing",
        ["asymmetric"] = "Asymmetric layout: 45-55% quiet background, offset motif clusters balanced by open space; no forced symmetry",
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
            "minimal" => "Minimal Graphic: precise silhouettes, deliberate spacing and clean matte shapes",
            "geometry" => "Geometric Graphic: precise shapes and rhythmic interlocking contours",
            "scandi" when botanical => "Elegant Botanical: slender stems, simplified leaves and carefully spaced organic forms",
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
            "minimal" => "Flat fills, uniform outlines and simple shapes",
            "geometry" => "Crisp geometric edges and consistent line weight",
            "scandi" => "Matte fills, fine stems and simple organic contours",
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
            ? "Structured minimal layout: 45-55% quiet background, a richer rhythm of simple motifs, one motif family and at most one shape layer; no intricate detail"
            : Compositions[visual];
        return "Create only a standalone two-dimensional decorative artwork, viewed straight-on. "
            + $"Art direction: {direction}. Motifs: {Motifs[nature]}. Technique: {treatment}. "
            + $"Palette: {string.Join(", ", palette)}; at most {palette.Length} base colors including the background. "
            + (answers["color"] == "mono" ? "Monochrome only: charcoal marks on white, no colored accents. "
                : minimal ? "Use flat solid colors. " : "Allow tonal variations and shading within the selected palette. ")
            + $"Composition: {composition}. Mood: {Moods[answers["mood"]]}. "
            + (minimal ? "Minimal styling takes priority: one motif family, at most two motif sizes, generous spacing and no ornamental micro-details. "
                : detailed ? "Rich illustration: layered motifs, fine internal detail and varied linework; preserve a clear visual hierarchy. "
                : "Keep detail selective and follow the requested motif spacing. ")
            + "The artwork itself fills the canvas, including intentional background space. All depicted forms belong to the selected nature motifs. "
            + "No products, appliances, kitchenware, utensils, cups, teapots, furniture, interiors, product mockups or 3D objects. "
            + "No text, letters, numbers, logos, typography, labels, captions, signatures, watermarks or borders. "
            + "No people, faces, copyrighted characters, violent, sexual or hateful imagery.";
    }
}
