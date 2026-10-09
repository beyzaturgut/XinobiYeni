// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'serializers.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

Serializers _$serializers = (Serializers().toBuilder()
      ..add(AccountEmailVerification.serializer)
      ..add(AccountProfile.serializer)
      ..add(AdminSession.serializer)
      ..add(AnnouncementItem.serializer)
      ..add(AnnouncementList.serializer)
      ..add(AuthSession.serializer)
      ..add(Availability.serializer)
      ..add(CancelMyOrder.serializer)
      ..add(CategoryHighlight.serializer)
      ..add(CategoryItem.serializer)
      ..add(CategoryList.serializer)
      ..add(ChangeMyPassword.serializer)
      ..add(ConfirmEmailChange.serializer)
      ..add(CreateXinobiUSession.serializer)
      ..add(CustomerAddress.serializer)
      ..add(CustomerOrder.serializer)
      ..add(CustomerOrderLine.serializer)
      ..add(DeleteMyAccount.serializer)
      ..add(DependencyHealth.serializer)
      ..add(HealthResponse.serializer)
      ..add(HomeContent.serializer)
      ..add(HomeSlide.serializer)
      ..add(Inbox.serializer)
      ..add(InboxItem.serializer)
      ..add(LoginAccount.serializer)
      ..add(LogoutSession.serializer)
      ..add(MarkNotificationsRead.serializer)
      ..add(Money.serializer)
      ..add(MyReview.serializer)
      ..add(OrderEvent.serializer)
      ..add(OrderOptions.serializer)
      ..add(OrderRequest.serializer)
      ..add(OrderRequestLine.serializer)
      ..add(OrderShipment.serializer)
      ..add(PermissionCatalogResponse.serializer)
      ..add(PlaceOrder.serializer)
      ..add(PlaceOrderItem.serializer)
      ..add(ProblemDetails.serializer)
      ..add(ProductDetail.serializer)
      ..add(ProductPage.serializer)
      ..add(ProductSpec.serializer)
      ..add(ProductSummary.serializer)
      ..add(PublicReview.serializer)
      ..add(ReadinessResponse.serializer)
      ..add(RefreshSession.serializer)
      ..add(RegisterAccount.serializer)
      ..add(RegisterDevice.serializer)
      ..add(RemoveDevice.serializer)
      ..add(ReturnMyOrder.serializer)
      ..add(ReviewPage.serializer)
      ..add(ReviewSummary.serializer)
      ..add(ReviewSummaryList.serializer)
      ..add(SaveCustomerAddress.serializer)
      ..add(StartAccountEmailVerification.serializer)
      ..add(StartEmailChange.serializer)
      ..add(SubmitReview.serializer)
      ..add(UpdateMyAccount.serializer)
      ..add(VariantDetail.serializer)
      ..add(XinobiUAnswer.serializer)
      ..add(XinobiUGenerationRequest.serializer)
      ..add(XinobiUOption.serializer)
      ..add(XinobiUProduct.serializer)
      ..add(XinobiUQuestion.serializer)
      ..add(XinobiUSession.serializer)
      ..add(XinobiUStatus.serializer)
      ..add(XinobiUVariant.serializer)
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(AnnouncementItem)]),
          () => ListBuilder<AnnouncementItem>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(CategoryItem)]),
          () => ListBuilder<CategoryItem>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(CustomerOrderLine)]),
          () => ListBuilder<CustomerOrderLine>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(OrderEvent)]),
          () => ListBuilder<OrderEvent>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(OrderRequest)]),
          () => ListBuilder<OrderRequest>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(DependencyHealth)]),
          () => ListBuilder<DependencyHealth>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(HomeSlide)]),
          () => ListBuilder<HomeSlide>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(ProductSummary)]),
          () => ListBuilder<ProductSummary>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(CategoryHighlight)]),
          () => ListBuilder<CategoryHighlight>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(InboxItem)]),
          () => ListBuilder<InboxItem>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(OrderRequestLine)]),
          () => ListBuilder<OrderRequestLine>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(OrderRequestLine)]),
          () => ListBuilder<OrderRequestLine>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(PlaceOrderItem)]),
          () => ListBuilder<PlaceOrderItem>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(ProductSummary)]),
          () => ListBuilder<ProductSummary>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(PublicReview)]),
          () => ListBuilder<PublicReview>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(ReviewSummary)]),
          () => ListBuilder<ReviewSummary>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(String)]),
          () => ListBuilder<String>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(String)]),
          () => ListBuilder<String>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(String)]),
          () => ListBuilder<String>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(String)]),
          () => ListBuilder<String>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(String)]),
          () => ListBuilder<String>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(String)]),
          () => ListBuilder<String>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(String)]),
          () => ListBuilder<String>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(String)]),
          () => ListBuilder<String>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(VariantDetail)]),
          () => ListBuilder<VariantDetail>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(String)]),
          () => ListBuilder<String>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(ProductSpec)]),
          () => ListBuilder<ProductSpec>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(XinobiUAnswer)]),
          () => ListBuilder<XinobiUAnswer>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(XinobiUOption)]),
          () => ListBuilder<XinobiUOption>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(XinobiUQuestion)]),
          () => ListBuilder<XinobiUQuestion>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(XinobiUAnswer)]),
          () => ListBuilder<XinobiUAnswer>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(int)]),
          () => ListBuilder<int>()))
    .build();

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
