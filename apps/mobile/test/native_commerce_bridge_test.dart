import 'dart:convert';
import 'dart:typed_data';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/core/api_config.dart';
import 'package:xinobi_mobile/features/account/auth.dart';
import 'package:xinobi_mobile/features/cart/cart.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/features/personalization/native_commerce_bridge.dart';
import 'account_test.dart' show FakeAccounts, MemoryTokens;

class RecordingAdapter implements HttpClientAdapter {
 final requests=<RequestOptions>[];
 bool expired=true;
 @override
 Future<ResponseBody> fetch(RequestOptions options, Stream<Uint8List>? stream, Future<void>? cancel) async {
  requests.add(options);
  if(expired){expired=false;return ResponseBody.fromString('{"title":"expired"}',401,headers:{'content-type':['application/json']});}
  return ResponseBody.fromString('{"id":"private-design"}',200,headers:{'content-type':['application/json']});
 }
 @override void close({bool force=false}){}
}

void main(){
 setUp(()=>SharedPreferences.setMockInitialValues({}));
 test('native requests refresh the app session; tokens are never sent back to the WebView',() async {
  final adapter=RecordingAdapter(),accounts=FakeAccounts(),tokens=MemoryTokens();
  final dio=Dio(BaseOptions(baseUrl:'https://api.example.test'))..httpClientAdapter=adapter;
  final container=ProviderContainer(overrides:[accountRepositoryProvider.overrideWithValue(accounts),tokenStoreProvider.overrideWithValue(tokens),apiClientProvider.overrideWithValue(XinobiApiClient(dio:dio,interceptors:[]))]);
  addTearDown(container.dispose);
  final auth=container.read(authProvider.notifier);await Future<void>.delayed(Duration.zero);await auth.login('ayse@example.com','guclu-parola-1');
  final reply=await container.read(nativeCommerceBridgeProvider).handle(jsonEncode({'id':'request-1','action':'account','payload':{'path':'/me/designs','method':'GET'}}));
  expect(reply['status'],200);expect(adapter.requests.length,2);expect(accounts.refreshCount,1);
  expect(adapter.requests.first.headers['Authorization'],'Bearer access-login');
  expect(adapter.requests.last.headers['Authorization'],'Bearer access-r1');
  expect(jsonEncode(reply),isNot(contains('access-')));expect(jsonEncode(reply),isNot(contains('refresh-')));
  final rejected=await container.read(nativeCommerceBridgeProvider).handle(jsonEncode({'id':'request-2','action':'account','payload':{'path':'https://outside.test/steal','method':'GET'}}));
  expect(rejected['error'],isNotNull);expect(adapter.requests.length,2);
 });
 test('native cart round trip retains placements, revisions, quantity and rejects a stale editor',() async {
  final container=ProviderContainer();addTearDown(container.dispose);
  final cart=container.read(cartProvider.notifier);await cart.ready;
  final configuration=List.filled(32,'c').join(),design=List.filled(32,'d').join();
  final row={'productId':'P1','variantId':'V1','quantity':2,'designId':design,'designName':'Desen','configurationId':configuration,'configurationRevision':1,'designPlacement':{'sourceWidth':100,'sourceHeight':100,'surfaceVersion':List.filled(64,'a').join(),'x':60,'y':50,'scale':1,'rotation':30,'curvatureStrength':.5,'mode':'pattern','fillMask':true}};
  final bridge=container.read(nativeCommerceBridgeProvider);
  final added=await bridge.handle(jsonEncode({'id':'add','action':'cart.write','payload':{'previous':[],'rows':[row]}}));expect(added['status'],204);
  final snapshot=await bridge.handle(jsonEncode({'id':'read','action':'cart.read','payload':{}}));expect(snapshot['body'],[row]);
  await cart.setLineQuantity(container.read(cartProvider).single.key,3);
  final stale=await bridge.handle(jsonEncode({'id':'stale','action':'cart.write','payload':{'previous':[row],'rows':[]}}));expect(stale['error'],contains('başka bir işlemde'));
  expect(container.read(cartProvider).single.quantity,3);
  final second={...row,'quantity':1,'configurationRevision':2};
  await cart.replaceFromPreview(parseCart(jsonEncode([...container.read(cartProvider).map((line)=>line.toJson()),second])),container.read(cartProvider));
  await cart.setLineQuantity(container.read(cartProvider).first.key,0);
  final stored=parseCart((await SharedPreferences.getInstance()).getString(cartStorageKey));
  expect(stored.single.configurationRevision,2);expect(stored.single.configurationPlacement!['rotation'],30);
 });
 test('editing a source and colour from the shared preview preserves native cart quantities and other designs',() async {
  final container=ProviderContainer();addTearDown(container.dispose);
  await container.read(cartProvider.notifier).ready;
  final configuration=List.filled(32,'c').join(),design=List.filled(32,'d').join();
  final row={'productId':'P1','variantId':'blue','quantity':2,'designId':design,'designName':'Desen','configurationId':configuration,'configurationRevision':1,'designPlacement':{'sourceWidth':100,'sourceHeight':100,'surfaceVersion':List.filled(64,'a').join(),'x':60,'y':50,'scale':1,'rotation':0,'curvatureStrength':.5,'mode':'pattern','fillMask':true}};
  final other={...row,'configurationId':List.filled(32,'e').join(),'quantity':1};
  final bridge=container.read(nativeCommerceBridgeProvider);
  await bridge.handle(jsonEncode({'id':'add','action':'cart.write','payload':{'previous':[],'rows':[row,other]}}));
  final changed={...row,'variantId':'red','designId':List.filled(32,'f').join(),'configurationRevision':2};
  final result=await bridge.handle(jsonEncode({'id':'edit','action':'cart.write','payload':{'previous':[row,other],'rows':[changed,other]}}));
  expect(result['status'],204);
  final stored=parseCart((await SharedPreferences.getInstance()).getString(cartStorageKey));
  expect(stored.map((line)=>line.toJson()).toList(),[changed,other]);
 });
 test('saved design links encode the exact cart row and revision on the configured preview origin',(){
  final uri=xinobiSavedDesignUri(designId:List.filled(32,'d').join(),configurationId:List.filled(32,'c').join(),revision:3,variantId:'V1',line:'P1:V1:design:config:3',override:'https://shop.example.test/untrusted?token=never');
  expect(uri!.origin,'https://shop.example.test');expect(uri.path,'/hesap/tasarimlarim/onizleme/');expect(uri.queryParameters['line'],'P1:V1:design:config:3');expect(uri.queryParameters['revision'],'3');expect(uri.queryParameters.containsKey('token'),false);
 });
}
