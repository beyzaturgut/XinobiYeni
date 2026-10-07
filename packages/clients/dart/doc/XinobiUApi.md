# xinobi_api_client.api.XinobiUApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createXinobiUSession**](XinobiUApi.md#createxinobiusession) | **POST** /api/v1/xinobi-u/sessions |
[**getXinobiUImage**](XinobiUApi.md#getxinobiuimage) | **GET** /api/v1/xinobi-u/sessions/{id}/image |
[**getXinobiUSession**](XinobiUApi.md#getxinobiusession) | **GET** /api/v1/xinobi-u/sessions/{id} |
[**getXinobiUStatus**](XinobiUApi.md#getxinobiustatus) | **GET** /api/v1/xinobi-u/status |
[**startXinobiUGeneration**](XinobiUApi.md#startxinobiugeneration) | **POST** /api/v1/xinobi-u/sessions/{id}/generation |


# **createXinobiUSession**
> XinobiUSession createXinobiUSession(createXinobiUSession)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getXinobiUApi();
final CreateXinobiUSession createXinobiUSession = ; // CreateXinobiUSession |

try {
    final response = api.createXinobiUSession(createXinobiUSession);
    print(response);
} on DioException catch (e) {
    print('Exception when calling XinobiUApi->createXinobiUSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createXinobiUSession** | [**CreateXinobiUSession**](CreateXinobiUSession.md)|  |

### Return type

[**XinobiUSession**](XinobiUSession.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getXinobiUImage**
> Uint8List getXinobiUImage(id)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getXinobiUApi();
final String id = id_example; // String |

try {
    final response = api.getXinobiUImage(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling XinobiUApi->getXinobiUImage: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |

### Return type

[**Uint8List**](Uint8List.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, image/png, image/jpeg

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getXinobiUSession**
> XinobiUSession getXinobiUSession(id)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getXinobiUApi();
final String id = id_example; // String |

try {
    final response = api.getXinobiUSession(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling XinobiUApi->getXinobiUSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |

### Return type

[**XinobiUSession**](XinobiUSession.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getXinobiUStatus**
> XinobiUStatus getXinobiUStatus()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getXinobiUApi();

try {
    final response = api.getXinobiUStatus();
    print(response);
} on DioException catch (e) {
    print('Exception when calling XinobiUApi->getXinobiUStatus: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**XinobiUStatus**](XinobiUStatus.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **startXinobiUGeneration**
> XinobiUSession startXinobiUGeneration(id, xinobiUGenerationRequest)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getXinobiUApi();
final String id = id_example; // String |
final XinobiUGenerationRequest xinobiUGenerationRequest = ; // XinobiUGenerationRequest |

try {
    final response = api.startXinobiUGeneration(id, xinobiUGenerationRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling XinobiUApi->startXinobiUGeneration: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **xinobiUGenerationRequest** | [**XinobiUGenerationRequest**](XinobiUGenerationRequest.md)|  |

### Return type

[**XinobiUSession**](XinobiUSession.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
