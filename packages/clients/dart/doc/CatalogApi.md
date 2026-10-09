# xinobi_api_client.api.CatalogApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getCatalogProduct**](CatalogApi.md#getcatalogproduct) | **GET** /api/v1/catalog/products/{id} |
[**listCatalogCategories**](CatalogApi.md#listcatalogcategories) | **GET** /api/v1/catalog/categories |
[**listCatalogProducts**](CatalogApi.md#listcatalogproducts) | **GET** /api/v1/catalog/products |
[**listProductReviews**](CatalogApi.md#listproductreviews) | **GET** /api/v1/catalog/products/{id}/reviews |
[**listReviewSummaries**](CatalogApi.md#listreviewsummaries) | **GET** /api/v1/catalog/review-summaries |


# **getCatalogProduct**
> ProductDetail getCatalogProduct(id)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getCatalogApi();
final String id = id_example; // String |

try {
    final response = api.getCatalogProduct(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling CatalogApi->getCatalogProduct: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |

### Return type

[**ProductDetail**](ProductDetail.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listCatalogCategories**
> CategoryList listCatalogCategories()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getCatalogApi();

try {
    final response = api.listCatalogCategories();
    print(response);
} on DioException catch (e) {
    print('Exception when calling CatalogApi->listCatalogCategories: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**CategoryList**](CategoryList.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listCatalogProducts**
> ProductPage listCatalogProducts(category, q, personalizable, page, pageSize)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getCatalogApi();
final String category = category_example; // String |
final String q = q_example; // String |
final bool personalizable = true; // bool |
final int page = 56; // int |
final int pageSize = 56; // int |

try {
    final response = api.listCatalogProducts(category, q, personalizable, page, pageSize);
    print(response);
} on DioException catch (e) {
    print('Exception when calling CatalogApi->listCatalogProducts: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **category** | **String**|  | [optional]
 **q** | **String**|  | [optional]
 **personalizable** | **bool**|  | [optional]
 **page** | **int**|  | [optional]
 **pageSize** | **int**|  | [optional]

### Return type

[**ProductPage**](ProductPage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listProductReviews**
> ReviewPage listProductReviews(id, page)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getCatalogApi();
final String id = id_example; // String |
final int page = 56; // int |

try {
    final response = api.listProductReviews(id, page);
    print(response);
} on DioException catch (e) {
    print('Exception when calling CatalogApi->listProductReviews: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **page** | **int**|  | [optional]

### Return type

[**ReviewPage**](ReviewPage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listReviewSummaries**
> ReviewSummaryList listReviewSummaries(ids)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getCatalogApi();
final String ids = ids_example; // String |

try {
    final response = api.listReviewSummaries(ids);
    print(response);
} on DioException catch (e) {
    print('Exception when calling CatalogApi->listReviewSummaries: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ids** | **String**|  |

### Return type

[**ReviewSummaryList**](ReviewSummaryList.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
