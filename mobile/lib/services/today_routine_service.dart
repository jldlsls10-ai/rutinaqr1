import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';
import '../models/activity.dart';
import 'alarm_service.dart';

/// Carga la rutina del día (online o desde caché) y programa las alarmas.
class TodayRoutineService {
  final ApiClient _api;
  final AlarmService _alarms;

  TodayRoutineService(this._api, this._alarms);

  /// Obtiene las actividades de hoy para el usuario autenticado.
  Future<List<Activity>> fetchToday() async {
    try {
      final response = await _api.dio.get('/routines/user/today');
      final data = response.data['data'] as List<dynamic>? ?? [];

      final activities = <Activity>[];
      for (final routine in data) {
        final acts = (routine['activities'] as List<dynamic>? ?? []);
        for (final a in acts) {
          activities.add(Activity.fromJson(a as Map<String, dynamic>));
        }
      }

      // Ordenar por hora
      activities.sort((a, b) => a.scheduledTime.compareTo(b.scheduledTime));

      // Programar alarmas locales
      await _alarms.scheduleToday(activities);

      return activities;
    } catch (e) {
      // TODO: fallback a Drift (offline)
      rethrow;
    }
  }

  /// Marca una actividad como completada tras escanear el QR correcto.
  Future<void> markCompleted(Activity activity, {required bool qrValid}) async {
    await _api.dio.post('/completions', data: {
      'activityId': activity.id,
      'scannedQrValid': qrValid,
    });

    // Cancelar la alarma de esta actividad
    final now = DateTime.now();
    final parts = activity.scheduledTime.split(':');
    final scheduled = DateTime(
      now.year,
      now.month,
      now.day,
      int.tryParse(parts[0]) ?? 0,
      int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0,
    );
    await _alarms.cancelActivityAlarm(activity.id, scheduled);
  }
}

/// Provider sencillo (se puede mejorar con AsyncNotifier)
final apiClientProvider = Provider((ref) => ApiClient());
final alarmServiceProvider = Provider((ref) => AlarmService());
final todayRoutineServiceProvider = Provider((ref) {
  return TodayRoutineService(
    ref.watch(apiClientProvider),
    ref.watch(alarmServiceProvider),
  );
});
