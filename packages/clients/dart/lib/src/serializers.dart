//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_import

import 'package:one_of_serializer/any_of_serializer.dart';
import 'package:one_of_serializer/one_of_serializer.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/serializer.dart';
import 'package:built_value/standard_json_plugin.dart';
import 'package:built_value/iso_8601_date_time_serializer.dart';
import 'package:xinobi_api_client/src/date_serializer.dart';
import 'package:xinobi_api_client/src/model/date.dart';

import 'package:xinobi_api_client/src/model/account_email_verification.dart';
import 'package:xinobi_api_client/src/model/account_profile.dart';
import 'package:xinobi_api_client/src/model/admin_session.dart';
import 'package:xinobi_api_client/src/model/announcement_item.dart';
import 'package:xinobi_api_client/src/model/announcement_list.dart';
import 'package:xinobi_api_client/src/model/auth_session.dart';
import 'package:xinobi_api_client/src/model/availability.dart';
import 'package:xinobi_api_client/src/model/category_highlight.dart';
import 'package:xinobi_api_client/src/model/category_item.dart';
import 'package:xinobi_api_client/src/model/category_list.dart';
import 'package:xinobi_api_client/src/model/change_my_password.dart';
import 'package:xinobi_api_client/src/model/confirm_email_change.dart';
import 'package:xinobi_api_client/src/model/create_xinobi_u_session.dart';
import 'package:xinobi_api_client/src/model/customer_address.dart';
import 'package:xinobi_api_client/src/model/customer_order.dart';
import 'package:xinobi_api_client/src/model/customer_order_line.dart';
import 'package:xinobi_api_client/src/model/delete_my_account.dart';
import 'package:xinobi_api_client/src/model/dependency_health.dart';
import 'package:xinobi_api_client/src/model/health_response.dart';
import 'package:xinobi_api_client/src/model/home_content.dart';
import 'package:xinobi_api_client/src/model/home_slide.dart';
import 'package:xinobi_api_client/src/model/login_account.dart';
import 'package:xinobi_api_client/src/model/logout_session.dart';
import 'package:xinobi_api_client/src/model/money.dart';
import 'package:xinobi_api_client/src/model/permission_catalog_response.dart';
import 'package:xinobi_api_client/src/model/place_order.dart';
import 'package:xinobi_api_client/src/model/place_order_item.dart';
import 'package:xinobi_api_client/src/model/problem_details.dart';
import 'package:xinobi_api_client/src/model/product_detail.dart';
import 'package:xinobi_api_client/src/model/product_page.dart';
import 'package:xinobi_api_client/src/model/product_summary.dart';
import 'package:xinobi_api_client/src/model/readiness_response.dart';
import 'package:xinobi_api_client/src/model/refresh_session.dart';
import 'package:xinobi_api_client/src/model/register_account.dart';
import 'package:xinobi_api_client/src/model/save_customer_address.dart';
import 'package:xinobi_api_client/src/model/start_account_email_verification.dart';
import 'package:xinobi_api_client/src/model/start_email_change.dart';
import 'package:xinobi_api_client/src/model/update_my_account.dart';
import 'package:xinobi_api_client/src/model/variant_detail.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_answer.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_generation_request.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_option.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_product.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_question.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_session.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_status.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_variant.dart';

part 'serializers.g.dart';

@SerializersFor([
  AccountEmailVerification,
  AccountProfile,
  AdminSession,
  AnnouncementItem,
  AnnouncementList,
  AuthSession,
  Availability,
  CategoryHighlight,
  CategoryItem,
  CategoryList,
  ChangeMyPassword,
  ConfirmEmailChange,
  CreateXinobiUSession,
  CustomerAddress,
  CustomerOrder,
  CustomerOrderLine,
  DeleteMyAccount,
  DependencyHealth,
  HealthResponse,
  HomeContent,
  HomeSlide,
  LoginAccount,
  LogoutSession,
  Money,
  PermissionCatalogResponse,
  PlaceOrder,
  PlaceOrderItem,
  ProblemDetails,
  ProductDetail,
  ProductPage,
  ProductSummary,
  ReadinessResponse,
  RefreshSession,
  RegisterAccount,
  SaveCustomerAddress,
  StartAccountEmailVerification,
  StartEmailChange,
  UpdateMyAccount,
  VariantDetail,
  XinobiUAnswer,
  XinobiUGenerationRequest,
  XinobiUOption,
  XinobiUProduct,
  XinobiUQuestion,
  XinobiUSession,
  XinobiUStatus,
  XinobiUVariant,
])
Serializers serializers = (_$serializers.toBuilder()
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(ProductSummary)]),
        () => ListBuilder<ProductSummary>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(CategoryItem)]),
        () => ListBuilder<CategoryItem>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(AnnouncementItem)]),
        () => ListBuilder<AnnouncementItem>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(XinobiUOption)]),
        () => ListBuilder<XinobiUOption>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(HomeSlide)]),
        () => ListBuilder<HomeSlide>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(CategoryHighlight)]),
        () => ListBuilder<CategoryHighlight>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(CustomerAddress)]),
        () => ListBuilder<CustomerAddress>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(XinobiUQuestion)]),
        () => ListBuilder<XinobiUQuestion>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(PlaceOrderItem)]),
        () => ListBuilder<PlaceOrderItem>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(DependencyHealth)]),
        () => ListBuilder<DependencyHealth>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(VariantDetail)]),
        () => ListBuilder<VariantDetail>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(CustomerOrderLine)]),
        () => ListBuilder<CustomerOrderLine>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(XinobiUAnswer)]),
        () => ListBuilder<XinobiUAnswer>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(String)]),
        () => ListBuilder<String>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(CustomerOrder)]),
        () => ListBuilder<CustomerOrder>(),
      )
      ..add(const OneOfSerializer())
      ..add(const AnyOfSerializer())
      ..add(const DateSerializer())
      ..add(Iso8601DateTimeSerializer())
    ).build();

Serializers standardSerializers =
    (serializers.toBuilder()..addPlugin(StandardJsonPlugin())).build();
