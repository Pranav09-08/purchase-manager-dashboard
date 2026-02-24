
import 'package:flutter/material.dart';
import '../../overview/screens/overview_screen.dart';
import '../../shared/widgets/pm_drawer.dart';
import '../../vendor/screens/vendor_list_screen.dart';
import '../../products/screens/product_list_screen.dart';


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
      case '/registrations':
        print('[AdminDashboard] Building VendorListScreen');
        return const VendorListScreen(showAppBar: false);
      case '/products':
        return const ProductListScreen();
      case '/components':
        return _placeholderScreen('Components');
      case '/required-components':
        return _placeholderScreen('Required Components');
      case '/vendor-components':
        return _placeholderScreen('Vendor Components');
      case '/enquiries':
        return _placeholderScreen('Enquiries');
      case '/quotations':
        return _placeholderScreen('Quotations');
      case '/lois':
        return _placeholderScreen('LOIs');
      case '/orders':
        return _placeholderScreen('Orders');
      case '/payments':
        return _placeholderScreen('Payments');
      case '/receipts':
        return _placeholderScreen('Receipts');
      case '/invoices':
        return _placeholderScreen('Invoices');
      case '/analytics':
        return _placeholderScreen('Analytics');
      case '/requests':
        return _placeholderScreen('Requests');
      default:
        return _placeholderScreen('Unknown Tab');
    }
  }

  Widget _placeholderScreen(String label) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B1C2D),
        elevation: 0,
        title: Text(label, style: const TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(child: Text('This feature is coming soon!', style: TextStyle(fontSize: 18, color: Colors.grey[700]))),
    );
  }

  void _onSelect(String route) {
    setState(() {
      _currentRoute = route;
    });

    if (Navigator.canPop(context)) {
      Navigator.pop(context); // closes drawer safely
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B1C2D), // AppColors.navy
        elevation: 0,
        title: const Text('Purchase Manager', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      drawer: PMDrawer(
        currentRoute: _currentRoute,
        onSelect: _onSelect,
      ),
      body: _getScreen(_currentRoute),
    );
  }
}
