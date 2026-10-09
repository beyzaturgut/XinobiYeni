# xinobi_api_client.api.AccountApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addMyAddress**](AccountApi.md#addmyaddress) | **POST** /api/v1/me/addresses |
[**cancelMyOrder**](AccountApi.md#cancelmyorder) | **POST** /api/v1/me/orders/{id}/cancellation |
[**changeMyPassword**](AccountApi.md#changemypassword) | **PUT** /api/v1/me/password |
[**confirmMyEmailChange**](AccountApi.md#confirmmyemailchange) | **PUT** /api/v1/me/email |
[**deleteMyAccount**](AccountApi.md#deletemyaccount) | **POST** /api/v1/me/deletion |
[**deleteMyAddress**](AccountApi.md#deletemyaddress) | **DELETE** /api/v1/me/addresses/{id} |
[**deleteMyDesign**](AccountApi.md#deletemydesign) | **DELETE** /api/v1/me/designs/{id} |
[**getMyAccount**](AccountApi.md#getmyaccount) | **GET** /api/v1/me |
[**getMyDesignImage**](AccountApi.md#getmydesignimage) | **GET** /api/v1/me/designs/{id}/image |
[**getMyOrder**](AccountApi.md#getmyorder) | **GET** /api/v1/me/orders/{id} |
[**getOrderOptions**](AccountApi.md#getorderoptions) | **GET** /api/v1/me/order-options |
[**listMyAddresses**](AccountApi.md#listmyaddresses) | **GET** /api/v1/me/addresses |
[**listMyDesigns**](AccountApi.md#listmydesigns) | **GET** /api/v1/me/designs |
[**listMyNotifications**](AccountApi.md#listmynotifications) | **GET** /api/v1/me/notifications |
[**listMyOrders**](AccountApi.md#listmyorders) | **GET** /api/v1/me/orders |
[**listMyQuotes**](AccountApi.md#listmyquotes) | **GET** /api/v1/me/quotes |
[**listMyReviews**](AccountApi.md#listmyreviews) | **GET** /api/v1/me/reviews |
[**loginAccount**](AccountApi.md#loginaccount) | **POST** /api/v1/auth/login |
[**loginWebAccount**](AccountApi.md#loginwebaccount) | **POST** /api/v1/auth/web/login |
[**logoutSession**](AccountApi.md#logoutsession) | **POST** /api/v1/auth/logout |
[**logoutWebSession**](AccountApi.md#logoutwebsession) | **POST** /api/v1/auth/web/logout |
[**markMyNotificationsRead**](AccountApi.md#markmynotificationsread) | **POST** /api/v1/me/notifications/read |
[**placeMyOrder**](AccountApi.md#placemyorder) | **POST** /api/v1/me/orders |
[**refreshSession**](AccountApi.md#refreshsession) | **POST** /api/v1/auth/refresh |
[**refreshWebSession**](AccountApi.md#refreshwebsession) | **POST** /api/v1/auth/web/refresh |
[**registerAccount**](AccountApi.md#registeraccount) | **POST** /api/v1/auth/register |
[**registerMyDevice**](AccountApi.md#registermydevice) | **POST** /api/v1/me/devices |
[**registerWebAccount**](AccountApi.md#registerwebaccount) | **POST** /api/v1/auth/web/register |
[**removeMyDevice**](AccountApi.md#removemydevice) | **POST** /api/v1/me/devices/removal |
[**renameMyDesign**](AccountApi.md#renamemydesign) | **PATCH** /api/v1/me/designs/{id} |
[**returnMyOrder**](AccountApi.md#returnmyorder) | **POST** /api/v1/me/orders/{id}/returns |
[**saveMyDesign**](AccountApi.md#savemydesign) | **POST** /api/v1/me/designs |
[**startAccountEmailVerification**](AccountApi.md#startaccountemailverification) | **POST** /api/v1/auth/email-verification |
[**startMyEmailChange**](AccountApi.md#startmyemailchange) | **POST** /api/v1/me/email-verification |
[**submitMyReview**](AccountApi.md#submitmyreview) | **POST** /api/v1/me/reviews |
[**updateMyAccount**](AccountApi.md#updatemyaccount) | **PATCH** /api/v1/me |
[**updateMyAddress**](AccountApi.md#updatemyaddress) | **PUT** /api/v1/me/addresses/{id} |
[**uploadMyDesign**](AccountApi.md#uploadmydesign) | **POST** /api/v1/me/designs/upload |


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

# **cancelMyOrder**
> CustomerOrder cancelMyOrder(id, cancelMyOrder)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |
final CancelMyOrder cancelMyOrder = ; // CancelMyOrder |

try {
    final response = api.cancelMyOrder(id, cancelMyOrder);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->cancelMyOrder: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **cancelMyOrder** | [**CancelMyOrder**](CancelMyOrder.md)|  |

### Return type

[**CustomerOrder**](CustomerOrder.md)

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

# **deleteMyDesign**
> deleteMyDesign(id)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |

try {
    api.deleteMyDesign(id);
} on DioException catch (e) {
    print('Exception when calling AccountApi->deleteMyDesign: $e\n');
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

# **getMyDesignImage**
> getMyDesignImage(id)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |

try {
    api.getMyDesignImage(id);
} on DioException catch (e) {
    print('Exception when calling AccountApi->getMyDesignImage: $e\n');
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

# **getMyOrder**
> CustomerOrder getMyOrder(id)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |

try {
    final response = api.getMyOrder(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->getMyOrder: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |

### Return type

[**CustomerOrder**](CustomerOrder.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getOrderOptions**
> OrderOptions getOrderOptions()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.getOrderOptions();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->getOrderOptions: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**OrderOptions**](OrderOptions.md)

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

# **listMyDesigns**
> BuiltList<MyDesign> listMyDesigns()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.listMyDesigns();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->listMyDesigns: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**BuiltList&lt;MyDesign&gt;**](MyDesign.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listMyNotifications**
> Inbox listMyNotifications()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.listMyNotifications();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->listMyNotifications: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**Inbox**](Inbox.md)

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

# **listMyQuotes**
> BuiltList<Quote> listMyQuotes()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.listMyQuotes();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->listMyQuotes: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**BuiltList&lt;Quote&gt;**](Quote.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listMyReviews**
> BuiltList<MyReview> listMyReviews()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.listMyReviews();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->listMyReviews: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**BuiltList&lt;MyReview&gt;**](MyReview.md)

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

# **markMyNotificationsRead**
> markMyNotificationsRead(markNotificationsRead)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final MarkNotificationsRead markNotificationsRead = ; // MarkNotificationsRead |

try {
    api.markMyNotificationsRead(markNotificationsRead);
} on DioException catch (e) {
    print('Exception when calling AccountApi->markMyNotificationsRead: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **markNotificationsRead** | [**MarkNotificationsRead**](MarkNotificationsRead.md)|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
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

# **registerMyDevice**
> registerMyDevice(registerDevice)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final RegisterDevice registerDevice = ; // RegisterDevice |

try {
    api.registerMyDevice(registerDevice);
} on DioException catch (e) {
    print('Exception when calling AccountApi->registerMyDevice: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **registerDevice** | [**RegisterDevice**](RegisterDevice.md)|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json

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

# **removeMyDevice**
> removeMyDevice(removeDevice)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final RemoveDevice removeDevice = ; // RemoveDevice |

try {
    api.removeMyDevice(removeDevice);
} on DioException catch (e) {
    print('Exception when calling AccountApi->removeMyDevice: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **removeDevice** | [**RemoveDevice**](RemoveDevice.md)|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **renameMyDesign**
> MyDesign renameMyDesign(id, renameDesign)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |
final RenameDesign renameDesign = ; // RenameDesign |

try {
    final response = api.renameMyDesign(id, renameDesign);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->renameMyDesign: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **renameDesign** | [**RenameDesign**](RenameDesign.md)|  |

### Return type

[**MyDesign**](MyDesign.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **returnMyOrder**
> CustomerOrder returnMyOrder(id, returnMyOrder)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |
final ReturnMyOrder returnMyOrder = ; // ReturnMyOrder |

try {
    final response = api.returnMyOrder(id, returnMyOrder);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->returnMyOrder: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **returnMyOrder** | [**ReturnMyOrder**](ReturnMyOrder.md)|  |

### Return type

[**CustomerOrder**](CustomerOrder.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **saveMyDesign**
> MyDesign saveMyDesign(saveDesignFromSession)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final SaveDesignFromSession saveDesignFromSession = ; // SaveDesignFromSession |

try {
    final response = api.saveMyDesign(saveDesignFromSession);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->saveMyDesign: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **saveDesignFromSession** | [**SaveDesignFromSession**](SaveDesignFromSession.md)|  |

### Return type

[**MyDesign**](MyDesign.md)

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

# **submitMyReview**
> MyReview submitMyReview(submitReview)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final SubmitReview submitReview = ; // SubmitReview |

try {
    final response = api.submitMyReview(submitReview);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->submitMyReview: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **submitReview** | [**SubmitReview**](SubmitReview.md)|  |

### Return type

[**MyReview**](MyReview.md)

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

# **uploadMyDesign**
> MyDesign uploadMyDesign(file, productId, variantId, name)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final MultipartFile file = BINARY_DATA_HERE; // MultipartFile |
final String productId = productId_example; // String |
final String variantId = variantId_example; // String |
final String name = name_example; // String |

try {
    final response = api.uploadMyDesign(file, productId, variantId, name);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->uploadMyDesign: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **file** | **MultipartFile**|  |
 **productId** | **String**|  |
 **variantId** | **String**|  | [optional]
 **name** | **String**|  | [optional]

### Return type

[**MyDesign**](MyDesign.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
