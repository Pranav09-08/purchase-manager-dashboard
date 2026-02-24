import 'package:flutter/material.dart';

class VendorListCard extends StatelessWidget {
  final Map<String, dynamic> vendor;
  final VoidCallback onTap;
  const VendorListCard({Key? key, required this.vendor, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFF8EAFB),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.pink.shade100.withOpacity(0.18),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: Colors.blue[100],
              child: const Icon(Icons.person, color: Colors.blue, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(vendor['contact_person'] ?? '-', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                  Text(vendor['company_name'] ?? '-', style: TextStyle(fontSize: 14, color: Colors.blueGrey[700])),
                  Text(vendor['contact_email'] ?? '', style: TextStyle(fontSize: 13, color: Colors.blueGrey[700])),
                  Text(vendor['contact_phone'] ?? '', style: TextStyle(fontSize: 13, color: Colors.blueGrey[700])),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.blueGrey, size: 28),
          ],
        ),
      ),
    );
  }
}
