# xinobi_api_client.api.ContentApi

## Load the API package
```dart
import 'package:xinobi_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getHomeContent**](ContentApi.md#gethomecontent) | **GET** /api/v1/content/home |
[**listAnnouncements**](ContentApi.md#listannouncements) | **GET** /api/v1/content/announcements |


# **getHomeContent**
> HomeContent getHomeContent()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getContentApi();

try {
    final response = api.getHomeContent();
    print(response);
} on DioException catch (e) {
    print('Exception when calling ContentApi->getHomeContent: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**HomeContent**](HomeContent.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listAnnouncements**
> AnnouncementList listAnnouncements()



### Example
```dart
import 'package:xinobi_api_client/api.dart';

final api = XinobiApiClient().getContentApi();

try {
    final response = api.listAnnouncements();
    print(response);
} on DioException catch (e) {
    print('Exception when calling ContentApi->listAnnouncements: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**AnnouncementList**](AnnouncementList.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
