// import 'package:flutter/material.dart';
// import 'package:firebase_auth/firebase_auth.dart';
//
// import '../register/admin_register_screen.dart';
// import '../../core/theme/app_colors.dart';
// import '../../services/api_service.dart';
//
// class AdminLoginScreen extends StatefulWidget {
//   const AdminLoginScreen({super.key});
//
//   @override
//   State<AdminLoginScreen> createState() => _AdminLoginScreenState();
// }
//
// class _AdminLoginScreenState extends State<AdminLoginScreen> {
//   final _formKey = GlobalKey<FormState>();
//   final emailCtrl = TextEditingController();
//   final passwordCtrl = TextEditingController();
//
//   bool isLoading = false;
//   bool _obscurePassword = true;
//
//   // =========================
//   // LOGIN
//   // =========================
//   Future<void> _login() async {
//     if (!_formKey.currentState!.validate()) return;
//
//     setState(() => isLoading = true);
//
//     try {
//       // 1️⃣ Firebase Login
//       final cred = await FirebaseAuth.instance.signInWithEmailAndPassword(
//         email: emailCtrl.text.trim(),
//         password: passwordCtrl.text.trim(),
//       );
//
//       final user = cred.user;
//       if (user == null) {
//         throw Exception('Login failed');
//       }
//
//       // 2️⃣ Get ID Token
//       final token = await user.getIdToken(true);
//
//       // 3️⃣ Verify with backend
//       final response = await ApiService.postPublic(
//         "/auth/login",
//         {"token": token},
//       );
//
//       if (!mounted) return;
//
//       final role = response['user']?['role'];
//
//       if (role == null) {
//         throw Exception('Role not found');
//       }
//
//       // 4️⃣ ROUTE BASED NAVIGATION
//       // 4️⃣ ROUTE BASED NAVIGATION
//       switch (role) {
//         case 'admin':
//           Navigator.pushReplacementNamed(context, '/adminDashboard');
//           break;
//
//         case 'sales_manager':
//           Navigator.pushReplacementNamed(context, '/salesDashboard');
//           break;
//
//         case 'client':
//           Navigator.pushReplacementNamed(context, '/clientDashboard');
//           break;
//
//         case 'planning_manager':
//           Navigator.pushReplacementNamed(
//             context,
//             '/planning_manager/products',
//           );
//           break;
//
//         default:
//           throw Exception('Unknown role: $role');
//       }
//     } catch (e) {
//       await FirebaseAuth.instance.signOut();
//
//       if (!mounted) return;
//
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text(e.toString())),
//       );
//     }
//
//     if (mounted) {
//       setState(() => isLoading = false);
//     }
//   }
//
//   // =========================
//   // UI
//   // =========================
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: Stack(
//         children: [
//           Positioned.fill(
//             child: Image.asset(
//               'assets/ai/ai_pattern.png',
//               fit: BoxFit.cover,
//             ),
//           ),
//           Positioned.fill(
//             child: Container(
//               color: Colors.white.withOpacity(0.92),
//             ),
//           ),
//           Center(
//             child: SingleChildScrollView(
//               padding: const EdgeInsets.all(16),
//               child: Container(
//                 width: 420,
//                 padding: const EdgeInsets.all(28),
//                 decoration: BoxDecoration(
//                   color: Colors.white,
//                   borderRadius: BorderRadius.circular(22),
//                   boxShadow: [
//                     BoxShadow(
//                       color: Colors.blueAccent.withOpacity(0.25),
//                       blurRadius: 28,
//                       spreadRadius: 2,
//                     ),
//                   ],
//                 ),
//                 child: Form(
//                   key: _formKey,
//                   child: Column(
//                     crossAxisAlignment: CrossAxisAlignment.stretch,
//                     children: [
//                       // HEADER
//                       Column(
//                         children: [
//                           Container(
//                             height: 64,
//                             width: 64,
//                             decoration: BoxDecoration(
//                               shape: BoxShape.circle,
//                               border: Border.all(
//                                 color: AppColors.neonBlue,
//                                 width: 2.2,
//                               ),
//                             ),
//                             child: ClipOval(
//                               child: Image.asset(
//                                 'assets/logo/logo.jpeg',
//                                 fit: BoxFit.cover,
//                               ),
//                             ),
//                           ),
//                           const SizedBox(height: 18),
//                           const Text(
//                             'ERP System',
//                             style: TextStyle(
//                               fontSize: 26,
//                               fontWeight: FontWeight.bold,
//                               color: Color(0xFF1A237E),
//                             ),
//                           ),
//                           const SizedBox(height: 6),
//                           const Text(
//                             'Login',
//                             style: TextStyle(color: Colors.grey),
//                           ),
//                         ],
//                       ),
//
//                       const SizedBox(height: 34),
//
//                       // EMAIL
//                       TextFormField(
//                         controller: emailCtrl,
//                         decoration: _inputDecoration(
//                           label: 'Email',
//                           icon: Icons.email_outlined,
//                         ),
//                         validator: (v) =>
//                         v == null || v.isEmpty ? 'Enter email' : null,
//                       ),
//
//                       const SizedBox(height: 16),
//
//                       // PASSWORD
//                       TextFormField(
//                         controller: passwordCtrl,
//                         obscureText: _obscurePassword,
//                         decoration: _inputDecoration(
//                           label: 'Password',
//                           icon: Icons.lock_outline,
//                         ).copyWith(
//                           suffixIcon: IconButton(
//                             icon: Icon(
//                               _obscurePassword
//                                   ? Icons.visibility_off_outlined
//                                   : Icons.visibility_outlined,
//                             ),
//                             onPressed: () {
//                               setState(() {
//                                 _obscurePassword = !_obscurePassword;
//                               });
//                             },
//                           ),
//                         ),
//                         validator: (v) =>
//                         v == null || v.isEmpty ? 'Enter password' : null,
//                       ),
//
//                       const SizedBox(height: 30),
//
//                       // LOGIN BUTTON
//                       SizedBox(
//                         height: 50,
//                         child: ElevatedButton(
//                           onPressed: isLoading ? null : _login,
//                           style: ElevatedButton.styleFrom(
//                             backgroundColor: const Color(0xFF2979FF),
//                           ),
//                           child: isLoading
//                               ? const CircularProgressIndicator(
//                             color: Colors.white,
//                           )
//                               : const Text(
//                             'LOGIN',
//                             style: TextStyle(
//                               fontWeight: FontWeight.bold,
//                               color: Colors.white,
//                             ),
//                           ),
//                         ),
//                       ),
//
//                       const SizedBox(height: 12),
//
//                       // REGISTER
//                       OutlinedButton(
//                         onPressed: () {
//                           Navigator.push(
//                             context,
//                             MaterialPageRoute(
//                               builder: (_) =>
//                               const AdminRegisterScreen(),
//                             ),
//                           );
//                         },
//                         child: const Text('REGISTER'),
//                       ),
//
//                       const SizedBox(height: 12),
//
//                       // FORGOT PASSWORD
//                       Align(
//                         alignment: Alignment.centerRight,
//                         child: TextButton(
//                           onPressed: () async {
//                             await FirebaseAuth.instance
//                                 .sendPasswordResetEmail(
//                               email: emailCtrl.text.trim(),
//                             );
//
//                             if (!mounted) return;
//
//                             ScaffoldMessenger.of(context).showSnackBar(
//                               const SnackBar(
//                                 content:
//                                 Text('Password reset email sent'),
//                               ),
//                             );
//                           },
//                           child: const Text('Forgot Password?'),
//                         ),
//                       ),
//                     ],
//                   ),
//                 ),
//               ),
//             ),
//           ),
//         ],
//       ),
//     );
//   }
//
//   InputDecoration _inputDecoration({
//     required String label,
//     required IconData icon,
//   }) {
//     return InputDecoration(
//       labelText: label,
//       prefixIcon: Icon(icon),
//       filled: true,
//       fillColor: const Color(0xFFF8FAFD),
//       border: OutlineInputBorder(
//         borderRadius: BorderRadius.circular(14),
//         borderSide: BorderSide.none,
//       ),
//     );
//   }
// }



import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../register/admin_register_screen.dart';
import '../../core/theme/app_colors.dart';
import '../../services/api_service.dart';

class AdminLoginScreen extends StatefulWidget {
  const AdminLoginScreen({super.key});

  @override
  State<AdminLoginScreen> createState() => _AdminLoginScreenState();
}

class _AdminLoginScreenState extends State<AdminLoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final emailCtrl = TextEditingController();
  final passwordCtrl = TextEditingController();

  bool isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    emailCtrl.dispose();
    passwordCtrl.dispose();
    super.dispose();
  }

  Future<Map<String, dynamic>> _verifyWithBackend({
    required String token,
    required String email,
    required String password,
  }) async {

    // 1️⃣ Try Prenav style (email + password + token)
    try {
      return await ApiService.postPublic(
        "/auth/login",
        {
          "email": email,
          "password": password,
          "token": token,
        },
      );
    } catch (_) {}

    // 2️⃣ Try Prenav style (email + password only)
    try {
      return await ApiService.postPublic(
        "/auth/login",
        {
          "email": email,
          "password": password,
        },
      );
    } catch (_) {}

    // 3️⃣ Try Shyam style (token only)
    return await ApiService.postPublic(
      "/auth/login",
      {
        "token": token,
      },
    );
  }

  String? _extractRole(Map<String, dynamic> response) {
    final candidates = [
      response['role'],
      response['userType'],
      response['user_type'],
      (response['user'] is Map) ? response['user']['role'] : null,
      (response['user'] is Map) ? response['user']['userType'] : null,
      (response['user'] is Map) ? response['user']['user_type'] : null,
      (response['data'] is Map) ? response['data']['role'] : null,
      (response['data'] is Map) ? response['data']['userType'] : null,
      (response['data'] is Map) ? response['data']['user_type'] : null,
      (response['data'] is Map && response['data']['user'] is Map)
          ? response['data']['user']['role']
          : null,
      (response['data'] is Map && response['data']['user'] is Map)
          ? response['data']['user']['userType']
          : null,
      (response['data'] is Map && response['data']['user'] is Map)
          ? response['data']['user']['user_type']
          : null,
    ];

    for (final value in candidates) {
      final parsed = value?.toString().toLowerCase().trim();
      if (parsed != null && parsed.isNotEmpty) {
        return parsed;
      }
    }
    return null;
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => isLoading = true);

    try {
      final email = emailCtrl.text.trim();
      final password = passwordCtrl.text.trim();

      final cred = await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = cred.user;
      if (user == null) {
        throw Exception('Login failed');
      }


      final token = await user.getIdToken(true);
      if (token == null || token.isEmpty) {
        throw Exception('Failed to get Firebase token');
      }

      final response = await _verifyWithBackend(
        token: token,
        email: email,
        password: password,
      );

      if (!mounted) return;

      final role = _extractRole(response);

      if (role == null) {
        throw Exception('Role not found');
      }

      switch (role) {
        case 'admin':
          Navigator.pushReplacementNamed(context, '/adminDashboard');
          break;
        case 'sales_manager':
          Navigator.pushReplacementNamed(context, '/salesDashboard');
          break;
        case 'client':
          Navigator.pushReplacementNamed(context, '/clientDashboard');
          break;
        case 'planning_manager':
          Navigator.pushReplacementNamed(context, '/planning_manager/products');
          break;
        case 'vendor':
          Navigator.pushReplacementNamed(context, '/VendorOverview');
          break;
        default:
          throw Exception('Unknown role: $role');
      }
    } catch (e) {
      await FirebaseAuth.instance.signOut();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            child: Image.asset(
              'assets/ai/ai_pattern.png',
              fit: BoxFit.cover,
            ),
          ),
          Positioned.fill(
            child: Container(
              color: Colors.white.withOpacity(0.92),
            ),
          ),
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Container(
                width: 420,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.blueAccent.withOpacity(0.25),
                      blurRadius: 28,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Column(
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
                            ),
                            child: ClipOval(
                              child: Image.asset(
                                'assets/logo/logo.jpeg',
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          const SizedBox(height: 18),
                          const Text(
                            'ERP System',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1A237E),
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Login',
                            style: TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                      const SizedBox(height: 34),
                      TextFormField(
                        controller: emailCtrl,
                        decoration: _inputDecoration(
                          label: 'Email',
                          icon: Icons.email_outlined,
                        ),
                        validator: (v) =>
                        v == null || v.isEmpty ? 'Enter email' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: passwordCtrl,
                        obscureText: _obscurePassword,
                        decoration: _inputDecoration(
                          label: 'Password',
                          icon: Icons.lock_outline,
                        ).copyWith(
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                        ),
                        validator: (v) =>
                        v == null || v.isEmpty ? 'Enter password' : null,
                      ),
                      const SizedBox(height: 30),
                      SizedBox(
                        height: 50,
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF2979FF),
                          ),
                          child: isLoading
                              ? const CircularProgressIndicator(
                            color: Colors.white,
                          )
                              : const Text(
                            'LOGIN',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const AdminRegisterScreen(),
                            ),
                          );
                        },
                        child: const Text('REGISTER'),
                      ),
                      const SizedBox(height: 12),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () async {
                            await FirebaseAuth.instance.sendPasswordResetEmail(
                              email: emailCtrl.text.trim(),
                            );

                            if (!mounted) return;

                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Password reset email sent'),
                              ),
                            );
                          },
                          child: const Text('Forgot Password?'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration({
    required String label,
    required IconData icon,
  }) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon),
      filled: true,
      fillColor: const Color(0xFFF8FAFD),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
    );
  }
}




