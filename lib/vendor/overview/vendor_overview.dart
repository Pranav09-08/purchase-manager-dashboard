import 'package:dealtrackuser/vendor/overview/services/vendor_overview_service.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../shared_widgets/vendor_drawer.dart';

class VendorOverview extends StatefulWidget {
  const VendorOverview({super.key});

  @override
  State<VendorOverview> createState() => _VendorOverviewState();
}

class _VendorOverviewState extends State<VendorOverview> {
  final OverviewService _service = OverviewService();

  int activeComponents = 0;
  int pendingOrders = 0;
  int openEnquiries = 0;
  int pendingInvoices = 0;

  Map<String, dynamic> profile = {};

  bool loadingProfile = true;
  bool loadingStats = true;
  bool loadingAll = true;

  @override
  void initState() {
    super.initState();
    _loadOverviewData();
  }

  Future<void> _loadOverviewData() async {
    setState(() {
      loadingAll = true;
      loadingProfile = true;
      loadingStats = true;
    });

    try {
      final results = await Future.wait([
        _service.getVendorProfile(),
        _service.getActiveComponents(),
        _service.getPendingOrders(),
        _service.getOpenEnquiries(),
        _service.getPendingInvoices(),
      ]);

      if (!mounted) return;

      setState(() {
        profile = results[0] as Map<String, dynamic>;
        activeComponents = results[1] as int;
        pendingOrders = results[2] as int;
        openEnquiries = results[3] as int;
        pendingInvoices = results[4] as int;
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to load overview: $e")),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        loadingAll = false;
        loadingProfile = false;
        loadingStats = false;
      });
    }
  }

  // void _openEditDialog() {
  //   final formKey = GlobalKey<FormState>();
  //   final controllers = <String, TextEditingController>{};
  //
  //   profile.forEach((key, value) {
  //     controllers[key] =
  //         TextEditingController(text: (value ?? "").toString());
  //   });
  //
  //   showDialog(
  //     context: context,
  //     builder: (_) {
  //       return AlertDialog(
  //         title: const Text("Edit Profile"),
  //         content: SizedBox(
  //           width: 500,
  //           child: Form(
  //             key: formKey,
  //             child: SingleChildScrollView(
  //               child: Column(
  //                 children: controllers.entries.map((entry) {
  //                   // Non-editable fields
  //                   if ([
  //                     "vendor_id",
  //                     "firebase_uid",
  //                     "created_at",
  //                     "approved_at",
  //                     "updated_at"
  //                   ].contains(entry.key)) {
  //                     return const SizedBox();
  //                   }
  //
  //                   return Padding(
  //                     padding: const EdgeInsets.only(bottom: 12),
  //                     child: TextFormField(
  //                       controller: entry.value,
  //                       decoration: InputDecoration(
  //                         labelText: _formatLabel(entry.key),
  //                         border: const OutlineInputBorder(),
  //                       ),
  //                     ),
  //                   );
  //                 }).toList(),
  //               ),
  //             ),
  //           ),
  //         ),
  //         actions: [
  //           TextButton(
  //             onPressed: () => Navigator.pop(context),
  //             child: const Text("Cancel"),
  //           ),
  //           ElevatedButton(
  //             onPressed: () async {
  //               if (!formKey.currentState!.validate()) return;
  //
  //               final vendorId = profile["vendor_id"];
  //               if (vendorId == null) return;
  //
  //               final updatedData = <String, dynamic>{};
  //
  //               controllers.forEach((key, controller) {
  //                 updatedData[key] = controller.text.trim();
  //               });
  //
  //               try {
  //                 await _service.updateVendorProfile(
  //                   vendorId.toString(),
  //                   updatedData,
  //                 );
  //
  //                 if (!mounted) return;
  //                 Navigator.pop(context);
  //                 await _loadOverviewData();
  //
  //                 ScaffoldMessenger.of(context).showSnackBar(
  //                   const SnackBar(
  //                     content: Text("Profile updated successfully"),
  //                   ),
  //                 );
  //               } catch (e) {
  //                 ScaffoldMessenger.of(context).showSnackBar(
  //                   SnackBar(content: Text("Update failed: $e")),
  //                 );
  //               }
  //             },
  //             child: const Text("Save"),
  //           ),
  //         ],
  //       );
  //     },
  //   );
  // }

