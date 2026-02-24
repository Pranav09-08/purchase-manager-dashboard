import 'package:flutter/material.dart';
import '../../registrations/screens/vendor_detail_screen.dart';
import '../services/overview_service.dart';
import '../../registrations/screens/vendor_list_screen.dart';


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
        int gridCols = 2;
        if (width < 400) gridCols = 1;
        if (width > 700) gridCols = 4;

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
                  vertical: width < 400 ? 16 : 28,
                  horizontal: width < 400 ? 12 : 24,
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
                      color: Colors.blue[900]!.withOpacity(0.18),
                      blurRadius: 18,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Overview', style: TextStyle(fontSize: width < 400 ? 22 : 32, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 0.5)),
                    SizedBox(height: width < 400 ? 4 : 10),
                    Text('Snapshot of supplier activity and registrations.', style: TextStyle(fontSize: width < 400 ? 13 : 16, color: Colors.white70)),
                  ],
                ),
              ),
              SizedBox(height: width < 400 ? 12 : 28),

              // Stat Card Grid (admin features, modern theme)
              // Responsive stat cards grid (clickable)
              Padding(
                padding: EdgeInsets.only(bottom: width < 400 ? 8 : 14),
                child: LayoutBuilder(
                  builder: (context, gridConstraints) {
                    return Wrap(
                      spacing: width < 400 ? 8 : 14,
                      runSpacing: width < 400 ? 8 : 14,
                      children: statCards.map((item) {
                        return SizedBox(
                          width: (gridConstraints.maxWidth / gridCols) - (width < 400 ? 8 : 14),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(14),
                            onTap: () {
                              // Navigate to vendor list screen with filter
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
                              constraints: const BoxConstraints(minHeight: 80),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: item['color'] is Color ? item['color'] as Color : Colors.blueGrey.shade100,
                                  width: 1.0,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: (item['color'] as Color?)?.withOpacity(0.06) ?? Colors.blueGrey.withOpacity(0.05),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              padding: EdgeInsets.symmetric(
                                horizontal: width < 400 ? 10 : 14,
                                vertical: width < 400 ? 8 : 10,
                              ),
                              child: Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(item['icon'] as IconData, color: item['color'] is Color ? item['color'] as Color : Colors.blueGrey, size: width < 400 ? 18 : 22),
                                        const Spacer(),
                                        Text(
                                          item['value'].toString(),
                                          style: TextStyle(
                                            fontSize: width < 400 ? 16 : 20,
                                            fontWeight: FontWeight.bold,
                                            color: item['color'] is Color ? item['color'] as Color : Colors.black,
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: width < 400 ? 2 : 4),
                                    Text(
                                      item['label'].toString(),
                                      style: TextStyle(
                                        fontSize: width < 400 ? 11 : 13,
                                        color: item['color'] is Color ? item['color'] as Color : Colors.black87,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    if (item['desc'] != null)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 1.0),
                                        child: Text(
                                          item['desc'].toString(),
                                          style: TextStyle(
                                            fontSize: width < 400 ? 8.5 : 11,
                                            color: (item['color'] as Color?)?.withOpacity(0.7) ?? Colors.blueGrey,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    );
                  },
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


