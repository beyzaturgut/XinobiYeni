# xinobi_api_client.api.SystemApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getApiHealth**](SystemApi.md#getapihealth) | **GET** /api/v1/health | 


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

