import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../../core/theme/app_colors.dart';
import 'package:provider/provider.dart';
import '../../../../core/auth/provider/auth_provider.dart' as custom_auth;

class PMDrawer extends StatelessWidget {
	final String currentRoute;
	final void Function(String route)? onSelect;

	const PMDrawer({
		super.key,
		required this.currentRoute,
		this.onSelect,
	});

	@override
	Widget build(BuildContext context) {
		final user = FirebaseAuth.instance.currentUser;

		return Drawer(
			backgroundColor: AppColors.navy,
			child: ListView(
				padding: EdgeInsets.zero,
				children: [
					// 🔷 HEADER
					Container(
						width: double.infinity,
						padding: const EdgeInsets.fromLTRB(20, 50, 20, 24),
						decoration: const BoxDecoration(
							gradient: LinearGradient(
								colors: [AppColors.navy, AppColors.darkBlue],
							),
						),
						child: Column(
							crossAxisAlignment: CrossAxisAlignment.start,
							children: [
						Container(
							height: 64,
							width: 64,
							decoration: BoxDecoration(
								shape: BoxShape.circle,
								border: Border.all(
									color: AppColors.neonBlue,
									width: 2.2,
								),
								boxShadow: [
									BoxShadow(
										color: AppColors.neonBlue.withOpacity(0.45),
										blurRadius: 12,
										spreadRadius: 1,
									),
								],
							),
							child: const Icon(
								Icons.account_circle,
								size: 56,
								color: AppColors.neonBlue,
							),
						),

								const SizedBox(height: 14),

								const Text(
									'Deal Track',
									style: TextStyle(
										color: Colors.white,
										fontSize: 20,
										fontWeight: FontWeight.bold,
									),
								),

								const SizedBox(height: 4),

								const Text(
									'Purchase Manager',
									style: TextStyle(
										color: Colors.white,
										fontSize: 16,
										fontWeight: FontWeight.w600,
									),
								),

								const SizedBox(height: 6),

								Text(
									user?.email ?? '',
									style: const TextStyle(
										color: Colors.white70,
										fontSize: 13,
									),
								),
							],
						),
					),

					const SizedBox(height: 12),

					// --- OVERVIEW ---
					  _sectionLabel('Overview'),
					  _item(context, Icons.dashboard_outlined, 'Overview', '/overview'),
					  _item(context, Icons.assignment_ind_outlined, 'Vendor Registrations', '/registrations'),

					// --- CATALOG ---
					_sectionLabel('Catalog'),
					_item(context, Icons.inventory_2_outlined, 'Products', '/products'),
					_item(context, Icons.extension_outlined, 'Components', '/components'),
					_item(context, Icons.list_alt_outlined, 'Vendor Components', '/vendor-components'),
					_item(context, Icons.add_box_outlined, 'Add Components', '/required-components'),

					// --- PROCUREMENT ---
					_sectionLabel('Procurement'),
					_item(context, Icons.assignment_outlined, 'Purchase Requests', '/requests'),
					_item(context, Icons.question_answer_outlined, 'Enquiries', '/enquiries'),
					_item(context, Icons.request_quote_outlined, 'Quotations', '/quotations'),
					_item(context, Icons.description_outlined, 'LOIs', '/lois'),
					_item(context, Icons.shopping_cart_outlined, 'Orders', '/orders'),
					_item(context, Icons.receipt_long_outlined, 'Invoices', '/invoices'),
					_item(context, Icons.payments_outlined, 'Payments', '/payments'),
					_item(context, Icons.receipt_outlined, 'Receipts', '/receipts'),

					// --- INSIGHTS ---
					_sectionLabel('Insights'),
					_item(context, Icons.analytics_outlined, 'Analytics', '/analytics'),

					const Divider(color: Colors.white24),

					// 🚪 LOGOUT
					ListTile(
						leading: const Icon(
							Icons.logout,
							color: Colors.redAccent,
						),
						title: const Text(
							'Logout',
							style: TextStyle(color: Colors.redAccent),
						),
						onTap: () async {
						      await Provider.of<custom_auth.AuthProvider>(context, listen: false).logout();
							if (context.mounted) {
								Navigator.pushReplacementNamed(context, '/login');
							}
						},
					),
				],
			),
		);
	}

	// 🔹 Drawer item builder
	Widget _item(
		BuildContext context,
		IconData icon,
		String title,
		String route,
	) {
		final bool selected = currentRoute == route;
		return ListTile(
			leading: Icon(
				icon,
				color: selected ? AppColors.neonBlue : Colors.white70,
			),
			title: Text(
				title,
				style: TextStyle(
					color: selected ? AppColors.neonBlue : Colors.white70,
					fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
				),
			),
			selected: selected,
			onTap: () {
				if (!selected) {
					Navigator.pop(context);
					if (onSelect != null) {
						onSelect!(route);
					}
				} else {
					Navigator.pop(context);
				}
			},
		);
	}

	// 🔹 Section label builder
	Widget _sectionLabel(String label) {
		return Padding(
			padding: const EdgeInsets.fromLTRB(24, 18, 0, 6),
			child: Text(
				label,
				style: const TextStyle(
					color: Colors.white54,
					fontSize: 12,
					fontWeight: FontWeight.bold,
					letterSpacing: 1.2,
					shadows: [Shadow(color: Colors.black26, blurRadius: 2)],
				),
			),
		);
	}
}
