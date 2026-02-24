import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

class VendorListService {
  final Dio dio = Dio(BaseOptions(baseUrl: "https://dqwltqhs-3000.inc1.devtunnels.ms/api"));

  Future<List<Map<String, dynamic>>> fetchVendors({String? filter}) async {
    final user = FirebaseAuth.instance.currentUser;
    final idToken = await user?.getIdToken();
    final Map<String, dynamic> headers = idToken != null ? {"Authorization": "Bearer $idToken"} : <String, dynamic>{};

    final res = await dio.get("/auth/registrations", options: Options(headers: headers));
    final raw = res.data is List ? res.data : [];
    List<Map<String, dynamic>> all = raw.map<Map<String, dynamic>>((r) => Map<String, dynamic>.from(r as Map)).toList();
    if (filter != null) {
      all = all.where((v) => v['status'] == filter).toList();
    }
    return all;
  }
}
