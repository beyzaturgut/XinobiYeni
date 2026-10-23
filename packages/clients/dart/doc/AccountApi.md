# xinobi_api_client.api.AccountApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**acceptAdminInvitation**](AccountApi.md#acceptadmininvitation) | **POST** /api/v1/auth/admin-invitations/accept |
[**addMyAddress**](AccountApi.md#addmyaddress) | **POST** /api/v1/me/addresses |
[**addMyFavorite**](AccountApi.md#addmyfavorite) | **POST** /api/v1/me/favorites |
[**cancelMyOrder**](AccountApi.md#cancelmyorder) | **POST** /api/v1/me/orders/{id}/cancellation |
[**changeMyPassword**](AccountApi.md#changemypassword) | **PUT** /api/v1/me/password |
[**completeAdminPasswordReset**](AccountApi.md#completeadminpasswordreset) | **POST** /api/v1/auth/admin/password-reset/complete |
[**confirmMyEmailChange**](AccountApi.md#confirmmyemailchange) | **PUT** /api/v1/me/email |
[**confirmPasswordReset**](AccountApi.md#confirmpasswordreset) | **POST** /api/v1/auth/password-reset/confirm |
[**deleteMyAccount**](AccountApi.md#deletemyaccount) | **POST** /api/v1/me/deletion |
[**deleteMyAddress**](AccountApi.md#deletemyaddress) | **DELETE** /api/v1/me/addresses/{id} |
[**deleteMyDesign**](AccountApi.md#deletemydesign) | **DELETE** /api/v1/me/designs/{id} |
[**deleteMyFavorite**](AccountApi.md#deletemyfavorite) | **DELETE** /api/v1/me/favorites/{productId} |
[**getMyAccount**](AccountApi.md#getmyaccount) | **GET** /api/v1/me |
[**getMyDesignConfiguration**](AccountApi.md#getmydesignconfiguration) | **GET** /api/v1/me/design-configurations/{id}/revisions/{revision} |
[**getMyDesignConfigurationPreview**](AccountApi.md#getmydesignconfigurationpreview) | **GET** /api/v1/me/design-configurations/{id}/revisions/{revision}/preview |
[**getMyDesignImage**](AccountApi.md#getmydesignimage) | **GET** /api/v1/me/designs/{id}/image |
[**getMyOrder**](AccountApi.md#getmyorder) | **GET** /api/v1/me/orders/{id} |
[**getMyOrderLineDesign**](AccountApi.md#getmyorderlinedesign) | **GET** /api/v1/me/orders/{id}/lines/{line}/design |
[**getOrderOptions**](AccountApi.md#getorderoptions) | **GET** /api/v1/me/order-options |
[**listMyAddresses**](AccountApi.md#listmyaddresses) | **GET** /api/v1/me/addresses |
[**listMyDesignConfigurations**](AccountApi.md#listmydesignconfigurations) | **GET** /api/v1/me/design-configurations |
[**listMyDesigns**](AccountApi.md#listmydesigns) | **GET** /api/v1/me/designs |
[**listMyFavorites**](AccountApi.md#listmyfavorites) | **GET** /api/v1/me/favorites |
[**listMyNotifications**](AccountApi.md#listmynotifications) | **GET** /api/v1/me/notifications |
[**listMyOrders**](AccountApi.md#listmyorders) | **GET** /api/v1/me/orders |
[**listMyQuotes**](AccountApi.md#listmyquotes) | **GET** /api/v1/me/quotes |
[**listMyReviews**](AccountApi.md#listmyreviews) | **GET** /api/v1/me/reviews |
[**loginAccount**](AccountApi.md#loginaccount) | **POST** /api/v1/auth/login |
[**loginAdminWebAccount**](AccountApi.md#loginadminwebaccount) | **POST** /api/v1/auth/admin/login |
[**loginWebAccount**](AccountApi.md#loginwebaccount) | **POST** /api/v1/auth/web/login |
[**logoutAdminWebSession**](AccountApi.md#logoutadminwebsession) | **POST** /api/v1/auth/admin/logout |
[**logoutSession**](AccountApi.md#logoutsession) | **POST** /api/v1/auth/logout |
[**logoutWebSession**](AccountApi.md#logoutwebsession) | **POST** /api/v1/auth/web/logout |
[**markMyNotificationsRead**](AccountApi.md#markmynotificationsread) | **POST** /api/v1/me/notifications/read |
[**placeMyOrder**](AccountApi.md#placemyorder) | **POST** /api/v1/me/orders |
[**refreshAdminWebSession**](AccountApi.md#refreshadminwebsession) | **POST** /api/v1/auth/admin/refresh |
[**refreshSession**](AccountApi.md#refreshsession) | **POST** /api/v1/auth/refresh |
[**refreshWebSession**](AccountApi.md#refreshwebsession) | **POST** /api/v1/auth/web/refresh |
[**registerAccount**](AccountApi.md#registeraccount) | **POST** /api/v1/auth/register |
[**registerMyDevice**](AccountApi.md#registermydevice) | **POST** /api/v1/me/devices |
[**registerWebAccount**](AccountApi.md#registerwebaccount) | **POST** /api/v1/auth/web/register |
[**removeMyDevice**](AccountApi.md#removemydevice) | **POST** /api/v1/me/devices/removal |
[**renameMyDesign**](AccountApi.md#renamemydesign) | **PATCH** /api/v1/me/designs/{id} |
[**returnMyOrder**](AccountApi.md#returnmyorder) | **POST** /api/v1/me/orders/{id}/returns |
[**saveMyDesign**](AccountApi.md#savemydesign) | **POST** /api/v1/me/designs |
[**saveMyDesignConfiguration**](AccountApi.md#savemydesignconfiguration) | **POST** /api/v1/me/designs/{id}/configurations |
[**saveMyDesignConfigurationPreview**](AccountApi.md#savemydesignconfigurationpreview) | **PUT** /api/v1/me/design-configurations/{id}/revisions/{revision}/preview |
[**setMyDesignConfigurationFavorite**](AccountApi.md#setmydesignconfigurationfavorite) | **PUT** /api/v1/me/design-configurations/{id}/favorite |
[**startAccountEmailVerification**](AccountApi.md#startaccountemailverification) | **POST** /api/v1/auth/email-verification |
[**startAdminPasswordReset**](AccountApi.md#startadminpasswordreset) | **POST** /api/v1/auth/admin/password-reset |
[**startMyEmailChange**](AccountApi.md#startmyemailchange) | **POST** /api/v1/me/email-verification |
[**startPasswordReset**](AccountApi.md#startpasswordreset) | **POST** /api/v1/auth/password-reset |
[**submitMyReview**](AccountApi.md#submitmyreview) | **POST** /api/v1/me/reviews |
[**updateMyAccount**](AccountApi.md#updatemyaccount) | **PATCH** /api/v1/me |
[**updateMyAddress**](AccountApi.md#updatemyaddress) | **PUT** /api/v1/me/addresses/{id} |
[**uploadMyDesign**](AccountApi.md#uploadmydesign) | **POST** /api/v1/me/designs/upload |
[**verifyAdminMfa**](AccountApi.md#verifyadminmfa) | **POST** /api/v1/auth/admin/mfa/verify |


# **acceptAdminInvitation**
> AdminMfaChallenge acceptAdminInvitation(acceptAdminInvitation)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final AcceptAdminInvitation acceptAdminInvitation = ; // AcceptAdminInvitation |

try {
    final response = api.acceptAdminInvitation(acceptAdminInvitation);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->acceptAdminInvitation: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **acceptAdminInvitation** | [**AcceptAdminInvitation**](AcceptAdminInvitation.md)|  |

### Return type

[**AdminMfaChallenge**](AdminMfaChallenge.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

# **addMyFavorite**
> addMyFavorite(addFavorite)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final AddFavorite addFavorite = ; // AddFavorite |

try {
    api.addMyFavorite(addFavorite);
} on DioException catch (e) {
    print('Exception when calling AccountApi->addMyFavorite: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **addFavorite** | [**AddFavorite**](AddFavorite.md)|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json

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

# **completeAdminPasswordReset**
> completeAdminPasswordReset(completeAdminPasswordReset)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final CompleteAdminPasswordReset completeAdminPasswordReset = ; // CompleteAdminPasswordReset |

try {
    api.completeAdminPasswordReset(completeAdminPasswordReset);
} on DioException catch (e) {
    print('Exception when calling AccountApi->completeAdminPasswordReset: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **completeAdminPasswordReset** | [**CompleteAdminPasswordReset**](CompleteAdminPasswordReset.md)|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json

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

# **confirmPasswordReset**
> confirmPasswordReset(confirmPasswordReset)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final ConfirmPasswordReset confirmPasswordReset = ; // ConfirmPasswordReset |

try {
    api.confirmPasswordReset(confirmPasswordReset);
} on DioException catch (e) {
    print('Exception when calling AccountApi->confirmPasswordReset: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **confirmPasswordReset** | [**ConfirmPasswordReset**](ConfirmPasswordReset.md)|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json

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

# **deleteMyFavorite**
> deleteMyFavorite(productId)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String productId = productId_example; // String |

try {
    api.deleteMyFavorite(productId);
} on DioException catch (e) {
    print('Exception when calling AccountApi->deleteMyFavorite: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **productId** | **String**|  |

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

# **getMyDesignConfiguration**
> MyDesignConfiguration getMyDesignConfiguration(id, revision)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |
final int revision = 56; // int |

try {
    final response = api.getMyDesignConfiguration(id, revision);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->getMyDesignConfiguration: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **revision** | **int**|  |

### Return type

[**MyDesignConfiguration**](MyDesignConfiguration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyDesignConfigurationPreview**
> getMyDesignConfigurationPreview(id, revision)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |
final int revision = 56; // int |

try {
    api.getMyDesignConfigurationPreview(id, revision);
} on DioException catch (e) {
    print('Exception when calling AccountApi->getMyDesignConfigurationPreview: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **revision** | **int**|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

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

# **getMyOrderLineDesign**
> getMyOrderLineDesign(id, line, download)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |
final int line = 56; // int |
final bool download = true; // bool |

try {
    api.getMyOrderLineDesign(id, line, download);
} on DioException catch (e) {
    print('Exception when calling AccountApi->getMyOrderLineDesign: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **line** | **int**|  |
 **download** | **bool**|  | [optional]

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json

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

# **listMyDesignConfigurations**
> BuiltList<MyDesignConfiguration> listMyDesignConfigurations()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.listMyDesignConfigurations();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->listMyDesignConfigurations: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**BuiltList&lt;MyDesignConfiguration&gt;**](MyDesignConfiguration.md)

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

# **listMyFavorites**
> BuiltList<String> listMyFavorites()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.listMyFavorites();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->listMyFavorites: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

**BuiltList&lt;String&gt;**

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

# **loginAdminWebAccount**
> AdminMfaChallenge loginAdminWebAccount(loginAccount)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final LoginAccount loginAccount = ; // LoginAccount |

try {
    final response = api.loginAdminWebAccount(loginAccount);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->loginAdminWebAccount: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **loginAccount** | [**LoginAccount**](LoginAccount.md)|  |

### Return type

[**AdminMfaChallenge**](AdminMfaChallenge.md)

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

# **logoutAdminWebSession**
> logoutAdminWebSession()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    api.logoutAdminWebSession();
} on DioException catch (e) {
    print('Exception when calling AccountApi->logoutAdminWebSession: $e\n');
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

# **refreshAdminWebSession**
> AccountProfile refreshAdminWebSession()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();

try {
    final response = api.refreshAdminWebSession();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->refreshAdminWebSession: $e\n');
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

# **saveMyDesignConfiguration**
> MyDesignConfiguration saveMyDesignConfiguration(id, saveDesignConfiguration)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |
final SaveDesignConfiguration saveDesignConfiguration = ; // SaveDesignConfiguration |

try {
    final response = api.saveMyDesignConfiguration(id, saveDesignConfiguration);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->saveMyDesignConfiguration: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **saveDesignConfiguration** | [**SaveDesignConfiguration**](SaveDesignConfiguration.md)|  |

### Return type

[**MyDesignConfiguration**](MyDesignConfiguration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **saveMyDesignConfigurationPreview**
> saveMyDesignConfigurationPreview(id, revision, file)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |
final int revision = 56; // int |
final MultipartFile file = BINARY_DATA_HERE; // MultipartFile |

try {
    api.saveMyDesignConfigurationPreview(id, revision, file);
} on DioException catch (e) {
    print('Exception when calling AccountApi->saveMyDesignConfigurationPreview: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **revision** | **int**|  |
 **file** | **MultipartFile**|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setMyDesignConfigurationFavorite**
> setMyDesignConfigurationFavorite(id, setConfigurationFavorite)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final String id = id_example; // String |
final SetConfigurationFavorite setConfigurationFavorite = ; // SetConfigurationFavorite |

try {
    api.setMyDesignConfigurationFavorite(id, setConfigurationFavorite);
} on DioException catch (e) {
    print('Exception when calling AccountApi->setMyDesignConfigurationFavorite: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **setConfigurationFavorite** | [**SetConfigurationFavorite**](SetConfigurationFavorite.md)|  |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json

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

# **startAdminPasswordReset**
> AdminPasswordResetStarted startAdminPasswordReset(startAdminPasswordReset)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final StartAdminPasswordReset startAdminPasswordReset = ; // StartAdminPasswordReset |

try {
    final response = api.startAdminPasswordReset(startAdminPasswordReset);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->startAdminPasswordReset: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **startAdminPasswordReset** | [**StartAdminPasswordReset**](StartAdminPasswordReset.md)|  |

### Return type

[**AdminPasswordResetStarted**](AdminPasswordResetStarted.md)

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

# **startPasswordReset**
> AccountEmailVerification startPasswordReset(startPasswordReset)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final StartPasswordReset startPasswordReset = ; // StartPasswordReset |

try {
    final response = api.startPasswordReset(startPasswordReset);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->startPasswordReset: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **startPasswordReset** | [**StartPasswordReset**](StartPasswordReset.md)|  |

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

# **verifyAdminMfa**
> AdminSession verifyAdminMfa(verifyAdminMfa)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAccountApi();
final VerifyAdminMfa verifyAdminMfa = ; // VerifyAdminMfa |

try {
    final response = api.verifyAdminMfa(verifyAdminMfa);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AccountApi->verifyAdminMfa: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **verifyAdminMfa** | [**VerifyAdminMfa**](VerifyAdminMfa.md)|  |

### Return type

[**AdminSession**](AdminSession.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
