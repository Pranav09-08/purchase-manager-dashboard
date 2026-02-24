import 'package:dio/dio.dart';

class LoginResponse {
  final String userType;
  final String customToken;

  LoginResponse({
    required this.userType,
    required this.customToken,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      userType: json["userType"],
      customToken: json["customToken"],
    );
  }
}

class AuthApiService {
  final Dio dio = Dio(BaseOptions(baseUrl: "https://dqwltqhs-3000.inc1.devtunnels.ms/api"));

  Future<LoginResponse> login(String email, String password) async {
    final res = await dio.post("/auth/login", data: {
      "email": email,
      "password": password,
    });

    return LoginResponse.fromJson(res.data);
  }
}
