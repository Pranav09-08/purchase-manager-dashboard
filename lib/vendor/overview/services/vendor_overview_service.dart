import 'package:firebase_auth/firebase_auth.dart';
import '../../../services/api_service.dart';

class OverviewService {

  Future<Map<String, dynamic>> _asMap(dynamic response) async {
    if (response is Map<String, dynamic>) return response;
    if (response is Map) return Map<String, dynamic>.from(response);
    return {};
  }

  Future<String?> _getVendorIdFromClaims() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return null;
    final tokenResult = await user.getIdTokenResult(true);
    final claims = tokenResult.claims ?? {};
    return (claims['vendor_id'] ?? claims['vendorId'])?.toString();
  }

  Future<Map<String, dynamic>> _getProfileResponse(String vendorId) async {
    try {
      return await _asMap(await ApiService.get("/vendor/profile/$vendorId"));
    } catch (_) {
      return await _asMap(await ApiService.get("/vendor/profile"));
    }
  }

  Future<Map<String, dynamic>> _updateProfileResponse(
    String vendorId,
    Map<String, dynamic> body,
  ) async {
    try {
      return await _asMap(await ApiService.put("/vendor/profile/$vendorId", body));
    } catch (_) {
      return await _asMap(await ApiService.put("/vendor/profile", body));
    }
  }

  // ===============================
  // GET Vendor Profile
  // ===============================
  Future<Map<String, dynamic>> getVendorProfile() async {
    final vendorId = await _getVendorIdFromClaims();
    if (vendorId == null) return {};

    final response = await _getProfileResponse(vendorId);

    return response["vendor"] ?? {};
  }

  // ===============================
  // UPDATE Vendor Profile
  // ===============================
  Future<void> updateVendorProfile(
      String vendorId, Map<String, dynamic> body) async {
    await _updateProfileResponse(vendorId, body);
  }

  // ===============================
  // KPI METHODS (keep your existing)
  // ===============================

  Future<int> getActiveComponents() async {
    final response = await _asMap(await ApiService.get("/vendor/components"));
    final List products = (response["products"] as List?) ?? [];
    return products.length;
  }

  Future<int> getOpenEnquiries() async {
    final vendorId = await _getVendorIdFromClaims();
    final path = vendorId == null
        ? "/purchase/enquiries"
        : "/purchase/enquiries?vendorId=$vendorId";

    final response = await _asMap(await ApiService.get(path));
    return response["total"] ?? 0;
  }

  Future<int> getPendingOrders() async {
    final vendorId = await _getVendorIdFromClaims();
    final path = vendorId == null
        ? "/purchase/orders"
        : "/purchase/orders?vendorId=$vendorId";

    final response = await _asMap(await ApiService.get(path));
    return response["total"] ?? 0;
  }

  Future<int> getPendingInvoices() async {
    final vendorId = await _getVendorIdFromClaims();
    final path = vendorId == null
        ? "/vendor/invoices"
        : "/vendor/invoices?vendorId=$vendorId";

    final response = await _asMap(await ApiService.get(path));
    return response["total"] ?? 0;
  }
}