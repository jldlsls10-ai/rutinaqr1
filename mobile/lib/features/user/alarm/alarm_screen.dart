import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/activity.dart';
import '../scanner/scanner_screen.dart';
import '../success/success_screen.dart';

/// Pantalla de alarma obligatoria.
/// Se muestra a pantalla completa y solo se cierra al escanear el QR correcto.
/// En producción se lanza mediante Full-Screen Intent (Android) o Critical Alert (iOS).
class AlarmScreen extends StatefulWidget {
  final Activity activity;

  const AlarmScreen({
    super.key,
    required this.activity,
  });

  @override
  State<AlarmScreen> createState() => _AlarmScreenState();
}

class _AlarmScreenState extends State<AlarmScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    // Evitar que el usuario salga fácilmente
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  Future<void> _openScanner() async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ScannerScreen(expectedActivity: widget.activity),
        fullscreenDialog: true,
      ),
    );

    if (result == true && mounted) {
      // Cancelar alarma + marcar completado
      // TODO: AlarmService.cancel(activity.id)
      // TODO: CompletionsApi.markCompleted(...)

      await Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => SuccessScreen(activityName: widget.activity.name),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // WillPopScope / PopScope para bloquear el botón atrás
    return PopScope(
      canPop: false, // no se puede salir sin escanear
      child: Scaffold(
        backgroundColor: const Color(0xFF1A237E),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const Spacer(flex: 1),

                // Badge de alarma
                ScaleTransition(
                  scale: Tween(begin: 0.95, end: 1.05).animate(
                    CurvedAnimation(
                      parent: _pulseController,
                      curve: Curves.easeInOut,
                    ),
                  ),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: AppTheme.warning,
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: const Text(
                      '¡ES LA HORA!',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Colors.black87,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Icono / imagen
                Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.notifications_active,
                    size: 90,
                    color: Colors.white,
                  ),
                ),

                const SizedBox(height: 32),

                // Nombre de la actividad
                Text(
                  widget.activity.name,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.2,
                  ),
                ),

                const SizedBox(height: 12),

                Text(
                  widget.activity.timeLabel,
                  style: TextStyle(
                    fontSize: 22,
                    color: Colors.white.withOpacity(0.8),
                    fontWeight: FontWeight.w600,
                  ),
                ),

                const Spacer(flex: 2),

                // Botón único: Escanear
                SizedBox(
                  width: double.infinity,
                  height: 76,
                  child: FilledButton.icon(
                    onPressed: _openScanner,
                    icon: const Icon(Icons.qr_code_scanner, size: 34),
                    label: const Text(
                      'Escanear código',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF1A237E),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
