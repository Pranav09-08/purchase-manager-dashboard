import 'package:dealtrackuser/services/api_service.dart';

class VendorAnalyticsService {
  Future<Map<String, dynamic>> getVendorAnalytics({int? year}) async {
    final path = year != null
        ? "/analytics/product-manager?year=$year"
        : "/analytics/product-manager";

    final response = await ApiService.get(path);

    if (response is Map<String, dynamic>) {
      return response;
    }

    if (response is Map) {
      return Map<String, dynamic>.from(response);
    }

    return {};
  }
}