  String _formatLabel(String key) {
    return key
        .replaceAll("_", " ")
        .split(" ")
        .where((word) => word.trim().isNotEmpty)
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(" ");
  }

  @override
  Widget build(BuildContext context) {
    final items = [
      ["Active Components", loadingStats ? "..." : activeComponents.toString(), Icons.inventory_2_outlined],
      ["Pending Orders", loadingStats ? "..." : pendingOrders.toString(), Icons.shopping_cart_outlined],
      ["Open Enquiries", loadingStats ? "..." : openEnquiries.toString(), Icons.mail_outline],
      ["Pending Invoices", loadingStats ? "..." : pendingInvoices.toString(), Icons.receipt_long_outlined],
    ];

    return Scaffold(
      drawer: const VendorDrawer(currentRoute: '/VendorOverview'),
      backgroundColor: AppColors.lightGrey,
      appBar: AppBar(
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
        title: const Text(
          "Vendor Overview",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            onPressed: loadingAll ? null : _loadOverviewData,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadOverviewData,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              children: [
                _headerUI(),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    children: [
                      _buildKpiGrid(items),
                      const SizedBox(height: 25),
                      _buildProfileCard(),
                      const SizedBox(height: 25),
                      _buildTipsCard(),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildKpiGrid(List<List<dynamic>> items) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = 2;
        if (constraints.maxWidth > 1100) {
          crossAxisCount = 4;
        } else if (constraints.maxWidth > 700) {
          crossAxisCount = 3;
        }

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: items.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.45,
          ),
          itemBuilder: (context, index) {
            return _kpiCard(
              items[index][0] as String,
              items[index][1] as String,
              items[index][2] as IconData,
            );
          },
        );
      },
    );
  }

  Widget _buildProfileCard() {
    return _dashboardCard(
      title: "Company Profile",
      child: loadingProfile
          ? const Center(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: CircularProgressIndicator(),
        ),
      )
          : profile.isEmpty
          ? const Text("Profile not found")
          : Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Align(
            alignment: Alignment.topRight,
            // child: ElevatedButton.icon(
            //   onPressed: _openEditDialog,
            //   icon: const Icon(Icons.edit, size: 16),
            //   label: const Text("Edit"),
            // ),
          ),
          const SizedBox(height: 12),

          _limitedProfileItem("Vendor ID", profile["vendor_id"]),
          _limitedProfileItem("Company Name", profile["company_name"]),
          _limitedProfileItem("TIN / GST", profile["company_tin"]),
          _limitedProfileItem("Address", profile["address"]),
          _limitedProfileItem("Contact Email", profile["contact_email"]),
        ],
      ),
    );
  }

  Widget _limitedProfileItem(String label, dynamic value) {
    final displayValue =
    (value ?? "Not added").toString().trim().isEmpty
        ? "Not added"
        : value.toString();

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.grey,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            displayValue,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTipsCard() {
    return _dashboardCard(
      title: "Tips to Grow Your Business",
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("✓ Keep your catalog updated"),
          SizedBox(height: 6),
          Text("✓ Respond to enquiries within 24 hours"),
          SizedBox(height: 6),
          Text("✓ Monitor pending invoices regularly"),
          SizedBox(height: 6),
          Text("✓ Maintain strong supplier relationships"),
        ],
      ),
    );
  }

  Widget _profileItem(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _formatLabel(label),
            style: const TextStyle(
              fontSize: 12,
              color: Colors.grey,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value.toString(),
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _headerUI() {
    final companyName = (profile["company_name"] ?? "Vendor").toString();

    return Container(
      padding: const EdgeInsets.all(20),
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.darkBlue, AppColors.primaryBlue],
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(22),
          bottomRight: Radius.circular(22),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Welcome, $companyName",
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            "Overview of components, orders and invoices",
            style: TextStyle(color: Colors.white70),
          ),
        ],
      ),
    );
  }

  Widget _kpiCard(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Icon(icon, color: AppColors.primaryBlue),
            ],
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _dashboardCard({
    required String title,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}