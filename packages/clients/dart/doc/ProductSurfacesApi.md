# xinobi_api_client.api.ProductSurfacesApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getSingleSourceRenderingInputs**](ProductSurfacesApi.md#getsinglesourcerenderinginputs) | **GET** /api/v1/product-surfaces/{productId}/rendering-inputs |
[**getSingleSourceSurfaceMedia**](ProductSurfacesApi.md#getsinglesourcesurfacemedia) | **GET** /api/v1/product-surfaces/{productId}/{surfaceId}/{role} |


# **getSingleSourceRenderingInputs**
> SingleSourcePublication getSingleSourceRenderingInputs(productId)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getProductSurfacesApi();
final String productId = productId_example; // String |

try {
    final response = api.getSingleSourceRenderingInputs(productId);
    print(response);
} on DioException catch (e) {
    print('Exception when calling ProductSurfacesApi->getSingleSourceRenderingInputs: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **productId** | **String**|  |

### Return type

[**SingleSourcePublication**](SingleSourcePublication.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSingleSourceSurfaceMedia**
> getSingleSourceSurfaceMedia(productId, surfaceId, role, v)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getProductSurfacesApi();
final String productId = productId_example; // String |
final String surfaceId = surfaceId_example; // String |
final String role = role_example; // String |
final String v = v_example; // String |

try {
    api.getSingleSourceSurfaceMedia(productId, surfaceId, role, v);
} on DioException catch (e) {
    print('Exception when calling ProductSurfacesApi->getSingleSourceSurfaceMedia: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **productId** | **String**|  |
 **surfaceId** | **String**|  |
 **role** | **String**|  |
 **v** | **String**|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
