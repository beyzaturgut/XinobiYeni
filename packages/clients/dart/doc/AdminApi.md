# xinobi_api_client.api.AdminApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getAdminSession**](AdminApi.md#getadminsession) | **GET** /api/v1/admin/session |
[**getPermissionCatalog**](AdminApi.md#getpermissioncatalog) | **GET** /api/v1/admin/permissions |


# **getAdminSession**
> AdminSession getAdminSession()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();

try {
    final response = api.getAdminSession();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->getAdminSession: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**AdminSession**](AdminSession.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPermissionCatalog**
> PermissionCatalogResponse getPermissionCatalog()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();

try {
    final response = api.getPermissionCatalog();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->getPermissionCatalog: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**PermissionCatalogResponse**](PermissionCatalogResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
