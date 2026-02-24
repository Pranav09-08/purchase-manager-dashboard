import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/auth/provider/auth_provider.dart';

class VendorDashboard extends StatelessWidget {
  const VendorDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Vendor"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().logout(),
          )
        ],
      ),
      body: const Center(child: Text("Vendor Dashboard")),
    );
  }
}

