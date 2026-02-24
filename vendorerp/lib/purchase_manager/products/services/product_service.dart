import 'dart:convert';
import 'package:http/http.dart' as http;

class ProductService {
  // Use the same base URL as the frontend
  final String baseUrl;
  ProductService({this.baseUrl = 'https://dqwltqhs-3000.inc1.devtunnels.ms/api'}) ;

  Future<List<Map<String, dynamic>>> getProducts({String? token}) async {
    final url = Uri.parse('$baseUrl/api/products');
    final headers = <String, String>{};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    final response = await http.get(url, headers: headers);
    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.cast<Map<String, dynamic>>();
    } else {
      throw Exception('Failed to load products: ${response.body}');
    }
  }
}
