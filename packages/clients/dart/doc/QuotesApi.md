# xinobi_api_client.api.QuotesApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createQuote**](QuotesApi.md#createquote) | **POST** /api/v1/quotes |
[**decideQuote**](QuotesApi.md#decidequote) | **POST** /api/v1/quotes/{code}/decision |
[**getQuoteOptions**](QuotesApi.md#getquoteoptions) | **GET** /api/v1/quotes/options |
[**sendQuoteMessage**](QuotesApi.md#sendquotemessage) | **POST** /api/v1/quotes/{code}/messages |
[**trackQuote**](QuotesApi.md#trackquote) | **GET** /api/v1/quotes/{code} |


# **createQuote**
> Quote createQuote(createQuote)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getQuotesApi();
final CreateQuote createQuote = ; // CreateQuote |

try {
    final response = api.createQuote(createQuote);
    print(response);
} on DioException catch (e) {
    print('Exception when calling QuotesApi->createQuote: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createQuote** | [**CreateQuote**](CreateQuote.md)|  |

### Return type

[**Quote**](Quote.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **decideQuote**
> Quote decideQuote(code, quoteDecision)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getQuotesApi();
final String code = code_example; // String |
final QuoteDecision quoteDecision = ; // QuoteDecision |

try {
    final response = api.decideQuote(code, quoteDecision);
    print(response);
} on DioException catch (e) {
    print('Exception when calling QuotesApi->decideQuote: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **code** | **String**|  |
 **quoteDecision** | [**QuoteDecision**](QuoteDecision.md)|  |

### Return type

[**Quote**](Quote.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getQuoteOptions**
> QuoteOptions getQuoteOptions()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getQuotesApi();

try {
    final response = api.getQuoteOptions();
    print(response);
} on DioException catch (e) {
    print('Exception when calling QuotesApi->getQuoteOptions: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**QuoteOptions**](QuoteOptions.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sendQuoteMessage**
> Quote sendQuoteMessage(code, trackQuoteMessage)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getQuotesApi();
final String code = code_example; // String |
final TrackQuoteMessage trackQuoteMessage = ; // TrackQuoteMessage |

try {
    final response = api.sendQuoteMessage(code, trackQuoteMessage);
    print(response);
} on DioException catch (e) {
    print('Exception when calling QuotesApi->sendQuoteMessage: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **code** | **String**|  |
 **trackQuoteMessage** | [**TrackQuoteMessage**](TrackQuoteMessage.md)|  |

### Return type

[**Quote**](Quote.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **trackQuote**
> Quote trackQuote(code, email)



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getQuotesApi();
final String code = code_example; // String |
final String email = email_example; // String |

try {
    final response = api.trackQuote(code, email);
    print(response);
} on DioException catch (e) {
    print('Exception when calling QuotesApi->trackQuote: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **code** | **String**|  |
 **email** | **String**|  |

### Return type

[**Quote**](Quote.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
