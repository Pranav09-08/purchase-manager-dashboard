import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../utils/auth_api_service.dart';

enum UserRole { admin, vendor, none }

class AuthProvider extends ChangeNotifier {
  final AuthApiService _api = AuthApiService();

  UserRole role = UserRole.none;
  bool loading = false;

  Future<void> login(String email, String password) async {
    try {
      loading = true;
      notifyListeners();

      // clear previous session
      await FirebaseAuth.instance.signOut();

      final res = await _api.login(email, password);

      final credential = await FirebaseAuth.instance
          .signInWithCustomToken(res.customToken);

      await credential.user?.getIdToken(true);

      role = res.userType == "admin"
          ? UserRole.admin
          : UserRole.vendor;
    } catch (e) {
      debugPrint("Login error: $e");
      rethrow;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await FirebaseAuth.instance.signOut();
    role = UserRole.none;
    notifyListeners();
  }
}
