import 'package:flutter/material.dart';
import '../../vendor/screens/vendor_detail_screen.dart';
import '../../vendor/screens/vendor_list_screen.dart';
import '../services/overview_service.dart';


class OverviewScreen extends StatefulWidget {
  final VoidCallback? onGoToRegistrations;
  final VoidCallback? onGoToVendorProducts;
  const OverviewScreen({super.key, this.onGoToRegistrations, this.onGoToVendorProducts});

  @override
  State<OverviewScreen> createState() => _OverviewScreenState();
}

class _OverviewScreenState extends State<OverviewScreen> {
  bool loading = true;
  Map<String, dynamic> stats = <String, dynamic>{};
  String error = '';

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() { loading = true; error = ''; });
    try {
      final data = await OverviewService().fetchOverviewStats();
      setState(() {
        stats = Map<String, dynamic>.from(data);
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (error.isNotEmpty) {
      return Center(child: Text('Error: $error'));
    }

    // Stat cards for admin overview (features from OverviewTab.jsx, theme from mobile reference)
    final statCards = [
      {
        'label': 'Total Vendors',
        'value': stats['totalSuppliers']?.toString() ?? '0',
        'icon': Icons.people_alt_rounded,
        'color': Colors.blue[900],
        'desc': 'All registered vendors',
        'filter': null,
      },
      {
        'label': 'Approved',
        'value': stats['approvedSuppliers']?.toString() ?? '0',
        'icon': Icons.verified_rounded,
        'color': Colors.green[700],
        'desc': stats['totalSuppliers'] != null && stats['totalSuppliers'] > 0 ? '${((stats['approvedSuppliers'] ?? 0) * 100 ~/ stats['totalSuppliers'])}% of total' : '0% of total',
        'filter': 'approved',
      },
      {
        'label': 'Pending',
        'value': stats['pendingSuppliers']?.toString() ?? '0',
        'icon': Icons.hourglass_top_rounded,
        'color': Colors.amber[800],
        'desc': 'Awaiting approval',
        'filter': 'pending',
      },
      {
        'label': 'Rejected',
        'value': stats['rejectedSuppliers']?.toString() ?? '0',
        'icon': Icons.cancel_rounded,
        'color': Colors.red[700],
        'desc': 'Rejected registrations',
        'filter': 'rejected',
      },
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        // Font size tweaks
        final double headerFontSize = width < 400 ? 24 : 34;
        final double subHeaderFontSize = width < 400 ? 14 : 18;
        final double cardLabelFontSize = width < 400 ? 13 : 16;
        final double cardValueFontSize = width < 400 ? 22 : 28;
        final double cardIconSize = width < 400 ? 26 : 32;
        final double cardPadding = width < 400 ? 8 : 12;

        return SingleChildScrollView(
          padding: EdgeInsets.symmetric(
            horizontal: width < 400 ? 8 : width < 700 ? 14 : 24,
            vertical: width < 400 ? 8 : 16,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Gradient Header
              Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(
                  vertical: width < 400 ? 18 : 32,
                  horizontal: width < 400 ? 14 : 28,
                ),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.indigo[900]!, Colors.blue[600]!],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.blue[900]!.withAlpha((0.18 * 255).toInt()),
                      blurRadius: 18,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Overview', style: TextStyle(fontSize: headerFontSize, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 0.5)),
                    SizedBox(height: width < 400 ? 4 : 10),
                    Text('Snapshot of supplier activity and registrations.', style: TextStyle(fontSize: subHeaderFontSize, color: Colors.white70)),
                  ],
                ),
              ),
              SizedBox(height: width < 400 ? 12 : 28),

              // Stat Card Grid (2x2, like reference image)
              Padding(
                padding: EdgeInsets.only(bottom: width < 400 ? 8 : 14),
                child: GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: width < 400 ? 10 : 18,
                  crossAxisSpacing: width < 400 ? 10 : 18,
                  childAspectRatio: 1.25,
                  children: statCards.map((item) {
                    return InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => VendorListScreen(
                              filter: item['filter'] is String ? item['filter'] as String : null,
                            ),
                          ),
                        );
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: Colors.grey.shade200,
                            width: 1.2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.blueGrey.withAlpha((0.07 * 255).toInt()),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        padding: EdgeInsets.all(cardPadding),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    item['label'].toString(),
                                    style: TextStyle(
                                      fontSize: cardLabelFontSize,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.black87,
                                    ),
                                  ),
                                ),
                                Icon(
                                  item['icon'] as IconData,
                                  color: item['color'] is Color ? item['color'] as Color : Colors.blue,
                                  size: cardIconSize,
                                ),
                              ],
                            ),
                            SizedBox(height: 4),
                            Text(
                              item['value'].toString(),
                              style: TextStyle(
                                fontSize: cardValueFontSize,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              SizedBox(height: width < 400 ? 16 : 32),

              // ...existing code...
              SizedBox(height: width < 400 ? 18 : 36),

              // Recent Vendor Registrations
              Container(
                width: double.infinity,
                padding: EdgeInsets.all(width < 400 ? 12 : 22),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: Colors.blueGrey.shade100),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.blue[100]!,
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Recent Vendor Registrations', style: TextStyle(fontWeight: FontWeight.bold, fontSize: width < 400 ? 14 : 18)),
                            SizedBox(height: width < 400 ? 2 : 4),
                            Text('Latest applications from vendors', style: TextStyle(fontSize: width < 400 ? 11 : 14, color: Colors.blueGrey)),
                          ],
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => VendorListScreen(filter: null),
                              ),
                            );
                          },
                          style: TextButton.styleFrom(
                            foregroundColor: Colors.blue[900],
                            textStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: width < 400 ? 11 : null),
                          ),
                          child: const Text('View All →'),
                        ),
                      ],
                    ),
                    SizedBox(height: width < 400 ? 8 : 16),
                    if ((stats['recentRegistrations'] ?? []).isEmpty)
                      Text('No recent registrations', style: TextStyle(color: Colors.blueGrey, fontSize: width < 400 ? 11 : null)),
                    if ((stats['recentRegistrations'] ?? []).isNotEmpty)
                      Column(
                        children: List.generate(
                          (stats['recentRegistrations'] as List).length,
                          (i) {
                            final reg = stats['recentRegistrations'][i];
                            return InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => VendorDetailScreen(vendor: reg),
                                  ),
                                );
                              },
                              child: Container(
                                margin: EdgeInsets.symmetric(vertical: width < 400 ? 4 : 7),
                                padding: EdgeInsets.symmetric(horizontal: width < 400 ? 8 : 14, vertical: width < 400 ? 7 : 12),
                                decoration: BoxDecoration(
                                  color: Colors.blueGrey[50],
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: Colors.blueGrey.shade100),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.blueGrey.shade100,
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    CircleAvatar(
                                      radius: width < 400 ? 18 : 22,
                                      backgroundColor: Colors.blue[100],
                                      child: Icon(Icons.person, color: Colors.blue[700], size: width < 400 ? 18 : 22),
                                    ),
                                    SizedBox(width: width < 400 ? 10 : 18),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(reg['contact_person'] ?? '-', style: TextStyle(fontWeight: FontWeight.bold, fontSize: width < 400 ? 13 : 16)),
                                          Text(reg['company_name'] ?? '-', style: TextStyle(fontSize: width < 400 ? 11 : 14, color: Colors.blueGrey)),
                                          Text(reg['contact_email'] ?? '', style: TextStyle(fontSize: width < 400 ? 10 : 13, color: Colors.blueGrey)),
                                          Text(reg['contact_phone'] ?? '', style: TextStyle(fontSize: width < 400 ? 10 : 13, color: Colors.blueGrey)),
                                        ],
                                      ),
                                    ),
                                    Icon(Icons.chevron_right, color: Colors.blueGrey, size: width < 400 ? 22 : 28),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}


