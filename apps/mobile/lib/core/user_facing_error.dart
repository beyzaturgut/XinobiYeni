/// An error whose [message] is written for the customer. Any other error (a bug, an unexpected client failure) is shown
/// with a general sentence instead of its technical text.
abstract interface class UserFacingException implements Exception {
  String get message;
}

const unexpectedErrorMessage = 'Bir sorun oluştu. Bağlantını kontrol edip tekrar dene.';

String userMessage(Object error) => error is UserFacingException ? error.message : unexpectedErrorMessage;
