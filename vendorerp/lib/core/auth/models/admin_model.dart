class Admin {
  final String adminId;
  final String username;
  final String email;
  final String fullName;
  final String role;

  Admin({
    required this.adminId,
    required this.username,
    required this.email,
    required this.fullName,
    required this.role,
  });

  factory Admin.fromJson(Map<String, dynamic> json) {
    return Admin(
      adminId: json['admin_id'].toString(),
      username: json['username'],
      email: json['email'],
      fullName: json['full_name'] ?? '',
      role: json['role'] ?? '',
    );
  }
}
