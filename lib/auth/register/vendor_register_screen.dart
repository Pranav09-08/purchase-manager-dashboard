// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:flutter/material.dart';
// import '../../core/theme/app_colors.dart';
// import '../../services/vendor_auth_service.dart';
//
// class VendorRegisterScreen extends StatefulWidget {
//   const VendorRegisterScreen({super.key});
//
//   @override
//   State<VendorRegisterScreen> createState() => _VendorRegisterScreenState();
// }
//
// class _VendorRegisterScreenState extends State<VendorRegisterScreen> {
//   final _formKey = GlobalKey<FormState>();
//
//   final vendorNameCtrl = TextEditingController();
//   final vendorEmailCtrl = TextEditingController();
//   final vendorPhoneCtrl = TextEditingController();
//   final vendorAddressCtrl = TextEditingController();
//
//   final companyNameCtrl = TextEditingController();
//   final companyTinCtrl = TextEditingController();
//   final companyAddressCtrl = TextEditingController();
//   final websiteCtrl = TextEditingController();
//
//   final passwordCtrl = TextEditingController();
//
//   bool isLoading = false;
//
//   Future<void> _registerVendor() async {
//     if (!_formKey.currentState!.validate()) return;
//
//     setState(() => isLoading = true);
//
//     try {
//       await VendorAuthService().registerVendor(
//         name: vendorNameCtrl.text.trim(),
//         email: vendorEmailCtrl.text.trim(),
//         phone: vendorPhoneCtrl.text.trim(),
//         address: vendorAddressCtrl.text.trim(),
//         companyName: companyNameCtrl.text.trim(),
//         companyTin: companyTinCtrl.text.trim(),
//         companyAddress: companyAddressCtrl.text.trim(),
//         companyWebsite: websiteCtrl.text.trim(),
//       );
//
//       // 🔥 Send password setup email
//       await FirebaseAuth.instance
//           .sendPasswordResetEmail(email: vendorEmailCtrl.text.trim());
//
//       if (!mounted) return;
//
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(
//           content: Text(
//               'Vendor registered. Check email to set password. Await admin approval.'),
//         ),
//       );
//
//       Navigator.pop(context);
//     } catch (e) {
//       ScaffoldMessenger.of(context)
//           .showSnackBar(SnackBar(content: Text(e.toString())));
//     }
//
//     setState(() => isLoading = false);
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: AppColors.lightGrey,
//       appBar: AppBar(
//         backgroundColor: AppColors.navy,
//         title: const Text("Vendor Registration"),
//       ),
//       body: Center(
//         child: SingleChildScrollView(
//           padding: const EdgeInsets.all(20),
//           child: Container(
//             width: 500,
//             padding: const EdgeInsets.all(30),
//             decoration: BoxDecoration(
//               color: Colors.white,
//               borderRadius: BorderRadius.circular(20),
//               boxShadow: [
//                 BoxShadow(
//                   blurRadius: 20,
//                   color: Colors.blue.withOpacity(0.15),
//                 )
//               ],
//             ),
//             child: Form(
//               key: _formKey,
//               child: Column(
//                 children: [
//
//                   const Text(
//                     "Vendor & Company Registration",
//                     style: TextStyle(
//                       fontSize: 20,
//                       fontWeight: FontWeight.bold,
//                       color: AppColors.navy,
//                     ),
//                   ),
//
//                   const SizedBox(height: 25),
//
//                   _input(vendorNameCtrl, "Vendor Name"),
//                   _input(vendorEmailCtrl, "Vendor Email"),
//                   _input(vendorPhoneCtrl, "Vendor Phone"),
//                   _input(vendorAddressCtrl, "Vendor Address"),
//
//                   const SizedBox(height: 20),
//
//                   _input(companyNameCtrl, "Company Name"),
//                   _input(companyTinCtrl, "Company TIN"),
//                   _input(companyAddressCtrl, "Company Address"),
//                   _input(websiteCtrl, "Website"),
//
//                   const SizedBox(height: 20),
//
//                   _input(passwordCtrl, "Password", isPassword: true),
//
//                   const SizedBox(height: 30),
//
//                   SizedBox(
//                     height: 50,
//                     width: double.infinity,
//                     child: ElevatedButton(
//                       onPressed: isLoading ? null : _registerVendor,
//                       style: ElevatedButton.styleFrom(
//                         backgroundColor: AppColors.navy,
//                       ),
//                       child: isLoading
//                           ? const CircularProgressIndicator(
//                         color: Colors.white,
//                       )
//                           : const Text(
//                         "REGISTER AS VENDOR",
//                         style: TextStyle(
//                           color: Colors.white,
//                           fontWeight: FontWeight.bold,
//                         ),
//                       ),
//                     ),
//                   )
//                 ],
//               ),
//             ),
//           ),
//         ),
//       ),
//     );
//   }
//
//   Widget _input(TextEditingController ctrl, String label,
//       {bool isPassword = false}) {
//     return Padding(
//       padding: const EdgeInsets.only(bottom: 14),
//       child: TextFormField(
//         controller: ctrl,
//         obscureText: isPassword,
//         validator: (v) => v == null || v.isEmpty ? "Required" : null,
//         decoration: InputDecoration(
//           labelText: label,
//           filled: true,
//           fillColor: AppColors.lightGrey,
//           border: OutlineInputBorder(
//             borderRadius: BorderRadius.circular(14),
//             borderSide: BorderSide.none,
//           ),
//         ),
//       ),
//     );
//   }
// }