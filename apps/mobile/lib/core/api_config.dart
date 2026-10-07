/// Base URL of the Xinobi API.
///
/// Override with `--dart-define=API_BASE_URL=https://…` for test or production builds.
/// Development defaults reach the API on the developer machine: the Android emulator sees the host as 10.0.2.2,
/// the iOS simulator shares the host loopback. The development API only accepts loopback connections, so a physical
/// device needs a reachable test environment (Faz03 03.10) and an explicit override.
String apiBaseUrl({required bool isAndroid, String override = const String.fromEnvironment('API_BASE_URL')}) {
  if (override.isNotEmpty) return override.endsWith('/') ? override.substring(0, override.length - 1) : override;
  return isAndroid ? 'http://10.0.2.2:5003' : 'http://127.0.0.1:5003';
}
