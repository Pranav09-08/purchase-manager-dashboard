class Vendor {
  final String vendorId;
  final String companyName;
  final String contactEmail;
  final String? contactPerson;
  final String? contactPhone;
  final String? address;
  final String? companyWebsite;

  Vendor({
    required this.vendorId,
    required this.companyName,
    required this.contactEmail,
    this.contactPerson,
    this.contactPhone,
    this.address,
    this.companyWebsite,
  });

  factory Vendor.fromJson(Map<String, dynamic> json) {
    return Vendor(
      vendorId: json['vendor_id'].toString(),
      companyName: json['company_name'] ?? '',
      contactEmail: json['contact_email'] ?? '',
      contactPerson: json['contact_person'],
      contactPhone: json['contact_phone'],
      address: json['address'],
      companyWebsite: json['company_website'],
    );
  }
}
