-- KIS-TEK-02: SELECT only. No identity/address/token fields. Export JSON to a private temporary file.
SET NOCOUNT ON;
SELECT
 JSON_QUERY((SELECT Id,Name,Active,Personalizable,OriginalImage FROM catalog.Products FOR JSON PATH)) products,
 JSON_QUERY((SELECT Id,ProductId,Sku,Color,Stock,Image,SurfaceMask,SurfaceImage FROM catalog.Variants FOR JSON PATH)) variants,
 JSON_QUERY((SELECT VariantId,Cents FROM catalog.VariantPrices FOR JSON PATH)) prices,
 JSON_QUERY((SELECT JSON_VALUE(d.value,'$.id') id, JSON_VALUE(d.value,'$.productId') productId, JSON_VALUE(d.value,'$.variantId') variantId, JSON_VALUE(d.value,'$.file') [file] FROM ops.FeatureDocuments f CROSS APPLY OPENJSON(f.Json,'$.designs') d WHERE f.Name='designs' FOR JSON PATH)) designs,
 JSON_QUERY((SELECT JSON_QUERY(c.value,'$.value') value FROM ops.FeatureDocuments f CROSS APPLY OPENJSON(f.Json,'$.configurations') c WHERE f.Name='designs' FOR JSON PATH)) configurations,
 JSON_QUERY((SELECT CONVERT(varchar(36),OrderId) orderId, Position position, ProductReference productId,VariantReference variantId,JSON_VALUE(PersonalizationJson,'$.configurationId') configurationId,JSON_VALUE(PersonalizationJson,'$.configurationRevision') configurationRevision,JSON_VALUE(PersonalizationJson,'$.sourceSha256') sourceSha256,JSON_QUERY(PersonalizationJson,'$.files') files FROM sales.OrderLines WHERE PersonalizationJson IS NOT NULL FOR JSON PATH)) personalizedLines,
 (SELECT COUNT(*) FROM sales.Orders) orderCount,
 (SELECT COUNT(*) FROM sales.OrderLines) orderLineCount
 FOR JSON PATH,WITHOUT_ARRAY_WRAPPER;
