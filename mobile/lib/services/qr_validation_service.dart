import 'dart:convert';
import 'package:crypto/crypto.dart'; // añadir dependencia crypto si se usa HMAC local

/// Servicio de validación de QR en el dispositivo.
/// En producción la clave HMAC se sincroniza de forma segura o se valida siempre contra el backend.
class QrValidationService {
  /// Valida el formato y, si es posible, la firma.
  /// Devuelve el activityId si es válido.
  static QrValidationResult validate(String rawQr, {String? expectedActivityId}) {
    final parts = rawQr.split('.');
    if (parts.length != 2) {
      return QrValidationResult(valid: false, reason: 'FORMAT');
    }

    try {
      final payloadJson = utf8.decode(base64Url.decode(_pad(parts[0])));
      final data = jsonDecode(payloadJson) as Map<String, dynamic>;
      final activityId = data['aid'] as String?;
      final exp = data['exp'] as int?;

      if (activityId == null) {
        return QrValidationResult(valid: false, reason: 'NO_ACTIVITY_ID');
      }

      if (exp != null && exp < DateTime.now().millisecondsSinceEpoch ~/ 1000) {
        return QrValidationResult(valid: false, reason: 'EXPIRED');
      }

      if (expectedActivityId != null && activityId != expectedActivityId) {
        return QrValidationResult(valid: false, reason: 'WRONG_ACTIVITY');
      }

      // TODO: verificar HMAC con secreto (o confiar en validación de backend)
      return QrValidationResult(valid: true, activityId: activityId);
    } catch (_) {
      return QrValidationResult(valid: false, reason: 'PAYLOAD');
    }
  }

  static String _pad(String s) {
    final pad = 4 - s.length % 4;
    if (pad < 4) return s + ('=' * pad);
    return s;
  }
}

class QrValidationResult {
  final bool valid;
  final String? activityId;
  final String? reason;

  QrValidationResult({
    required this.valid,
    this.activityId,
    this.reason,
  });
}
