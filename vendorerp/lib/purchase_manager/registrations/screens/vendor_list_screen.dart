import 'package:flutter/material.dart';
import 'package:vendorerp/purchase_manager/registrations/screens/vendor_detail_screen.dart';
import '../services/vendor_list_service.dart';
import 'vendor_list_ui.dart';

class VendorListScreen extends StatefulWidget {
  final String? filter;
  const VendorListScreen({Key? key, this.filter}) : super(key: key);

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
        bodyContent = const Expanded(child: Center(child: CircularProgressIndicator()));
      } else if (error.isNotEmpty) {
        print('[VendorListScreen] Showing error: $error');
        bodyContent = Expanded(child: Center(child: Text('Error: $error', style: TextStyle(color: Colors.red))));
      } else if (filtered.isEmpty && vendors.isEmpty) {
        print('[VendorListScreen] No vendors found');
        bodyContent = const Expanded(child: Center(child: Text('No vendors found')));
      } else {
        print('[VendorListScreen] Showing vendor list');
        bodyContent = Expanded(
          child: filtered.isEmpty
              ? const Center(child: Text('No vendors found'))
              : ListView.builder(
                  itemCount: filtered.length,
                  itemBuilder: (context, i) {
                    final v = filtered[i];
                    print('[VendorListScreen] Building VendorListCard for vendor: ${v['company_name']}');
                    return VendorListCard(
                      vendor: v,
                      onTap: () {
                        print('[VendorListScreen] Vendor tapped: ${v['company_name']}');
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => VendorDetailScreen(vendor: v),
                          ),
                        );
                      },
                    );
                  },
                ),
        );
      }
      return Scaffold(
        appBar: AppBar(
          title: Text(widget.filter == null ? 'All Vendors' : '${widget.filter![0].toUpperCase()}${widget.filter!.substring(1)} Vendors'),
        ),
        body: Column(
          children: [
            Container(
              width: double.infinity,
              color: Colors.amber,
              padding: const EdgeInsets.all(8),
              child: const Text(
                'DEBUG: VendorListScreen loaded',
                style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search vendor...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
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
            bodyContent,
            // Fallback widget
            if (!loading && error.isEmpty && filtered.isNotEmpty)
              const SizedBox.shrink(),
          ],
        ),
      );
    } catch (e, st) {
      print('[VendorListScreen] Exception in build: $e\n$st');
      return Scaffold(
        body: Center(child: Text('Build error: $e', style: const TextStyle(color: Colors.red))),
      );
    }
  }
}
