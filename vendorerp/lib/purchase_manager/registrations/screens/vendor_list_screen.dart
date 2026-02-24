import 'package:flutter/material.dart';
import '../../vendor/screens/vendor_detail_screen.dart';
import '../../vendor/screens/vendor_list_ui.dart';
import '../../vendor/services/vendor_list_service.dart';



class VendorListScreen extends StatefulWidget {
  final String? filter;
  final bool showAppBar;
  const VendorListScreen({Key? key, this.filter, this.showAppBar = true}) : super(key: key);

  @override
  State<VendorListScreen> createState() => _VendorListScreenState();
}

class _VendorListScreenState extends State<VendorListScreen> {
  bool loading = true;
  List<Map<String, dynamic>> vendors = [];
  List<Map<String, dynamic>> filtered = [];
  String search = '';
  String error = '';

  @override
  void initState() {
    super.initState();
    _loadVendors();
  }

  Future<void> _loadVendors() async {
    if (!mounted) return;
    setState(() { loading = true; error = ''; });
    try {
      print('[VendorListScreen] Fetching vendors...');
      final all = await VendorListService().fetchVendors(filter: widget.filter);
      print('[VendorListScreen] Vendors fetched: count = \'${all.length}\'');
      if (!mounted) return;
      setState(() {
        vendors = all;
        filtered = all;
        loading = false;
        print('[VendorListScreen] setState after fetch: loading=$loading, vendors=${vendors.length}, filtered=${filtered.length}');
      });
    } catch (e, st) {
      print('[VendorListScreen] Error fetching vendors: $e');
      print(st);
      if (!mounted) return;
      setState(() {
        error = 'Failed to load vendors: $e';
        loading = false;
        print('[VendorListScreen] setState after error: loading=$loading, error=$error');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    print('[VendorListScreen] build() called. loading=$loading, error=$error, vendors=${vendors.length}, filtered=${filtered.length}');
    try {
      Widget bodyContent;
      if (loading) {
        print('[VendorListScreen] Showing loading spinner');
        bodyContent = const Center(child: CircularProgressIndicator());
      } else if (error.isNotEmpty) {
        print('[VendorListScreen] Showing error: $error');
        bodyContent = Center(child: Text('Error: $error', style: TextStyle(color: Colors.red)));
      } else if (filtered.isEmpty && vendors.isEmpty) {
        print('[VendorListScreen] No vendors found');
        bodyContent = const Center(child: Text('No vendors found'));
      } else {
        print('[VendorListScreen] Showing vendor list');
        bodyContent = ListView.builder(
          itemCount: filtered.length,
          itemBuilder: (context, i) {
            final v = filtered[i];
            print('[VendorListScreen] Building VendorListCard for vendor: \\${v['company_name']}');
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
              child: Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                child: VendorListCard(
                  vendor: v,
                  onTap: () {
                    print('[VendorListScreen] Vendor tapped: \\${v['company_name']}');
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => VendorDetailScreen(vendor: v),
                      ),
                    );
                  },
                ),
              ),
            );
          },
        );
      }

      Widget content = Column(
        children: [
          // Search bar styled as a card
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 18, 16, 8),
            child: Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 2.0),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search vendor...',
                    prefixIcon: const Icon(Icons.search),
                    border: InputBorder.none,
                  ),
                  onChanged: (val) {
                    setState(() {
                      search = val;
                      filtered = vendors.where((v) =>
                        (v['company_name'] ?? '').toString().toLowerCase().contains(val.toLowerCase()) ||
                        (v['contact_person'] ?? '').toString().toLowerCase().contains(val.toLowerCase()) ||
                        (v['contact_email'] ?? '').toString().toLowerCase().contains(val.toLowerCase())
                      ).toList();
                    });
                  },
                ),
              ),
            ),
          ),
          // Vendor list (expanded)
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: bodyContent,
            ),
          ),
        ],
      );

      if (widget.showAppBar) {
        return Scaffold(
          backgroundColor: Colors.grey[100],
          appBar: AppBar(
            elevation: 0,
            backgroundColor: Colors.transparent,
            iconTheme: const IconThemeData(color: Colors.white),
            flexibleSpace: Container(
              decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.indigo[900]!.withAlpha((0.9 * 255).toInt()),
                      Colors.blue[600]!.withAlpha((0.9 * 255).toInt())
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(24),
                    bottomRight: Radius.circular(24),
                  ),
                ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        widget.filter == null ? 'All Vendors' : '${widget.filter![0].toUpperCase()}${widget.filter!.substring(1)} Vendors',
                        style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 0.5),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Browse and manage vendor registrations',
                        style: TextStyle(color: Colors.white70, fontSize: 14),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            toolbarHeight: 90,
          ),
          body: content,
        );
      } else {
        return Container(
          color: Colors.grey[100],
          child: content,
        );
      }
    } catch (e, st) {
      print('[VendorListScreen] Exception in build: $e\n$st');
      return Scaffold(
        body: Center(child: Text('Build error: $e', style: const TextStyle(color: Colors.red))),
      );
    }
  }
}
