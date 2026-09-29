# xinobi_api_client.api.SystemApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getApiHealth**](SystemApi.md#getapihealth) | **GET** /api/v1/health |
[**getApiLiveness**](SystemApi.md#getapiliveness) | **GET** /api/v1/health/live |
[**getApiReadiness**](SystemApi.md#getapireadiness) | **GET** /api/v1/health/ready |


# **getApiHealth**
> HealthResponse getApiHealth()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getSystemApi();

try {
    final response = api.getApiHealth();
    print(response);
} on DioException catch (e) {
    print('Exception when calling SystemApi->getApiHealth: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**HealthResponse**](HealthResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getApiLiveness**
> HealthResponse getApiLiveness()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getSystemApi();

try {
    final response = api.getApiLiveness();
    print(response);
} on DioException catch (e) {
    print('Exception when calling SystemApi->getApiLiveness: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**HealthResponse**](HealthResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getApiReadiness**
> ReadinessResponse getApiReadiness()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getSystemApi();

try {
    final response = api.getApiReadiness();
    print(response);
} on DioException catch (e) {
    print('Exception when calling SystemApi->getApiReadiness: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ReadinessResponse**](ReadinessResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
