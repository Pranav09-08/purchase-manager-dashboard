
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

class VendorDetailService {
  final Dio dio = Dio(BaseOptions(baseUrl: "https://dqwltqhs-3000.inc1.devtunnels.ms/api"));

  Future<Map<String, dynamic>> fetchVendorDetail(String vendorId) async {
    final user = FirebaseAuth.instance.currentUser;
    final idToken = await user?.getIdToken();
    final Map<String, dynamic> headers = idToken != null ? {"Authorization": "Bearer $idToken"} : <String, dynamic>{};
    final res = await dio.get("/auth/registrations/$vendorId", options: Options(headers: headers));
    return Map<String, dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> approveVendor(String vendorId) async {
    final user = FirebaseAuth.instance.currentUser;
    final idToken = await user?.getIdToken();
    final Map<String, dynamic> headers = idToken != null ? {"Authorization": "Bearer $idToken"} : <String, dynamic>{};
    final res = await dio.post("/auth/registrations/$vendorId/approve", options: Options(headers: headers));
    return Map<String, dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> rejectVendor(String vendorId, {String? reason}) async {
    final user = FirebaseAuth.instance.currentUser;
    final idToken = await user?.getIdToken();
    final Map<String, dynamic> headers = idToken != null ? {"Authorization": "Bearer $idToken"} : <String, dynamic>{};
    final res = await dio.post(
      "/auth/registrations/$vendorId/reject",
      data: {"reason": reason},
      options: Options(headers: headers),
    );
    return Map<String, dynamic>.from(res.data);
  }
}
