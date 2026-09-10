import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/activity.dart';
import '../scanner/scanner_screen.dart';
import '../success/success_screen.dart';

/// Pantalla principal del Modo Usuario.
/// Diseño extremadamente simple: imagen grande + nombre + botón escanear.
class HomeUserScreen extends StatefulWidget {
  const HomeUserScreen({super.key});

  @override
  State<HomeUserScreen> createState() => _HomeUserScreenState();
}

class _HomeUserScreenState extends State<HomeUserScreen> {
  // Datos de ejemplo (en producción vienen del provider / backend offline)
  Activity? _currentActivity;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadToday();
  }

  Future<void> _loadToday() async {
    // TODO: llamar a API o base local Drift
    await Future.delayed(const Duration(milliseconds: 400));
    if (!mounted) return;
    setState(() {
      _currentActivity = const Activity(
        id: 'demo-activity-1',
        routineId: 'demo-routine',
        name: 'Cepillarse los dientes',
        scheduledTime: '08:00:00',
        instructions: 'Usa el cepillo y la pasta de dientes durante 2 minutos.',
        orderIndex: 1,
        graceMinutes: 10,
      );
      _loading = false;
    });
  }

  Future<void> _openScanner() async {
    if (_currentActivity == null) return;

    HapticFeedback.mediumImpact();

    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ScannerScreen(
          expectedActivity: _currentActivity!,
        ),
        fullscreenDialog: true,
      ),
    );

    if (result == true && mounted) {
      // Éxito → pantalla de celebración
      await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => SuccessScreen(activityName: _currentActivity!.name),
          fullscreenDialog: true,
        ),
      );
      // Después de éxito, recargar siguiente actividad
      _loadToday();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = AppTheme.userMode(fontScale: 1.35);

    return Theme(
      data: theme,
      child: Scaffold(
        body: SafeArea(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _currentActivity == null
                  ? _EmptyState()
                  : _ActivityView(
                      activity: _currentActivity!,
                      onScan: _openScanner,
                    ),
        ),
      ),
    );
  }
}

class _ActivityView extends StatelessWidget {
  final Activity activity;
  final VoidCallback onScan;

  const _ActivityView({
    required this.activity,
    required this.onScan,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        children: [
          const Spacer(flex: 1),

          // Imagen grande de la actividad
          Expanded(
            flex: 5,
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.grey.shade300, width: 2),
              ),
              child: activity.imageUrl != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(22),
                      child: Image.network(
                        activity.imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _PlaceholderIcon(),
                      ),
                    )
                  : _PlaceholderIcon(),
            ),
          ),

          const SizedBox(height: 28),

          // Nombre de la actividad (muy grande)
          Text(
            activity.name,
            textAlign: TextAlign.center,
            style: textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w800,
              height: 1.2,
            ),
          ),

          const SizedBox(height: 8),

          // Hora
          Text(
            activity.timeLabel,
            style: textTheme.titleLarge?.copyWith(
              color: Colors.grey.shade700,
              fontWeight: FontWeight.w600,
            ),
          ),

          const Spacer(flex: 1),

          // Botón principal gigante
          SizedBox(
            width: double.infinity,
            height: 72,
            child: FilledButton.icon(
              onPressed: onScan,
              icon: const Icon(Icons.qr_code_scanner, size: 32),
              label: const Text('Escanear'),
              style: FilledButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
              ),
            ),
          ),

          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _PlaceholderIcon extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Icon(
        Icons.task_alt,
        size: 120,
        color: Color(0xFF1F4E79),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.celebration, size: 96, color: Colors.grey.shade400),
            const SizedBox(height: 24),
            Text(
              'Hoy no hay tareas.\n¡Disfruta el día!',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: Colors.grey.shade700,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
