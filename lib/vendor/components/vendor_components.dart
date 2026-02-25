import 'package:dealtrackuser/vendor/components/services/vendor_components_service.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../shared_widgets/vendor_drawer.dart';

class VendorComponentsScreen extends StatefulWidget {
  const VendorComponentsScreen({super.key});

  @override
  State<VendorComponentsScreen> createState() =>
      _VendorComponentsScreenState();
}

class _VendorComponentsScreenState
    extends State<VendorComponentsScreen> {
  final VendorComponentsService _service =
  VendorComponentsService();

  bool loading = true;
  List components = [];
  List requiredComponents = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => loading = true);
    try {
      components = await _service.getVendorComponents();
      requiredComponents =
      await _service.getRequiredComponents();
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text("$e")));
    }
    setState(() => loading = false);
  }

  Color _statusColor(String? status) {
    switch (status) {
      case "approved":
        return Colors.green;
      case "pending":
        return Colors.orange;
      case "rejected":
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  int get pendingCount =>
      components.where((e) => e['status'] == 'pending').length;

  int get approvedCount =>
      components.where((e) => e['status'] == 'approved').length;

  int get rejectedCount =>
      components.where((e) => e['status'] == 'rejected').length;

  // =========================================================
  // HEADER
  // =========================================================

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 26, 20, 30),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.darkBlue, AppColors.primaryBlue],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Components Dashboard",
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.6,
            ),
          ),
          const SizedBox(height: 22),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _kpiCard("Total", components.length,
                  Icons.inventory_2),
              _kpiCard(
                  "Pending", pendingCount, Icons.pending),
              _kpiCard("Approved", approvedCount,
                  Icons.verified),
              _kpiCard("Rejected", rejectedCount,
                  Icons.cancel),
            ],
          ),
        ],
      ),
    );
  }

  Widget _kpiCard(
      String title, int value, IconData icon) {
    return Container(
      width: 78,
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        children: [
          Icon(icon, color: Colors.white, size: 20),
          const SizedBox(height: 6),
          Text(
            "$value",
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================
  // STATUS CHIP
  // =========================================================

  Widget _statusChip(String? status) {
    final color = _statusColor(status);

    return Container(
      padding:
      const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Text(
        (status ?? "").toUpperCase(),
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.bold,
          fontSize: 11,
        ),
      ),
    );
  }

  // =========================================================
  // ADD / EDIT MODAL
  // =========================================================

  void _openAddEditModal({Map? component}) {
    final isEdit = component != null;

    final nameController =
    TextEditingController(text: component?['component_name']);
    final itemController =
    TextEditingController(text: component?['item_no']);
    final descController =
    TextEditingController(text: component?['description']);
    final priceController = TextEditingController(
        text: component?['price_per_unit']?.toString());
    final stockController = TextEditingController(
        text: component?['stock_available']?.toString());
    final unitController =
    TextEditingController(text: component?['unit_of_measurement']);

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20)),
        title:
        Text(isEdit ? "Edit Component" : "Add Component"),
        content: SingleChildScrollView(
          child: Column(
            children: [
              _buildField("Component Name", nameController),
              _buildField("Item No", itemController),
              _buildField("Description", descController),
              _buildField("Unit", unitController),
              _buildField("Price", priceController,
                  isNumber: true),
              _buildField("Stock", stockController,
                  isNumber: true),
            ],
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.navy),
            onPressed: () async {
              final body = {
                "component_name":
                nameController.text.trim(),
                "item_no": itemController.text.trim(),
                "description":
                descController.text.trim(),
                "unit_of_measurement":
                unitController.text.trim(),
                "price_per_unit":
                double.tryParse(priceController.text) ??
                    0,
                "stock_available":
                int.tryParse(stockController.text) ?? 0,
              };

              try {
                if (isEdit) {
                  await _service.updateComponent(
                      component['componentid'], body);
                } else {
                  await _service.addComponent(body);
                }
                Navigator.pop(context);
                _loadData();
              } catch (e) {
                ScaffoldMessenger.of(context)
                    .showSnackBar(
                    SnackBar(content: Text("$e")));
              }
            },
            child: Text(isEdit ? "Update" : "Add"),
          )
        ],
      ),
    );
  }

  Widget _buildField(String label,
      TextEditingController controller,
      {bool isNumber = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextField(
        controller: controller,
        keyboardType:
        isNumber ? TextInputType.number : null,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const VendorDrawer(
          currentRoute: '/vendorComponents'),
      backgroundColor: AppColors.lightGrey,
      appBar: AppBar(
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text("Components Inventory"),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
        onRefresh: _loadData,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildHeader(),
            const SizedBox(height: 28),

            // ACTION BUTTONS
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: ElevatedButton.icon(
                      icon: const Icon(
                        Icons.add_box_rounded,
                        size: 20,
                        color: Colors.white,
                      ),
                      style: ElevatedButton.styleFrom(
                        elevation: 4,
                        backgroundColor: AppColors.navy,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      onPressed: () {},
                      label: const Text(
                        "Add From Company",
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: ElevatedButton.icon(
                      icon: const Icon(
                        Icons.add_circle_outline,
                        size: 20,
                        color: Colors.white,
                      ),
                      style: ElevatedButton.styleFrom(
                        elevation: 4,
                        backgroundColor: AppColors.navy,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      onPressed: () => _openAddEditModal(),
                      label: const Text(
                        "Add Custom",
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 28),

            if (components.isEmpty)
              Container(
                padding:
                const EdgeInsets.symmetric(
                    vertical: 60),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius:
                  BorderRadius.circular(24),
                ),
                child: Column(
                  children: const [
                    Icon(Icons.inventory_2_outlined,
                        size: 60,
                        color: Colors.grey),
                    SizedBox(height: 16),
                    Text(
                      "No Components Added Yet",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight:
                        FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      "Start by adding your first component",
                      style: TextStyle(
                          color:
                          Colors.black54),
                    )
                  ],
                ),
              )
            else
              ...components.map((c) {
                return Container(
                  margin:
                  const EdgeInsets.only(
                      bottom: 18),
                  padding:
                  const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius:
                    BorderRadius.circular(
                        20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black
                            .withOpacity(0.05),
                        blurRadius: 12,
                        offset:
                        const Offset(0, 6),
                      )
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment:
                    CrossAxisAlignment
                        .start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding:
                            const EdgeInsets
                                .all(10),
                            decoration:
                            BoxDecoration(
                              color: AppColors
                                  .primaryBlue
                                  .withOpacity(
                                  0.1),
                              borderRadius:
                              BorderRadius
                                  .circular(
                                  12),
                            ),
                            child: const Icon(
                              Icons
                                  .precision_manufacturing,
                              color: AppColors
                                  .primaryBlue,
                            ),
                          ),
                          const SizedBox(
                              width: 12),
                          Expanded(
                            child: Text(
                              c['component_name'] ??
                                  '',
                              style:
                              const TextStyle(
                                fontSize: 17,
                                fontWeight:
                                FontWeight
                                    .bold,
                              ),
                            ),
                          ),
                          _statusChip(
                              c['status'])
                        ],
                      ),
                      const SizedBox(
                          height: 12),
                      Text(
                        c['description'] ??
                            '',
                        style:
                        const TextStyle(
                          color:
                          Colors.black54,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(
                          height: 12),
                      Row(
                        mainAxisAlignment:
                        MainAxisAlignment
                            .spaceBetween,
                        children: [
                          Text(
                            "₹ ${c['price_per_unit'] ?? 0}",
                            style:
                            const TextStyle(
                              fontWeight:
                              FontWeight
                                  .w600,
                            ),
                          ),
                          Text(
                            "Stock: ${c['stock_available'] ?? 0}",
                            style:
                            const TextStyle(
                              color:
                              Colors.black54,
                            ),
                          ),
                        ],
                      )
                    ],
                  ),
                );
              })
          ],
        ),
      ),
    );
  }
}