// import 'package:flutter/material.dart';
// import 'package:firebase_auth/firebase_auth.dart';
//
// import '../register/admin_register_screen.dart';
// import '../register/vendor_register_screen.dart';
// import '../../core/theme/app_colors.dart';
// import '../../services/api_service.dart';
//
// class AdminLoginScreen extends StatefulWidget {
//   const AdminLoginScreen({super.key});
//
//   @override
//   State<AdminLoginScreen> createState() => _AdminLoginScreenState();
// }
//
// class _AdminLoginScreenState extends State<AdminLoginScreen> {
//   final _formKey = GlobalKey<FormState>();
//   final emailCtrl = TextEditingController();
//   final passwordCtrl = TextEditingController();
//
//   bool isLoading = false;
//   bool _obscurePassword = true;
//
//   @override
//   void dispose() {
//     emailCtrl.dispose();
//     passwordCtrl.dispose();
//     super.dispose();
//   }
//
//   /* =========================================================
//      🔍 Extract Role From Backend Response
//      ========================================================= */
//   String? _extractRole(Map<String, dynamic> response) {
//     final candidates = [
//       response['role'],
//       response['user']?['role'],
//       response['data']?['role'],
//       response['user']?['userType'],
//       response['data']?['user']?['role'],
//     ];
//
//     for (final value in candidates) {
//       final parsed = value?.toString().toLowerCase().trim();
//       if (parsed != null && parsed.isNotEmpty) {
//         return parsed;
//       }
//     }
//     return null;
//   }
//
//   /* =========================================================
//      🔐 LOGIN METHOD (Vendor First → Then Normal Auth)
//      ========================================================= */
//   Future<void> _login() async {
//     if (!_formKey.currentState!.validate()) return;
//
//     setState(() => isLoading = true);
//
//     try {
//       final email = emailCtrl.text.trim();
//       final password = passwordCtrl.text.trim();
//
//       // 1️⃣ Firebase Login
//       final cred = await FirebaseAuth.instance.signInWithEmailAndPassword(
//         email: email,
//         password: password,
//       );
//
//       final user = cred.user;
//       if (user == null) throw Exception("Login failed");
//
//       final token = await user.getIdToken(true);
//
//       Map<String, dynamic>? response;
//
//       /* ---------------------------------------------------------
//          🔵 TRY VENDOR LOGIN FIRST
//          --------------------------------------------------------- */
//       try {
//         response = await ApiService.postPublic(
//           "/vendor/login",
//           {"token": token},
//         );
//       } catch (_) {
//         response = null;
//       }
//
//       /* ---------------------------------------------------------
//          🔵 FALLBACK TO NORMAL AUTH LOGIN
//          --------------------------------------------------------- */
//       response ??= await ApiService.postPublic(
//         "/auth/login",
//         {
//           "email": email,
//           "password": password,
//           "token": token,
//         },
//       );
//
//       if (!mounted) return;
//
//       final role = _extractRole(response);
//
//       if (role == null) {
//         throw Exception("Role not found");
//       }
//
//       /* =========================================================
//          🚀 ROLE-BASED NAVIGATION
//          ========================================================= */
//       switch (role) {
//         case 'admin':
//           Navigator.pushReplacementNamed(context, '/adminDashboard');
//           break;
//
//         case 'sales_manager':
//           Navigator.pushReplacementNamed(context, '/salesDashboard');
//           break;
//
//         case 'client':
//           Navigator.pushReplacementNamed(context, '/clientDashboard');
//           break;
//
//         case 'planning_manager':
//           Navigator.pushReplacementNamed(
//               context, '/planning_manager/products');
//           break;
//
//         case 'vendor':
//           Navigator.pushReplacementNamed(context, '/VendorOverview');
//           break;
//
//         default:
//           throw Exception('Unknown role: $role');
//       }
//     } catch (e) {
//       await FirebaseAuth.instance.signOut();
//
//       if (!mounted) return;
//
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text(e.toString())),
//       );
//     } finally {
//       if (mounted) setState(() => isLoading = false);
//     }
//   }
//
//   /* =========================================================
//      🎨 UI
//      ========================================================= */
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: Stack(
//         children: [
//           Positioned.fill(
//             child: Image.asset(
//               'assets/ai/ai_pattern.png',
//               fit: BoxFit.cover,
//             ),
//           ),
//           Positioned.fill(
//             child: Container(
//               color: Colors.white.withOpacity(0.92),
//             ),
//           ),
//           Center(
//             child: SingleChildScrollView(
//               padding: const EdgeInsets.all(16),
//               child: Container(
//                 width: 420,
//                 padding: const EdgeInsets.all(28),
//                 decoration: BoxDecoration(
//                   color: Colors.white,
//                   borderRadius: BorderRadius.circular(22),
//                   boxShadow: [
//                     BoxShadow(
//                       color: Colors.blueAccent.withOpacity(0.25),
//                       blurRadius: 28,
//                       spreadRadius: 2,
//                     ),
//                   ],
//                 ),
//                 child: Form(
//                   key: _formKey,
//                   child: Column(
//                     crossAxisAlignment: CrossAxisAlignment.stretch,
//                     children: [
//                       /* ---------------- Header ---------------- */
//                       Column(
//                         children: [
//                           Container(
//                             height: 64,
//                             width: 64,
//                             decoration: BoxDecoration(
//                               shape: BoxShape.circle,
//                               border: Border.all(
//                                 color: AppColors.neonBlue,
//                                 width: 2.2,
//                               ),
//                             ),
//                             child: ClipOval(
//                               child: Image.asset(
//                                 'assets/logo/logo.jpeg',
//                                 fit: BoxFit.cover,
//                               ),
//                             ),
//                           ),
//                           const SizedBox(height: 18),
//                           const Text(
//                             'ERP System',
//                             style: TextStyle(
//                               fontSize: 26,
//                               fontWeight: FontWeight.bold,
//                               color: Color(0xFF1A237E),
//                             ),
//                           ),
//                           const SizedBox(height: 6),
//                           const Text(
//                             'Login',
//                             style: TextStyle(color: Colors.grey),
//                           ),
//                         ],
//                       ),
//
//                       const SizedBox(height: 34),
//
//                       /* ---------------- Email ---------------- */
//                       TextFormField(
//                         controller: emailCtrl,
//                         decoration: _inputDecoration(
//                           label: 'Email',
//                           icon: Icons.email_outlined,
//                         ),
//                         validator: (v) =>
//                         v == null || v.isEmpty ? 'Enter email' : null,
//                       ),
//
//                       const SizedBox(height: 16),
//
//                       /* ---------------- Password ---------------- */
//                       TextFormField(
//                         controller: passwordCtrl,
//                         obscureText: _obscurePassword,
//                         decoration: _inputDecoration(
//                           label: 'Password',
//                           icon: Icons.lock_outline,
//                         ).copyWith(
//                           suffixIcon: IconButton(
//                             icon: Icon(
//                               _obscurePassword
//                                   ? Icons.visibility_off_outlined
//                                   : Icons.visibility_outlined,
//                             ),
//                             onPressed: () {
//                               setState(() {
//                                 _obscurePassword = !_obscurePassword;
//                               });
//                             },
//                           ),
//                         ),
//                         validator: (v) =>
//                         v == null || v.isEmpty ? 'Enter password' : null,
//                       ),
//
//                       const SizedBox(height: 30),
//
//                       /* ---------------- Login Button ---------------- */
//                       SizedBox(
//                         height: 50,
//                         child: ElevatedButton(
//                           onPressed: isLoading ? null : _login,
//                           style: ElevatedButton.styleFrom(
//                             backgroundColor: const Color(0xFF2979FF),
//                           ),
//                           child: isLoading
//                               ? const CircularProgressIndicator(
//                             color: Colors.white,
//                           )
//                               : const Text(
//                             'LOGIN',
//                             style: TextStyle(
//                               fontWeight: FontWeight.bold,
//                               color: Colors.white,
//                             ),
//                           ),
//                         ),
//                       ),
//
//                       const SizedBox(height: 14),
//
//                       /* ---------------- Register Buttons ---------------- */
//                       Row(
//                         children: [
//                           Expanded(
//                             child: OutlinedButton(
//                               onPressed: () {
//                                 Navigator.push(
//                                   context,
//                                   MaterialPageRoute(
//                                     builder: (_) =>
//                                     const AdminRegisterScreen(),
//                                   ),
//                                 );
//                               },
//                               child: const Text('REGISTER ADMIN'),
//                             ),
//                           ),
//                           const SizedBox(width: 10),
//                           Expanded(
//                             child: OutlinedButton(
//                               onPressed: () {
//                                 Navigator.push(
//                                   context,
//                                   MaterialPageRoute(
//                                     builder: (_) =>
//                                     const VendorRegisterScreen(),
//                                   ),
//                                 );
//                               },
//                               child: const Text('REGISTER VENDOR'),
//                             ),
//                           ),
//                         ],
//                       ),
//
//                       const SizedBox(height: 12),
//
//                       /* ---------------- Forgot Password ---------------- */
//                       Align(
//                         alignment: Alignment.centerRight,
//                         child: TextButton(
//                           onPressed: () async {
//                             await FirebaseAuth.instance
//                                 .sendPasswordResetEmail(
//                                 email: emailCtrl.text.trim());
//
//                             if (!mounted) return;
//
//                             ScaffoldMessenger.of(context).showSnackBar(
//                               const SnackBar(
//                                 content:
//                                 Text('Password reset email sent'),
//                               ),
//                             );
//                           },
//                           child: const Text('Forgot Password?'),
//                         ),
//                       ),
//                     ],
//                   ),
//                 ),
//               ),
//             ),
//           ),
//         ],
//       ),
//     );
//   }
//
//   InputDecoration _inputDecoration({
//     required String label,
//     required IconData icon,
//   }) {
//     return InputDecoration(
//       labelText: label,
//       prefixIcon: Icon(icon),
//       filled: true,
//       fillColor: const Color(0xFFF8FAFD),
//       border: OutlineInputBorder(
//         borderRadius: BorderRadius.circular(14),
//         borderSide: BorderSide.none,
//       ),
//     );
//   }
// }