# xinobi_api_client.api.AdminApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**approvePrintProfile**](AdminApi.md#approveprintprofile) | **POST** /api/v1/admin/print-profiles/{id}/approve |
[**assignAdminRole**](AdminApi.md#assignadminrole) | **POST** /api/v1/admin/roles |
[**createAdminInvitation**](AdminApi.md#createadmininvitation) | **POST** /api/v1/admin/invitations |
[**downloadPrintCalibration**](AdminApi.md#downloadprintcalibration) | **GET** /api/v1/admin/print-profiles/{id}/revisions/{revision}/calibration.svg |
[**getAdminCustomer**](AdminApi.md#getadmincustomer) | **GET** /api/v1/admin/customers/{id} |
[**getAdminDesign**](AdminApi.md#getadmindesign) | **GET** /api/v1/admin/designs/{id} |
[**getAdminDesignImage**](AdminApi.md#getadmindesignimage) | **GET** /api/v1/admin/designs/{id}/image |
[**getAdminOrder**](AdminApi.md#getadminorder) | **GET** /api/v1/admin/orders/{id} |
[**getAdminReportSummary**](AdminApi.md#getadminreportsummary) | **GET** /api/v1/admin/reports/summary |
[**getAdminSession**](AdminApi.md#getadminsession) | **GET** /api/v1/admin/session |
[**getPermissionCatalog**](AdminApi.md#getpermissioncatalog) | **GET** /api/v1/admin/permissions |
[**getPrintProfileRevision**](AdminApi.md#getprintprofilerevision) | **GET** /api/v1/admin/print-profiles/{id}/revisions/{revision} |
[**listAdminAudit**](AdminApi.md#listadminaudit) | **GET** /api/v1/admin/audit |
[**listAdminCustomers**](AdminApi.md#listadmincustomers) | **GET** /api/v1/admin/customers |
[**listAdminDesignOrders**](AdminApi.md#listadmindesignorders) | **GET** /api/v1/admin/designs/{id}/orders | Tasarım kimliğine bağlı sipariş referansları; müşteri bilgisi içermez.
[**listAdminDesigns**](AdminApi.md#listadmindesigns) | **GET** /api/v1/admin/designs |
[**listPrintProfiles**](AdminApi.md#listprintprofiles) | **GET** /api/v1/admin/print-profiles |
[**measurePrintPlacement**](AdminApi.md#measureprintplacement) | **POST** /api/v1/admin/print-profiles/{id}/revisions/{revision}/measure |
[**retirePrintProfile**](AdminApi.md#retireprintprofile) | **POST** /api/v1/admin/print-profiles/{id}/retire |
[**savePrintProfileDraft**](AdminApi.md#saveprintprofiledraft) | **POST** /api/v1/admin/print-profiles |


# **approvePrintProfile**
> PrintProfileRevision approvePrintProfile(id, actOnPrintProfile)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String id = id_example; // String |
final ActOnPrintProfile actOnPrintProfile = ; // ActOnPrintProfile |

try {
    final response = api.approvePrintProfile(id, actOnPrintProfile);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->approvePrintProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **actOnPrintProfile** | [**ActOnPrintProfile**](ActOnPrintProfile.md)|  |

### Return type

[**PrintProfileRevision**](PrintProfileRevision.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

# **downloadPrintCalibration**
> Uint8List downloadPrintCalibration(id, revision)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String id = id_example; // String |
final int revision = 56; // int |

try {
    final response = api.downloadPrintCalibration(id, revision);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->downloadPrintCalibration: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **revision** | **int**|  |

### Return type

[**Uint8List**](Uint8List.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, image/svg+xml

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAdminCustomer**
> AdminCustomerDetails getAdminCustomer(id)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String |

try {
    final response = api.getAdminCustomer(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->getAdminCustomer: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |

### Return type

[**AdminCustomerDetails**](AdminCustomerDetails.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAdminDesign**
> AdminDesignDetails getAdminDesign(id)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String id = id_example; // String |

try {
    final response = api.getAdminDesign(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->getAdminDesign: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |

### Return type

[**AdminDesignDetails**](AdminDesignDetails.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAdminDesignImage**
> Uint8List getAdminDesignImage(id)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String id = id_example; // String |

try {
    final response = api.getAdminDesignImage(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->getAdminDesignImage: $e\n');
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
 - **Accept**: application/problem+json, image/png, image/jpeg, image/webp

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAdminOrder**
> StaffOrder getAdminOrder(id)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String id = id_example; // String |

try {
    final response = api.getAdminOrder(id);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->getAdminOrder: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |

### Return type

[**StaffOrder**](StaffOrder.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAdminReportSummary**
> AdminSummary getAdminReportSummary(from, until)



SQL kayıt sayımları; tahsilat veya net satış değildir. from dahil, until hariç UTC günleridir (yyyy-MM-dd). until verilmezse isteğin alındığı an kullanılır. Müşteri sayısı, aralıkta kaydolan ve personel rolü olmayan müşteri hesaplarıdır; tüm hesap durumları dahildir.

### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String from = from_example; // String |
final String until = until_example; // String |

try {
    final response = api.getAdminReportSummary(from, until);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->getAdminReportSummary: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **from** | **String**|  | [optional]
 **until** | **String**|  | [optional]

### Return type

[**AdminSummary**](AdminSummary.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

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

# **getPrintProfileRevision**
> PrintProfileRevision getPrintProfileRevision(id, revision)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String id = id_example; // String |
final int revision = 56; // int |

try {
    final response = api.getPrintProfileRevision(id, revision);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->getPrintProfileRevision: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **revision** | **int**|  |

### Return type

[**PrintProfileRevision**](PrintProfileRevision.md)

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

# **listAdminCustomers**
> AdminCustomerPage listAdminCustomers(page, pageSize, query)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final int page = 56; // int |
final int pageSize = 56; // int |
final String query = query_example; // String |

try {
    final response = api.listAdminCustomers(page, pageSize, query);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->listAdminCustomers: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **int**|  | [optional]
 **pageSize** | **int**|  | [optional]
 **query** | **String**|  | [optional]

### Return type

[**AdminCustomerPage**](AdminCustomerPage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listAdminDesignOrders**
> AdminDesignOrderPage listAdminDesignOrders(id, page, pageSize)

Tasarım kimliğine bağlı sipariş referansları; müşteri bilgisi içermez.

### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String id = id_example; // String |
final int page = 56; // int |
final int pageSize = 56; // int |

try {
    final response = api.listAdminDesignOrders(id, page, pageSize);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->listAdminDesignOrders: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **page** | **int**|  | [optional]
 **pageSize** | **int**|  | [optional]

### Return type

[**AdminDesignOrderPage**](AdminDesignOrderPage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listAdminDesigns**
> AdminDesignPage listAdminDesigns(page, pageSize)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final int page = 56; // int |
final int pageSize = 56; // int |

try {
    final response = api.listAdminDesigns(page, pageSize);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->listAdminDesigns: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **int**|  | [optional]
 **pageSize** | **int**|  | [optional]

### Return type

[**AdminDesignPage**](AdminDesignPage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listPrintProfiles**
> BuiltList<PrintProfileRevision> listPrintProfiles()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();

try {
    final response = api.listPrintProfiles();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->listPrintProfiles: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**BuiltList&lt;PrintProfileRevision&gt;**](PrintProfileRevision.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **measurePrintPlacement**
> PrintMeasurement measurePrintPlacement(id, revision, measurePrintPlacement)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String id = id_example; // String |
final int revision = 56; // int |
final MeasurePrintPlacement measurePrintPlacement = ; // MeasurePrintPlacement |

try {
    final response = api.measurePrintPlacement(id, revision, measurePrintPlacement);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->measurePrintPlacement: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **revision** | **int**|  |
 **measurePrintPlacement** | [**MeasurePrintPlacement**](MeasurePrintPlacement.md)|  |

### Return type

[**PrintMeasurement**](PrintMeasurement.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retirePrintProfile**
> PrintProfileRevision retirePrintProfile(id, actOnPrintProfile)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final String id = id_example; // String |
final ActOnPrintProfile actOnPrintProfile = ; // ActOnPrintProfile |

try {
    final response = api.retirePrintProfile(id, actOnPrintProfile);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->retirePrintProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **actOnPrintProfile** | [**ActOnPrintProfile**](ActOnPrintProfile.md)|  |

### Return type

[**PrintProfileRevision**](PrintProfileRevision.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **savePrintProfileDraft**
> PrintProfileRevision savePrintProfileDraft(savePrintProfile)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAdminApi();
final SavePrintProfile savePrintProfile = ; // SavePrintProfile |

try {
    final response = api.savePrintProfileDraft(savePrintProfile);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminApi->savePrintProfileDraft: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **savePrintProfile** | [**SavePrintProfile**](SavePrintProfile.md)|  |

### Return type

[**PrintProfileRevision**](PrintProfileRevision.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
