import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz_data;
import '../models/activity.dart';

/// Servicio de alarmas prioritarias para el Modo Usuario.
///
/// Android: usa canales de máxima importancia + Full-Screen Intent.
/// iOS: usa time-sensitive / critical alerts (requiere entitlement de Apple).
///
/// IMPORTANTE: En producción hay que:
/// 1. Solicitar permiso de notificaciones
/// 2. En Android: pedir IGNORE_BATTERY_OPTIMIZATIONS
/// 3. Programar con AlarmManager.setExactAndAllowWhileIdle (plugin nativo)
/// 4. Registrar un BroadcastReceiver para BOOT_COMPLETED y reprogramar
class AlarmService {
  static final AlarmService _instance = AlarmService._();
  factory AlarmService() => _instance;
  AlarmService._();

  final FlutterLocalNotificationsPlugin _plugin = FlutterLocalNotificationsPlugin();
  bool _initialized = false;

  static const String _channelId = 'rutinaqr_alarms';
  static const String _channelName = 'Alarmas de rutina';
  static const String _channelDesc = 'Alarmas obligatorias que requieren escanear QR';

  Future<void> init() async {
    if (_initialized) return;

    tz_data.initializeTimeZones();

    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
      // Critical alerts requieren entitlement especial de Apple
    );

    await _plugin.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Canal de máxima prioridad (Android)
    const androidChannel = AndroidNotificationChannel(
      _channelId,
      _channelName,
      description: _channelDesc,
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
      // insistent: true  → se puede configurar vía native
    );

    await _plugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);

    _initialized = true;
  }

  /// Programa una alarma para una actividad concreta.
  /// [scheduledDate] debe incluir la fecha + hora de la actividad.
  Future<void> scheduleActivityAlarm({
    required Activity activity,
    required DateTime scheduledDate,
  }) async {
    await init();

    final id = _notificationId(activity.id, scheduledDate);

    final androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDesc,
      importance: Importance.max,
      priority: Priority.max,
      category: AndroidNotificationCategory.alarm,
      fullScreenIntent: true, // abre la app a pantalla completa
      ongoing: true,
      autoCancel: false,
      visibility: NotificationVisibility.public,
      // sound: RawResourceAndroidNotificationSound('alarm'),
    );

    final iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      interruptionLevel: InterruptionLevel.timeSensitive,
      // Para critical: interruptionLevel: InterruptionLevel.critical
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    final tzDate = tz.TZDateTime.from(scheduledDate, tz.local);

    await _plugin.zonedSchedule(
      id,
      '¡Es la hora!',
      activity.name,
      tzDate,
      details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      payload: activity.id, // para abrir AlarmScreen con la actividad correcta
    );

    debugPrint('Alarma programada: ${activity.name} → $scheduledDate (id=$id)');
  }

  /// Cancela la alarma de una actividad (después de escanear el QR correcto).
  Future<void> cancelActivityAlarm(String activityId, DateTime scheduledDate) async {
    final id = _notificationId(activityId, scheduledDate);
    await _plugin.cancel(id);
    debugPrint('Alarma cancelada: $activityId');
  }

  /// Cancela todas las alarmas (útil al cambiar de día o de rutina).
  Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }

  /// Programa todas las actividades pendientes del día.
  Future<void> scheduleToday(List<Activity> activities) async {
    final now = DateTime.now();
    for (final activity in activities) {
      if (activity.isCompleted) continue;
      final parts = activity.scheduledTime.split(':');
      if (parts.length < 2) continue;
      final hour = int.tryParse(parts[0]) ?? 0;
      final minute = int.tryParse(parts[1]) ?? 0;
      var scheduled = DateTime(now.year, now.month, now.day, hour, minute);
      // Si la hora ya pasó, no programar (o programar para mañana según lógica de negocio)
      if (scheduled.isBefore(now)) continue;
      await scheduleActivityAlarm(activity: activity, scheduledDate: scheduled);
    }
  }

  int _notificationId(String activityId, DateTime date) {
    // ID estable y único por actividad + día
    final dayKey = '${date.year}${date.month.toString().padLeft(2, '0')}${date.day.toString().padLeft(2, '0')}';
    return Object.hash(activityId, dayKey) & 0x7FFFFFFF;
  }

  void _onNotificationTapped(NotificationResponse response) {
    final activityId = response.payload;
    if (activityId == null) return;
    // TODO: navegar a AlarmScreen con la actividad correspondiente
    // Se puede usar un GlobalKey<NavigatorState> o un stream/riverpod
    debugPrint('Notificación tocada → activityId=$activityId');
  }
}
