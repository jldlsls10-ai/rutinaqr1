class Activity {
  final String id;
  final String routineId;
  final String name;
  final String scheduledTime; // "08:30:00"
  final String? imageUrl;
  final String? audioUrl;
  final String? instructions;
  final int orderIndex;
  final String? qrPayload;
  final int graceMinutes;
  final bool isActive;

  // Estado del día (opcional, viene del backend)
  final String? status; // pending | completed | late | missed
  final DateTime? completedAt;

  const Activity({
    required this.id,
    required this.routineId,
    required this.name,
    required this.scheduledTime,
    this.imageUrl,
    this.audioUrl,
    this.instructions,
    this.orderIndex = 0,
    this.qrPayload,
    this.graceMinutes = 10,
    this.isActive = true,
    this.status,
    this.completedAt,
  });

  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      id: json['id'] as String,
      routineId: json['routineId'] as String? ?? json['routine_id'] as String? ?? '',
      name: json['name'] as String,
      scheduledTime: json['scheduledTime'] as String? ?? json['scheduled_time'] as String? ?? '00:00:00',
      imageUrl: json['imageUrl'] as String? ?? json['image_url'] as String?,
      audioUrl: json['audioUrl'] as String? ?? json['audio_url'] as String?,
      instructions: json['instructions'] as String?,
      orderIndex: json['orderIndex'] as int? ?? json['order_index'] as int? ?? 0,
      qrPayload: json['qrPayload'] as String? ?? json['qr_payload'] as String?,
      graceMinutes: json['graceMinutes'] as int? ?? json['grace_minutes'] as int? ?? 10,
      isActive: json['isActive'] as bool? ?? json['is_active'] as bool? ?? true,
      status: json['status'] as String?,
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'] as String)
          : null,
    );
  }

  bool get isCompleted => status == 'completed';
  bool get isPending => status == null || status == 'pending';

  /// Hora legible (08:30)
  String get timeLabel {
    final parts = scheduledTime.split(':');
    if (parts.length >= 2) return '${parts[0]}:${parts[1]}';
    return scheduledTime;
  }
}
