using Xinobi.Api.Features.ProductSurfaces;

namespace Xinobi.Api.Infrastructure.MediaValidation;

// Explicit local fixture boundary; no production Asset/Variant entity or persistence.
// Future resolution must come from shared catalog/Asset infrastructure.
public sealed class DevelopmentTeaMakerMedia
{
    public const string AssetReference = "dev:tea-maker-101:blue:source";
    public const string MediaVersionReference = AssetReference + ":v1";
    public const string ProductReference = "cay-makinesi-101";
    public const string VariantReference = "blue"; // Existing storefront demo key, scoped by product.
    public const string MaskReference = "dev:tea-maker-101:blue:reference-mask:v1";
    private readonly string _repositoryRoot;
    private readonly AlignedImageInspector _inspector;
    public SourceMediaIdentity Identity { get; }

    public DevelopmentTeaMakerMedia(string repositoryRoot, AlignedImageInspector inspector)
    {
        ArgumentNullException.ThrowIfNull(inspector);
        _repositoryRoot = Path.GetFullPath(repositoryRoot);
        _inspector = inspector;
        Identity = ReadCurrentIdentity();
    }

    public SourceMediaIdentity Resolve(string assetReference, string productReference, string variantReference)
    {
        if (assetReference != AssetReference || productReference != ProductReference || variantReference != VariantReference)
            throw new InvalidOperationException("Development variant/media association does not match.");
        var current = ReadCurrentIdentity();
        if (current != Identity) throw new InvalidOperationException("Registered development source has changed.");
        return current;
    }

    public ValidatedAlignedMask ValidateReferenceMask(SourceMediaIdentity boundSource)
    {
        var current = Resolve(AssetReference, ProductReference, VariantReference);
        return _inspector.ValidateMask(File.ReadAllBytes(Path.Combine(_repositoryRoot,
            "apps/web/public/assets/personalization/tea-maker-101-blue-designable.png")), MaskReference, boundSource, current);
    }

    private SourceMediaIdentity ReadCurrentIdentity() => _inspector.InspectSource(
        File.ReadAllBytes(Path.Combine(_repositoryRoot, "apps/web/public/assets/products/tea-maker-101-blue.webp")), MediaVersionReference);
}
