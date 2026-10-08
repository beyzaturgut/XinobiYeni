# xinobi_api_client.api.AccountApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addMyAddress**](AccountApi.md#addmyaddress) | **POST** /api/v1/me/addresses |
[**changeMyPassword**](AccountApi.md#changemypassword) | **PUT** /api/v1/me/password |
[**confirmMyEmailChange**](AccountApi.md#confirmmyemailchange) | **PUT** /api/v1/me/email |
[**deleteMyAccount**](AccountApi.md#deletemyaccount) | **POST** /api/v1/me/deletion |
[**deleteMyAddress**](AccountApi.md#deletemyaddress) | **DELETE** /api/v1/me/addresses/{id} |
[**getMyAccount**](AccountApi.md#getmyaccount) | **GET** /api/v1/me |
[**listMyAddresses**](AccountApi.md#listmyaddresses) | **GET** /api/v1/me/addresses |
[**listMyOrders**](AccountApi.md#listmyorders) | **GET** /api/v1/me/orders |
[**loginAccount**](AccountApi.md#loginaccount) | **POST** /api/v1/auth/login |
[**loginWebAccount**](AccountApi.md#loginwebaccount) | **POST** /api/v1/auth/web/login |
[**logoutSession**](AccountApi.md#logoutsession) | **POST** /api/v1/auth/logout |
[**logoutWebSession**](AccountApi.md#logoutwebsession) | **POST** /api/v1/auth/web/logout |
[**placeMyOrder**](AccountApi.md#placemyorder) | **POST** /api/v1/me/orders |
[**refreshSession**](AccountApi.md#refreshsession) | **POST** /api/v1/auth/refresh |
[**refreshWebSession**](AccountApi.md#refreshwebsession) | **POST** /api/v1/auth/web/refresh |
[**registerAccount**](AccountApi.md#registeraccount) | **POST** /api/v1/auth/register |
[**registerWebAccount**](AccountApi.md#registerwebaccount) | **POST** /api/v1/auth/web/register |
[**startAccountEmailVerification**](AccountApi.md#startaccountemailverification) | **POST** /api/v1/auth/email-verification |
[**startMyEmailChange**](AccountApi.md#startmyemailchange) | **POST** /api/v1/me/email-verification |
[**updateMyAccount**](AccountApi.md#updatemyaccount) | **PATCH** /api/v1/me |
[**updateMyAddress**](AccountApi.md#updatemyaddress) | **PUT** /api/v1/me/addresses/{id} |


# **addMyAddress**
> CustomerAddress addMyAddress(saveCustomerAddress)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final SaveCustomerAddress saveCustomerAddress = ; // SaveCustomerAddress |

try {
    final response = api.addMyAddress(saveCustomerAddress);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->addMyAddress: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **saveCustomerAddress** | [**SaveCustomerAddress**](SaveCustomerAddress.md)|  |

### Return type

[**CustomerAddress**](CustomerAddress.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **changeMyPassword**
> AuthSession changeMyPassword(changeMyPassword)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final ChangeMyPassword changeMyPassword = ; // ChangeMyPassword |

try {
    final response = api.changeMyPassword(changeMyPassword);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->changeMyPassword: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **changeMyPassword** | [**ChangeMyPassword**](ChangeMyPassword.md)|  |

### Return type

[**AuthSession**](AuthSession.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **confirmMyEmailChange**
> AccountProfile confirmMyEmailChange(confirmEmailChange)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final ConfirmEmailChange confirmEmailChange = ; // ConfirmEmailChange |

try {
    final response = api.confirmMyEmailChange(confirmEmailChange);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->confirmMyEmailChange: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **confirmEmailChange** | [**ConfirmEmailChange**](ConfirmEmailChange.md)|  |

### Return type

[**AccountProfile**](AccountProfile.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteMyAccount**
> deleteMyAccount(deleteMyAccount)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final DeleteMyAccount deleteMyAccount = ; // DeleteMyAccount |

try {
    api.deleteMyAccount(deleteMyAccount);
} on DioException catch (e) {
    print('Exception when calling AccountApi->deleteMyAccount: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **deleteMyAccount** | [**DeleteMyAccount**](DeleteMyAccount.md)|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteMyAddress**
> deleteMyAddress(id)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |

try {
    api.deleteMyAddress(id);
} on DioException catch (e) {
    print('Exception when calling AccountApi->deleteMyAddress: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

# **listMyAddresses**
> BuiltList<CustomerAddress> listMyAddresses()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.listMyAddresses();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->listMyAddresses: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**BuiltList&lt;CustomerAddress&gt;**](CustomerAddress.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listMyOrders**
> BuiltList<CustomerOrder> listMyOrders()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.listMyOrders();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->listMyOrders: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**BuiltList&lt;CustomerOrder&gt;**](CustomerOrder.md)

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

# **loginWebAccount**
> AccountProfile loginWebAccount(loginAccount)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final LoginAccount loginAccount = ; // LoginAccount |

try {
    final response = api.loginWebAccount(loginAccount);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->loginWebAccount: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **loginAccount** | [**LoginAccount**](LoginAccount.md)|  |

### Return type

[**AccountProfile**](AccountProfile.md)

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

# **logoutWebSession**
> logoutWebSession()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    api.logoutWebSession();
} on DioException catch (e) {
    print('Exception when calling AccountApi->logoutWebSession: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **placeMyOrder**
> CustomerOrder placeMyOrder(placeOrder)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final PlaceOrder placeOrder = ; // PlaceOrder |

try {
    final response = api.placeMyOrder(placeOrder);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->placeMyOrder: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **placeOrder** | [**PlaceOrder**](PlaceOrder.md)|  |

### Return type

[**CustomerOrder**](CustomerOrder.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

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

# **refreshWebSession**
> AccountProfile refreshWebSession()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.refreshWebSession();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->refreshWebSession: $e\n');
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

# **registerWebAccount**
> AccountProfile registerWebAccount(registerAccount)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final RegisterAccount registerAccount = ; // RegisterAccount |

try {
    final response = api.registerWebAccount(registerAccount);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->registerWebAccount: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **registerAccount** | [**RegisterAccount**](RegisterAccount.md)|  |

### Return type

[**AccountProfile**](AccountProfile.md)

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

# **startMyEmailChange**
> AccountEmailVerification startMyEmailChange(startEmailChange)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final StartEmailChange startEmailChange = ; // StartEmailChange |

try {
    final response = api.startMyEmailChange(startEmailChange);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->startMyEmailChange: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **startEmailChange** | [**StartEmailChange**](StartEmailChange.md)|  |

### Return type

[**AccountEmailVerification**](AccountEmailVerification.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMyAccount**
> AccountProfile updateMyAccount(updateMyAccount)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final UpdateMyAccount updateMyAccount = ; // UpdateMyAccount |

try {
    final response = api.updateMyAccount(updateMyAccount);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->updateMyAccount: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateMyAccount** | [**UpdateMyAccount**](UpdateMyAccount.md)|  |

### Return type

[**AccountProfile**](AccountProfile.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMyAddress**
> CustomerAddress updateMyAddress(id, saveCustomerAddress)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |
final SaveCustomerAddress saveCustomerAddress = ; // SaveCustomerAddress |

try {
    final response = api.updateMyAddress(id, saveCustomerAddress);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->updateMyAddress: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **saveCustomerAddress** | [**SaveCustomerAddress**](SaveCustomerAddress.md)|  |

### Return type

[**CustomerAddress**](CustomerAddress.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
