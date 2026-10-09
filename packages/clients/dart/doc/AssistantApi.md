# xinobi_api_client.api.AssistantApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getAssistantConfig**](AssistantApi.md#getassistantconfig) | **GET** /api/v1/assistant/config |
[**getAssistantConversation**](AssistantApi.md#getassistantconversation) | **GET** /api/v1/assistant/conversations/{id} |
[**requestAssistantHandoff**](AssistantApi.md#requestassistanthandoff) | **POST** /api/v1/assistant/conversations/{id}/handoff |
[**sendAssistantLead**](AssistantApi.md#sendassistantlead) | **POST** /api/v1/assistant/conversations/{id}/lead |
[**sendAssistantMessage**](AssistantApi.md#sendassistantmessage) | **POST** /api/v1/assistant/messages |


# **getAssistantConfig**
> AssistantConfig getAssistantConfig()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAssistantApi();

try {
    final response = api.getAssistantConfig();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AssistantApi->getAssistantConfig: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**AssistantConfig**](AssistantConfig.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAssistantConversation**
> AssistantConversationView getAssistantConversation(id, clientId)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAssistantApi();
final String id = id_example; // String |
final String clientId = clientId_example; // String |

try {
    final response = api.getAssistantConversation(id, clientId);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AssistantApi->getAssistantConversation: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **clientId** | **String**|  |

### Return type

[**AssistantConversationView**](AssistantConversationView.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestAssistantHandoff**
> AssistantHandoff requestAssistantHandoff(id, assistantHandoffRequest)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAssistantApi();
final String id = id_example; // String |
final AssistantHandoffRequest assistantHandoffRequest = ; // AssistantHandoffRequest |

try {
    final response = api.requestAssistantHandoff(id, assistantHandoffRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AssistantApi->requestAssistantHandoff: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **assistantHandoffRequest** | [**AssistantHandoffRequest**](AssistantHandoffRequest.md)|  |

### Return type

[**AssistantHandoff**](AssistantHandoff.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sendAssistantLead**
> AssistantLead sendAssistantLead(id, assistantLeadRequest)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAssistantApi();
final String id = id_example; // String |
final AssistantLeadRequest assistantLeadRequest = ; // AssistantLeadRequest |

try {
    final response = api.sendAssistantLead(id, assistantLeadRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AssistantApi->sendAssistantLead: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  |
 **assistantLeadRequest** | [**AssistantLeadRequest**](AssistantLeadRequest.md)|  |

### Return type

[**AssistantLead**](AssistantLead.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sendAssistantMessage**
> AssistantReply sendAssistantMessage(assistantMessageRequest)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getAssistantApi();
final AssistantMessageRequest assistantMessageRequest = ; // AssistantMessageRequest |

try {
    final response = api.sendAssistantMessage(assistantMessageRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AssistantApi->sendAssistantMessage: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **assistantMessageRequest** | [**AssistantMessageRequest**](AssistantMessageRequest.md)|  |

### Return type

[**AssistantReply**](AssistantReply.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
