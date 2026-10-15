# xinobi_api_client.api.AdminApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**assignAdminRole**](AdminApi.md#assignadminrole) | **POST** /api/v1/admin/roles |
[**createAdminInvitation**](AdminApi.md#createadmininvitation) | **POST** /api/v1/admin/invitations |
[**getAdminSession**](AdminApi.md#getadminsession) | **GET** /api/v1/admin/session |
[**getPermissionCatalog**](AdminApi.md#getpermissioncatalog) | **GET** /api/v1/admin/permissions |
[**listAdminAudit**](AdminApi.md#listadminaudit) | **GET** /api/v1/admin/audit |


# **assignAdminRole**
> AdminSession assignAdminRole(assignAdminRole)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final AssignAdminRole assignAdminRole = ; // AssignAdminRole |

try {
    final response = api.assignAdminRole(assignAdminRole);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->assignAdminRole: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **assignAdminRole** | [**AssignAdminRole**](AssignAdminRole.md)|  |

### Return type

[**AdminSession**](AdminSession.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createAdminInvitation**
> AdminInvitationResponse createAdminInvitation(createAdminInvitation)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final CreateAdminInvitation createAdminInvitation = ; // CreateAdminInvitation |

try {
    final response = api.createAdminInvitation(createAdminInvitation);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->createAdminInvitation: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createAdminInvitation** | [**CreateAdminInvitation**](CreateAdminInvitation.md)|  |

### Return type

[**AdminInvitationResponse**](AdminInvitationResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

# **listAdminAudit**
> AuditPage listAdminAudit(action, actorId, from, to, page, pageSize)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String action = action_example; // String |
final String actorId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String |
final DateTime from = 2013-10-20T19:20:30+01:00; // DateTime |
final DateTime to = 2013-10-20T19:20:30+01:00; // DateTime |
final int page = 56; // int |
final int pageSize = 56; // int |

try {
    final response = api.listAdminAudit(action, actorId, from, to, page, pageSize);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->listAdminAudit: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **action** | **String**|  | [optional]
 **actorId** | **String**|  | [optional]
 **from** | **DateTime**|  | [optional]
 **to** | **DateTime**|  | [optional]
 **page** | **int**|  | [optional]
 **pageSize** | **int**|  | [optional]

### Return type

[**AuditPage**](AuditPage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
