import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../../services/api_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/services/auth_service.dart';
import '../../auth/login/admin_login_screen.dart';

class VendorDrawer extends StatefulWidget {
  final String currentRoute;

  const VendorDrawer({
    super.key,
    required this.currentRoute,
  });

  static String? cachedProfileImage;
  static bool profileLoaded = false;

  @override
  State<VendorDrawer> createState() => _VendorDrawerState();
}

class _VendorDrawerState extends State<VendorDrawer> {
  String get vendorId =>
      FirebaseAuth.instance.currentUser!.uid;

  @override
  void initState() {
    super.initState();

    if (!VendorDrawer.profileLoaded) {
      loadProfileImage();
    }
  }

  Future<void> loadProfileImage() async {
    try {
      final res =
      await ApiService.get('/vendors/$vendorId');

      final data = res['vendor'];

      VendorDrawer.cachedProfileImage =
          data['profileImage'] ?? "";

      VendorDrawer.profileLoaded = true;
    } catch (_) {
      VendorDrawer.cachedProfileImage = "";
    }

    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    final profileImage = VendorDrawer.cachedProfileImage ?? "";

    return Drawer(
      backgroundColor: AppColors.navy,
      child: SafeArea(
        child: Column(
          children: [
            _header(context, user?.email ?? '', profileImage),

            // 🔥 Scrollable Menu Like Website
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 10),
                children: [

                  // ================= MAIN =================
                  _item(Icons.home_outlined, 'Overview', '/VendorOverview'),
                  _item(Icons.attach_money_outlined, 'Analytics', '/vendorAnalytics'),
                  _item(Icons.widgets_outlined, 'Components', '/vendorComponents'),

                  const SizedBox(height: 24),

                  // ================= PROCUREMENT TITLE =================
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    child: Text(
                      "PROCUREMENT",
                      style: TextStyle(
                        color: Colors.white38,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.3,
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  _item(Icons.chat_bubble_outline, 'Enquiries', '/vendorEnquiries'),
                  _item(Icons.description_outlined, 'Quotations', '/vendorQuotations'),
                  _item(Icons.link_outlined, 'LOIs', '/vendorLois'),
                  _item(Icons.shopping_cart_outlined, 'Orders', '/vendorOrders'),
                  _item(Icons.receipt_long_outlined, 'Invoices', '/vendorInvoices'),
                  _item(Icons.payment_outlined, 'Payments', '/vendorPayments'),
                ],
              ),
            ),

            const Divider(color: Colors.white24, height: 1),

            // ================= LOGOUT =================
            ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 20),
              leading: const Icon(Icons.logout, color: Colors.white70),
              title: const Text(
                'Logout',
                style: TextStyle(color: Colors.white70),
              ),
              onTap: () async {
                await AuthService().logout();

                VendorDrawer.profileLoaded = false;
                VendorDrawer.cachedProfileImage = null;

                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AdminLoginScreen(),
                  ),
                      (_) => false,
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  // ================= HEADER =================

  Widget _header(
      BuildContext context,
      String email,
      String profileImage,
      ) {
    return GestureDetector(
      onTap: () {
        Navigator.pushReplacementNamed(
            context, '/vendorProfile');
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(20, 50, 20, 24),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.navy, AppColors.darkBlue],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 32,
              backgroundColor: Colors.white24,
              backgroundImage: profileImage.isNotEmpty
                  ? NetworkImage(profileImage)
                  : null,
              child: profileImage.isEmpty
                  ? const Icon(
                Icons.business,
                color: Colors.white,
                size: 30,
              )
                  : null,
            ),
            const SizedBox(height: 14),
            const Text(
              'vendor',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              email,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              "View Profile",
              style: TextStyle(
                color: AppColors.neonBlue,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _item(
      IconData icon,
      String title,
      String route,
      ) {
    final bool selected = widget.currentRoute == route;

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20),
      minLeadingWidth: 20,
      leading: Icon(
        icon,
        size: 20,
        color: selected ? AppColors.neonBlue : Colors.white70,
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: selected ? AppColors.neonBlue : Colors.white70,
        ),
      ),
      onTap: () {
        if (!selected) {
          Navigator.pushReplacementNamed(context, route);
        } else {
          Navigator.pop(context);
        }
      },
    );
  }
}

