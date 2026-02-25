import 'package:dealtrackuser/vendor/profile/services/vendor_profile_service.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class VendorProfileScreen extends StatefulWidget {
  const VendorProfileScreen({super.key});

  @override
  State<VendorProfileScreen> createState() => _VendorProfileScreenState();
}

class _VendorProfileScreenState extends State<VendorProfileScreen> {
  final VendorService _service = VendorService();

  bool isLoading = true;
  bool isEditing = false;

  Map<String, dynamic> profileData = {};
  final Map<String, TextEditingController> controllers = {};

  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  @override
  void dispose() {
    for (var controller in controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _fetchProfile() async {
    setState(() => isLoading = true);

    try {
      final data = await _service.getVendorProfile();

      if (!mounted) return;

      controllers.clear();

      data.forEach((key, value) {
        controllers[key] =
            TextEditingController(text: (value ?? "").toString());
      });

      setState(() {
        profileData = data;
        isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to load profile: $e")),
      );
    }
  }

  Future<void> _updateProfile() async {
    if (!_formKey.currentState!.validate()) return;

    final updatedData = <String, dynamic>{};

    controllers.forEach((key, controller) {
      if (!_isHiddenField(key)) {
        updatedData[key] = controller.text.trim();
      }
    });

    try {
      final updated = await _service.updateVendorProfile(updatedData);

      if (!mounted) return;

      setState(() {
        profileData = updated;
        isEditing = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Profile updated successfully")),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Update failed: $e")),
      );
    }
  }

  bool _isHiddenField(String key) {
    return [
      "firebase_uid",
      "created_at",
      "updated_at",
      "approved_at",
    ].contains(key);
  }

  bool _isNonEditableField(String key) {
    return [
      "vendor_id",
      "firebase_uid",
      "created_at",
      "approved_at",
      "updated_at",
      "certificate_verified_at"
    ].contains(key);
  }

  String _formatLabel(String key) {
    return key
        .replaceAll("_", " ")
        .split(" ")
        .map((e) => e.isNotEmpty
        ? e[0].toUpperCase() + e.substring(1)
        : "")
        .join(" ");
  }

  String _formatValue(dynamic value) {
    if (value == null) return "Not added";
    if (value is bool) return value ? "Yes" : "No";
    return value.toString().trim().isEmpty
        ? "Not added"
        : value.toString();
  }

  Future<bool> _handleBack() async {
    if (isEditing) {
      setState(() => isEditing = false);
      return false;
    }

    Navigator.pushReplacementNamed(context, '/VendorOverview');
    return false;
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return WillPopScope(
      onWillPop: _handleBack,
      child: Scaffold(
        backgroundColor: AppColors.lightGrey,
        appBar: AppBar(
          backgroundColor: AppColors.navy,
          foregroundColor: Colors.white,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              _handleBack();
            },
          ),
          title: const Text("Vendor Profile"),
          actions: [
            if (!isEditing)
              IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () => setState(() => isEditing = true),
              )
          ],
        ),
        body: profileData.isEmpty
            ? const Center(child: Text("Profile not found"))
            : Padding(
          padding: const EdgeInsets.all(16),
          child: isEditing ? _buildEditForm() : _buildProfileView(),
        ),
      ),
    );
  }

  Widget _buildProfileView() {
    final entries = profileData.entries
        .where((e) =>
    !_isHiddenField(e.key) &&
        (e.value ?? "").toString().trim().isNotEmpty)
        .toList();

    return ListView(
      children: [
        _buildHeaderCard(),
        const SizedBox(height: 20),
        ...entries.map((entry) => Card(
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12)),
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            title: Text(
              _formatLabel(entry.key),
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text(_formatValue(entry.value)),
          ),
        )),
      ],
    );
  }

  Widget _buildHeaderCard() {
    final companyName =
        profileData["company_name"]?.toString() ?? "Vendor";

    final status = profileData["status"]?.toString() ?? "pending";

    Color statusColor = Colors.orange;

    if (status.toLowerCase() == "approved") {
      statusColor = Colors.green;
    } else if (status.toLowerCase() == "rejected") {
      statusColor = Colors.red;
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.darkBlue, AppColors.primaryBlue],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 28,
            backgroundColor: Colors.white,
            child: Icon(Icons.business, color: AppColors.primaryBlue),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              companyName,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Container(
            padding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: statusColor,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              status.toUpperCase(),
              style: const TextStyle(color: Colors.white),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildEditForm() {
    final List<Widget> widgets = [];

    for (var entry in controllers.entries) {
      final key = entry.key;
      final controller = entry.value;

      if (_isNonEditableField(key)) continue;

      widgets.add(
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: TextFormField(
            controller: controller,
            decoration: InputDecoration(
              labelText: _formatLabel(key),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
      );
    }

    widgets.add(const SizedBox(height: 20));

    widgets.add(
      ElevatedButton(
        onPressed: _updateProfile,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryBlue,
          padding: const EdgeInsets.symmetric(vertical: 14),
        ),
        child: const Text("Save Changes"),
      ),
    );

    widgets.add(
      TextButton(
        onPressed: () => setState(() => isEditing = false),
        child: const Text("Cancel"),
      ),
    );

    return Form(
      key: _formKey,
      child: ListView(children: widgets),
    );
  }
}