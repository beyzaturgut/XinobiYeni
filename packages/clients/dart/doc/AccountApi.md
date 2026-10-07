# xinobi_api_client.api.AccountApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getMyAccount**](AccountApi.md#getmyaccount) | **GET** /api/v1/me |
[**loginAccount**](AccountApi.md#loginaccount) | **POST** /api/v1/auth/login |
[**logoutSession**](AccountApi.md#logoutsession) | **POST** /api/v1/auth/logout |
[**refreshSession**](AccountApi.md#refreshsession) | **POST** /api/v1/auth/refresh |
[**registerAccount**](AccountApi.md#registeraccount) | **POST** /api/v1/auth/register |
[**startAccountEmailVerification**](AccountApi.md#startaccountemailverification) | **POST** /api/v1/auth/email-verification |


# **getMyAccount**
> AccountProfile getMyAccount()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.getMyAccount();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->getMyAccount: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**AccountProfile**](AccountProfile.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **loginAccount**
> AuthSession loginAccount(loginAccount)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final LoginAccount loginAccount = ; // LoginAccount |

try {
    final response = api.loginAccount(loginAccount);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->loginAccount: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **loginAccount** | [**LoginAccount**](LoginAccount.md)|  |

### Return type

[**AuthSession**](AuthSession.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logoutSession**
> logoutSession(logoutSession)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final LogoutSession logoutSession = ; // LogoutSession |

try {
    api.logoutSession(logoutSession);
} on DioException catch (e) {
    print('Exception when calling AccountApi->logoutSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **logoutSession** | [**LogoutSession**](LogoutSession.md)|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **refreshSession**
> AuthSession refreshSession(refreshSession)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final RefreshSession refreshSession = ; // RefreshSession |

try {
    final response = api.refreshSession(refreshSession);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->refreshSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **refreshSession** | [**RefreshSession**](RefreshSession.md)|  |

### Return type

[**AuthSession**](AuthSession.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **registerAccount**
> AuthSession registerAccount(registerAccount)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final RegisterAccount registerAccount = ; // RegisterAccount |

try {
    final response = api.registerAccount(registerAccount);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->registerAccount: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **registerAccount** | [**RegisterAccount**](RegisterAccount.md)|  |

### Return type

[**AuthSession**](AuthSession.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **startAccountEmailVerification**
> AccountEmailVerification startAccountEmailVerification(startAccountEmailVerification)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final StartAccountEmailVerification startAccountEmailVerification = ; // StartAccountEmailVerification |

try {
    final response = api.startAccountEmailVerification(startAccountEmailVerification);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->startAccountEmailVerification: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **startAccountEmailVerification** | [**StartAccountEmailVerification**](StartAccountEmailVerification.md)|  |

### Return type

[**AccountEmailVerification**](AccountEmailVerification.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
