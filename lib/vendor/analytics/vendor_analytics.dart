import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../shared_widgets/vendor_drawer.dart';

class VendorAnalysisScreen extends StatefulWidget {
  const VendorAnalysisScreen({super.key});

  @override
  State<VendorAnalysisScreen> createState() =>
      _VendorAnalysisScreenState();
}

class _VendorAnalysisScreenState extends State<VendorAnalysisScreen>
    with SingleTickerProviderStateMixin {

  late TabController _tabController;

  int selectedYear = DateTime.now().year;

  /// ✅ SAMPLE STATIC DATA
  final Map<String, dynamic> data = {
    "enquiriesReceived": 120,
    "enquiriesQuoted": 95,
    "ordersReceived": 60,
    "ordersCompleted": 48,
    "invoicesGenerated": 55,
    "invoicesPaid": 50,
    "approvedComponents": 35,
    "pendingComponents": 10,
    "rejectedComponents": 5,
    "totalComponents": 50,
    "totalPaymentsReceived": 1250000,
  };

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  double _percentage(int part, int total) {
    if (total == 0) return 0;
    return ((part / total) * 100);
  }

  @override
  Widget build(BuildContext context) {
    final yearList =
    List.generate(5, (index) => DateTime.now().year - index);

    return Scaffold(
      drawer: const VendorDrawer(currentRoute: '/vendorAnalytics'),
      backgroundColor: AppColors.lightGrey,
      appBar: AppBar(
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
        title: const Text("Vendor Analytics"),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<int>(
                dropdownColor: AppColors.navy,
                value: selectedYear,
                icon: const Icon(Icons.keyboard_arrow_down,
                    color: Colors.white),
                items: yearList
                    .map(
                      (year) => DropdownMenuItem(
                    value: year,
                    child: Text(
                      year.toString(),
                      style:
                      const TextStyle(color: Colors.white),
                    ),
                  ),
                )
                    .toList(),
                onChanged: (value) {
                  if (value == null) return;
                  setState(() => selectedYear = value);
                },
              ),
            ),
          ),
        ],

        /// ✅ FIXED TABBAR
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true, // IMPORTANT FIX
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: AppColors.neonBlue,
          indicatorWeight: 3,
          labelStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
          tabs: const [
            Tab(text: "Overview"),
            Tab(text: "Components"),
            Tab(text: "Workflow"),
            Tab(text: "Invoices"),
            Tab(text: "Payments"),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _overviewTab(),
          _componentsTab(),
          _workflowTab(),
          _invoiceTab(),
          _paymentTab(),
        ],
      ),
    );
  }

  // ================= OVERVIEW =================

  Widget _overviewTab() {
    final enquiries = (data["enquiriesReceived"] ?? 0) as int;
    final quoted = (data["enquiriesQuoted"] ?? 0) as int;
    final orders = (data["ordersReceived"] ?? 0) as int;
    final completed = (data["ordersCompleted"] ?? 0) as int;
    final invoices = (data["invoicesGenerated"] ?? 0) as int;
    final paid = (data["invoicesPaid"] ?? 0) as int;
    final revenue = (data["totalPaymentsReceived"] ?? 0) as int;

    return GridView.count(
      padding: const EdgeInsets.all(16),
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.3,
      children: [
        _card("Enquiries", enquiries),
        _card("Quotations", quoted),
        _card("Orders", orders),
        _card("Completed", completed),
        _card("Invoices", invoices),
        _card("Paid", paid),
        _card(
          "Conversion %",
          _percentage(orders, enquiries).toStringAsFixed(1),
        ),
        _card("Revenue ₹", revenue),
      ],
    );
  }

  // ================= COMPONENTS =================

  Widget _componentsTab() {
    return _statsColumn([
      _statTile("Approved", data["approvedComponents"],
          Colors.green),
      _statTile("Pending", data["pendingComponents"],
          Colors.orange),
      _statTile("Rejected", data["rejectedComponents"],
          Colors.red),
      _statTile("Total Components", data["totalComponents"],
          Colors.blue),
    ]);
  }

  // ================= WORKFLOW =================

  Widget _workflowTab() {
    return _statsColumn([
      _statTile("Enquiries", data["enquiriesReceived"],
          Colors.blue),
      _statTile("Quotations", data["enquiriesQuoted"],
          Colors.indigo),
      _statTile("Orders", data["ordersReceived"],
          Colors.purple),
      _statTile("Completed", data["ordersCompleted"],
          Colors.green),
    ]);
  }

  // ================= INVOICE =================

  Widget _invoiceTab() {
    return _statsColumn([
      _statTile("Generated", data["invoicesGenerated"],
          Colors.blue),
      _statTile("Paid", data["invoicesPaid"],
          Colors.green),
    ]);
  }

  // ================= PAYMENT =================

  Widget _paymentTab() {
    final orders = (data["ordersReceived"] ?? 0) as int;
    final payments = (data["totalPaymentsReceived"] ?? 0) as int;
    final avg =
    orders == 0 ? 0 : (payments / orders).toStringAsFixed(0);

    return _statsColumn([
      _statTile("Total Revenue ₹", payments, Colors.green),
      _statTile("Avg Order Value ₹", avg, Colors.blue),
    ]);
  }

  // ================= COMMON =================

  Widget _statsColumn(List<Widget> children) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: children,
    );
  }

  Widget _card(String title, dynamic value) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 8,
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600)),
          const Spacer(),
          Text(value.toString(),
              style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _statTile(String title, dynamic value, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(title,
            style: const TextStyle(
                fontWeight: FontWeight.bold)),
        trailing: Text(
          value.toString(),
          style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color),
        ),
      ),
    );
  }
}