import '../../../services/api_service.dart';

class VendorComponentsService {

  /// ==============================
  /// GET VENDOR COMPONENTS
  /// ==============================
  Future<List<dynamic>> getVendorComponents() async {
    final response =
    await ApiService.get('/vendor/components');

    return response['products'] ?? [];
  }

  /// ==============================
  /// GET REQUIRED COMPONENTS
  /// ==============================
  Future<List<dynamic>> getRequiredComponents() async {
    final response =
    await ApiService.get('/vendor/components-required');

    return response['requiredComponents'] ?? [];
  }

  /// ==============================
  /// GET AVAILABLE COMPONENTS (Add From Company)
  /// ==============================
  Future<List<dynamic>> getAvailableComponents() async {
    final response =
    await ApiService.get('/vendor/available-components');

    return response['components'] ?? [];
  }

  /// ==============================
  /// ADD CUSTOM COMPONENT
  /// ==============================
  Future<Map<String, dynamic>> addComponent(
      Map<String, dynamic> body) async {
    return await ApiService.post(
        '/vendor/components', body);
  }

  /// ==============================
  /// UPDATE COMPONENT
  /// ==============================
  Future<Map<String, dynamic>> updateComponent(
      String componentId,
      Map<String, dynamic> body) async {
    return await ApiService.put(
        '/vendor/components/$componentId', body);
  }

  /// ==============================
  /// DELETE COMPONENT
  /// ==============================
  Future<void> deleteComponent(
      String componentId) async {
    await ApiService.delete(
        '/vendor/components/$componentId');
  }

  /// ==============================
  /// ADD FROM COMPANY LIST
  /// ==============================
  Future<Map<String, dynamic>> addFromCompany(
      Map<String, dynamic> body) async {
    return await ApiService.post(
        '/vendor/add-available-component',
        body);
  }
}