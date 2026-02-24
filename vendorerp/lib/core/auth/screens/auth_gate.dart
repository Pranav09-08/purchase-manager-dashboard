import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../purchase_manager/dashboard/screens/admin_dashboard.dart';
import '../../../vendor/dashboard/screens/vendor_dashboard.dart';
import '../provider/auth_provider.dart';
import 'login_screen.dart';


class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (auth.loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    switch (auth.role) {
      case UserRole.admin:
        return const AdminDashboard();
      case UserRole.vendor:
        return const VendorDashboard();
      default:
        return const LoginScreen();
    }
  }
}
