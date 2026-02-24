
import 'package:flutter/material.dart';
import '../../overview/screens/overview_screen.dart';
import '../../registrations/screens/vendor_list_screen.dart';
import '../../shared/widgets/pm_drawer.dart';


class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  String _currentRoute = '/overview';

  Widget _getScreen(String route) {
    print('[AdminDashboard] Navigating to route: $route');
    switch (route) {
      case '/overview':
        return const OverviewScreen();
      case '/products':
        return const Center(child: Text('Products'));
      case '/components':
        return const Center(child: Text('Components'));
      case '/required-components':
        return const Center(child: Text('Required Components'));
      case '/registrations':
        print('[AdminDashboard] Building VendorListScreen');
        return const VendorListScreen();
      case '/vendor-components':
        return const Center(child: Text('Vendor Components'));
      case '/enquiries':
        return const Center(child: Text('Enquiries'));
      case '/quotations':
        return const Center(child: Text('Quotations'));
      case '/lois':
        return const Center(child: Text('LOIs'));
      case '/orders':
        return const Center(child: Text('Orders'));
      case '/payments':
        return const Center(child: Text('Payments'));
      case '/receipts':
        return const Center(child: Text('Receipts'));
      case '/invoices':
        return const Center(child: Text('Invoices'));
      case '/analytics':
        return const Center(child: Text('Analytics'));
      case '/requests':
        return const Center(child: Text('Requests'));
      default:
        return const Center(child: Text('Unknown Tab'));
    }
  }

  void _onSelect(String route) {
    print('[AdminDashboard] Drawer item selected: $route');
    setState(() {
      _currentRoute = route;
    });
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Purchase Manager'),
      ),
      drawer: PMDrawer(
        currentRoute: _currentRoute,
        onSelect: _onSelect,
      ),
      body: _getScreen(_currentRoute),
    );
  }
}
