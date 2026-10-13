namespace Xinobi.Api.DesignStudio;

/// <summary>Server-owned art direction. The questionnaire's stable option IDs, not random labels or question order, select the rules.</summary>
public static class DesignArtDirection
{
    public const string Version = "xinobi-art-direction-1";

    private static readonly Dictionary<string, string> Motifs = new()
    {
        ["forest"] = "stylized leaf silhouettes and slender branching lines; no forest landscape",
        ["ocean"] = "simplified wave contours and flowing current arcs; no horizon or seascape",
        ["mountain"] = "abstract angular ridge outlines; no photographic mountain scene",
        ["desert"] = "smooth dune ribbons and clean contour bands; no granular sand noise",
        ["garden"] = "restrained petal silhouettes and fine botanical stems; no crowded bouquet",
        ["sky"] = "open airy arcs and simplified cloud curves; no realistic sky scene",
        ["river"] = "meandering ribbons and rounded pebble forms; no river landscape",
        ["cosmos"] = "sparse orbital arcs and clean star-like points; no galaxy photograph"
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
        ["layer"] = "Layered layout: 30-40% quiet background, at most two overlapping shape layers, readable boundaries; no muddy overlap"
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
            "minimal" or "geometry" or "retro" => "Xinobi Simple Geometry: precise silhouettes, consistent medium-weight lines, deliberate spacing and clean matte graphic shapes",
            "scandi" when botanical => "Xinobi Elegant Botanical: simplified leaves or petals, slender stems, restrained linework and carefully spaced organic forms",
            "scandi" => "Xinobi Simple Geometry: soft geometric forms, clean contours, deliberate spacing and an organic Scandinavian character",
            "watercolor" or "engraving" when botanical => "Xinobi Elegant Botanical: simplified leaves or petals, slender stems, restrained linework and carefully spaced organic forms",
            "ink" or "engraving" => "Xinobi Japanese Inspired: economical ink gestures, controlled brush rhythm and deliberate open space; no calligraphy or borrowed artist signatures",
            "watercolor" or "abstract" => "Xinobi Fluid Abstract: broad organic ribbons, calm overlapping forms and controlled flowing contours",
            _ => throw new ArgumentException("Bu tarz için tasarım kuralları tanımlı değil.")
        };
        var treatment = style switch
        {
            "minimal" => "Flat solid fills and uniform medium-weight outlines; no texture or tiny ornament",
            "geometry" => "Precise geometric reduction of the chosen nature motifs; crisp edges and consistent line weight",
            "scandi" => "Softly rounded organic shapes, matte fills and simple contours; no tiny ornament",
            "retro" => "Refined mid-century proportions and rounded graphic shapes; retain the user's palette",
            "watercolor" => "Soft pigment transitions confined within clean motif shapes; no speckles or washed-out edges",
            "ink" => "Fine but clearly readable ink contours with one controlled brush accent",
            "engraving" => "Sparse parallel engraving strokes inside the motifs only; no dense crosshatching",
            "abstract" => "Broad expressive shapes and restrained contour variation; no random paint splatter",
            _ => throw new ArgumentException("Bu tarz için tasarım kuralları tanımlı değil.")
        };
        var palette = Palettes[answers["color"]].Take(minimal ? 3 : 4).ToArray();
        // A density choice changes placement without cancelling a request for minimal styling.
        var composition = minimal && (visual is "rich" or "layer")
            ? "Structured minimal layout: 45-55% quiet background, a richer rhythm of simple motifs, one motif family and at most one shape layer; no intricate detail"
            : Compositions[visual];
        return $"Original flat two-dimensional decorative artwork for the Xinobi home appliance collection. "
            + $"Art direction: {direction}. Motif vocabulary: {Motifs[nature]}. Finish: {treatment}. "
            + $"Palette: use only {string.Join(", ", palette)}, at most {palette.Length} ink colors including the background; no additional hues. "
            + (answers["color"] == "mono" ? "Monochrome only: charcoal marks on white, no colored accents. " : "")
            + $"Composition: {composition}. Mood expressed through {Moods[answers["mood"]]}. "
            + (minimal ? "Minimal styling takes priority: one motif family, at most two motif sizes, generous spacing and no ornamental micro-details. " : "")
            + "One coherent visual language, readable shapes, intentional negative space and a flat background across the full canvas. "
            + "The requested color limit and composition take priority over mood and texture. Quiet background is part of the finished artwork; do not fill every gap. "
            + "Standalone artwork swatch, straight-on view, no product mockup, perspective, lighting effects, simulated metallic reflections or 3D objects. "
            + "No text, letters, numbers, logos, signatures, brands, people, faces, copyrighted characters, violent, sexual or hateful imagery.";
    }
}
