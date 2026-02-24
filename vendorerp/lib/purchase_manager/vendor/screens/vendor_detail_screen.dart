import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
// import '../../shared/widgets/loading_indicator.dart'; // Uncomment if you have a loading widget
// import '../services/vendor_service.dart'; // Uncomment and implement for backend

class VendorDetailScreen extends StatefulWidget {
  final Map<String, dynamic> vendor;
  const VendorDetailScreen({Key? key, required this.vendor}) : super(key: key);

  @override
  State<VendorDetailScreen> createState() => _VendorDetailScreenState();
}

class _VendorDetailScreenState extends State<VendorDetailScreen> {
  Map<String, dynamic>? vendor;
  bool isLoading = false;
  bool isUpdatingStatus = false;

  @override
  void initState() {
    super.initState();
    vendor = widget.vendor;
    // _loadVendor(); // Uncomment if loading from backend
  }

  // Example status toggle
  Future<void> _toggleStatus(bool value) async {
    if (vendor == null) return;
    setState(() => isUpdatingStatus = true);
    // await VendorService().toggleStatus(vendorId: vendor!['companyId'], activate: value);
    setState(() {
      vendor!['status'] = value ? 'approved' : 'rejected';
      isUpdatingStatus = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    final v = vendor!;
    final bool isApproved = v['status'] == 'approved';
    return Scaffold(
      backgroundColor: AppColors.lightGrey,
      appBar: AppBar(
        backgroundColor: AppColors.navy,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text('Vendor Details', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _profileCard(v),
            const SizedBox(height: 24),
            _infoCard(
              icon: Icons.assignment,
              title: 'Vendor Information',
              rows: [
                _infoRow('Vendor Name', v['contact_person']),
                _infoRow('Company', v['company_name']),
                _infoRow('Email', v['contact_email']),
                _infoRow('Phone', v['contact_phone']),
                _infoRow('Status', v['status']),
                _infoRow('TIN', v['company_tin']),
                _infoRow('Address', v['address']),
                _infoRow('Website', v['company_website']),
              ],
            ),
            const SizedBox(height: 24),
            _statusCard(isApproved),
          ],
        ),
      ),
    );
  }

  Widget _infoCard({required IconData icon, required String title, required List<Widget> rows}) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: AppColors.neonBlue.withOpacity(0.08),
            blurRadius: 20,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.navy, size: 28),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy, fontSize: 18)),
            ],
          ),
          const Divider(height: 24, thickness: 1),
          ...rows,
        ],
      ),
    );
  }

  Widget _infoRow(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(width: 120, child: Text(label + ':', style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.black87))),
          Expanded(
            child: Text(
              value?.isNotEmpty == true ? value! : '-',
              style: const TextStyle(fontWeight: FontWeight.w500, color: Colors.black87, fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _profileCard(Map<String, dynamic> v) {
    final String? imageUrl = v['logo_image'];
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: AppColors.neonBlue.withOpacity(0.08),
            blurRadius: 20,
          ),
        ],
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 45,
            backgroundColor: AppColors.primaryBlue.withOpacity(0.15),
            backgroundImage: imageUrl != null && imageUrl.isNotEmpty ? NetworkImage(imageUrl) : null,
            child: imageUrl == null || imageUrl.isEmpty
                ? const Icon(Icons.person, size: 42, color: AppColors.primaryBlue)
                : null,
          ),
          const SizedBox(height: 14),
          Text(v['company_name'] ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.navy)),
          const SizedBox(height: 6),
          Text(v['contact_email'] ?? '', style: const TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _section(String title, List<Widget> rows) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy)),
        const SizedBox(height: 14),
        ...rows,
      ]),
    );
  }

  Widget _row(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(children: [
        SizedBox(width: 130, child: Text(label, style: const TextStyle(color: Colors.grey))),
        Expanded(
          child: Text(
            value?.isNotEmpty == true ? value! : '-',
            style: const TextStyle(fontWeight: FontWeight.w500, color: AppColors.navy),
          ),
        ),
      ]),
    );
  }

  Widget _statusCard(bool isApproved) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Approval Status', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy)),
            const SizedBox(height: 6),
            Text(isApproved ? 'Approved' : 'Rejected', style: TextStyle(color: isApproved ? Colors.green : Colors.red, fontWeight: FontWeight.bold)),
          ]),
          Switch(
            value: isApproved,
            activeColor: AppColors.primaryBlue,
            onChanged: isUpdatingStatus ? null : _toggleStatus,
          ),
        ],
      ),
    );
  }
}
