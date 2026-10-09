# xinobi_api_client.model.CustomerOrder

## Load the model package
```dart
import 'package:xinobi_api_client/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  |
**number** | **String** |  |
**createdAt** | [**DateTime**](DateTime.md) |  |
**status** | **String** |  |
**address** | [**CustomerAddress**](CustomerAddress.md) |  |
**lines** | [**BuiltList&lt;CustomerOrderLine&gt;**](CustomerOrderLine.md) |  |
**total** | [**Money**](Money.md) |  |
**shipment** | [**OrderShipment**](OrderShipment.md) |  | [optional]
**history** | [**BuiltList&lt;OrderEvent&gt;**](OrderEvent.md) |  | [optional]
**requests** | [**BuiltList&lt;OrderRequest&gt;**](OrderRequest.md) |  | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
