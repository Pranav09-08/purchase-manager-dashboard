// import 'dart:io';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:image_picker/image_picker.dart';
// import 'api_service.dart';
//
// class VendorAuthService {
//   final FirebaseAuth _auth = FirebaseAuth.instance;
//
//   /* =========================================================
//      🔵 VENDOR SIGNUP
//      Calls: POST /vendor/signup
//      ========================================================= */
//   Future<void> registerVendor({
//     required String name,
//     required String email,
//     required String phone,
//     required String address,
//     required String companyName,
//     required String companyTin,
//     required String companyAddress,
//     required String companyWebsite,
//     String? certificateBase64,
//   }) async {
//     try {
//       final response = await ApiService.postPublic(
//         "/vendor/signup",
//         {
//           "name": name,
//           "email": email,
//           "phone": phone,
//           "address": address,
//           "companyName": companyName,
//           "companyTin": companyTin,
//           "companyAddress": companyAddress,
//           "companyWebsite": companyWebsite,
//           "certificateUrl": certificateBase64 ?? "",
//         },
//       );
//
//       if (response["error"] != null) {
//         throw Exception(response["error"]);
//       }
//     } catch (e) {
//       rethrow;
//     }
//   }
//
//   /* =========================================================
//      🔵 VENDOR LOGIN
//      Calls: POST /vendor/login
//      ========================================================= */
//   Future<Map<String, dynamic>> loginVendor({
//     required String email,
//     required String password,
//   }) async {
//     // 1️⃣ Login via Firebase (password handled here)
//     final cred = await _auth.signInWithEmailAndPassword(
//       email: email,
//       password: password,
//     );
//
//     final user = cred.user;
//     if (user == null) {
//       throw Exception("Login failed");
//     }
//
//     final token = await user.getIdToken(true);
//
//     // 2️⃣ Verify with backend
//     final response = await ApiService.postPublic(
//       "/vendor/login",
//       {
//         "token": token,
//       },
//     );
//
//     if (response["error"] != null) {
//       await _auth.signOut();
//       throw Exception(response["error"]);
//     }
//
//     return response;
//   }
// }