import 'package:flutter/material.dart';
import 'package:vendorerp/purchase_manager/vendor/screens/vendor_detail_screen.dart';
import '../services/vendor_list_service.dart';
import 'vendor_list_ui.dart';

class VendorListScreen extends StatefulWidget {
  final String? filter;
  final bool showAppBar;

  const VendorListScreen({
    Key? key,
    this.filter,
    this.showAppBar = true,
  }) : super(key: key);

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

  String _titleFromFilter(String? filter) {
    if (filter == null || filter.isEmpty) return 'All Vendors';
    return '${filter[0].toUpperCase()}${filter.substring(1)} Vendors';
  }

  Future<void> _loadVendors() async {
    setState(() {
      loading = true;
      error = '';
    });

    try {
      final all = await VendorListService().fetchVendors(filter: widget.filter);

      if (!mounted) return;

      setState(() {
        vendors = List<Map<String, dynamic>>.from(all);
        filtered = vendors;
        loading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        error = 'Failed to load vendors';
        loading = false;
      });

      debugPrint('[VendorListScreen] fetch error: $e');
    }
  }

  void _applySearch(String val) {
    final query = val.toLowerCase();

    setState(() {
      search = val;
      filtered = vendors.where((v) {
        final company = (v['company_name'] ?? '').toString().toLowerCase();
        final person = (v['contact_person'] ?? '').toString().toLowerCase();
        final email = (v['contact_email'] ?? '').toString().toLowerCase();
        return company.contains(query) || person.contains(query) || email.contains(query);
      }).toList();
    });
  }

  Widget _buildBody() {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (error.isNotEmpty) {
      return Center(
        child: Text(
          error,
          style: const TextStyle(color: Colors.red),
        ),
      );
    }

    if (filtered.isEmpty) {
      return const Center(child: Text('No vendors found'));
    }

    return ListView.builder(
      itemCount: filtered.length,
      itemBuilder: (context, i) {
        final v = filtered[i];

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
            child: VendorListCard(
              vendor: v,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => VendorDetailScreen(vendor: v),
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }

  Widget _buildContent() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 8),
          child: Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: TextField(
                decoration: const InputDecoration(
                  hintText: 'Search vendor...',
                  prefixIcon: Icon(Icons.search),
                  border: InputBorder.none,
                ),
                onChanged: _applySearch,
              ),
            ),
          ),
        ),
        Expanded(child: _buildBody()),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.showAppBar) {
      return Container(
        color: Colors.grey[100],
        child: _buildContent(),
      );
    }

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        toolbarHeight: 90,
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.indigo[900]!, Colors.blue[600]!],
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
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _titleFromFilter(widget.filter),
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Browse and manage vendor registrations',
                    style: TextStyle(color: Colors.white70),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: _buildContent(),
    );
  }
}