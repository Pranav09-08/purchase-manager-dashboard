import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

class OverviewService {
  final Dio dio = Dio(BaseOptions(baseUrl: "https://dqwltqhs-3000.inc1.devtunnels.ms/api"));

  Future<Map<String, dynamic>> fetchOverviewStats() async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      final idToken = await user?.getIdToken();
      final Map<String, dynamic> headers = idToken != null ? {"Authorization": "Bearer $idToken"} : <String, dynamic>{};

      // Fetch supplier registrations
      final regRes = await dio.get("/auth/registrations", options: Options(headers: headers));
      final registrationsRaw = regRes.data is List ? regRes.data : [];
      final List<Map<String, dynamic>> registrations = registrationsRaw.map<Map<String, dynamic>>((r) => Map<String, dynamic>.from(r as Map)).toList();

      int approved = 0, pending = 0, rejected = 0;
      for (final r in registrations) {
        if (r['status'] == 'approved') {
          approved++;
        } else if (r['status'] == 'pending') {
          pending++;
        } else if (r['status'] == 'rejected') {
          rejected++;
        }
      }

      // Get recent registrations (last 5, sorted by created_at desc)
      List<Map<String, dynamic>> recent = List<Map<String, dynamic>>.from(registrations);
      recent.sort((a, b) {
        final aDate = DateTime.tryParse(a['created_at'] ?? '') ?? DateTime(1970);
        final bDate = DateTime.tryParse(b['created_at'] ?? '') ?? DateTime(1970);
        return bDate.compareTo(aDate);
      });
      final recentRegistrations = recent.take(5).toList();

      // Fetch vendor products
      final prodRes = await dio.get("/admin/vendor-products", options: Options(headers: headers));
      final productsRaw = prodRes.data['products'] ?? [];
      final List<Map<String, dynamic>> products = productsRaw.map<Map<String, dynamic>>((p) => p is Map<String, dynamic> ? p : Map<String, dynamic>.from(p as Map)).toList();

      return {
        'totalSuppliers': registrations.length,
        'approvedSuppliers': approved,
        'pendingSuppliers': pending,
        'rejectedSuppliers': rejected,
        'totalVendorProducts': products.length,
        'recentRegistrations': recentRegistrations,
      };
    } catch (e) {
      rethrow;
    }
  }
}
