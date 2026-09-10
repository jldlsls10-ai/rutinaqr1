import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../models/activity.dart';
import '../../../core/theme/app_theme.dart';

/// Pantalla de escaneo de QR.
/// Solo cierra con éxito si el QR corresponde a la actividad esperada.
class ScannerScreen extends StatefulWidget {
  final Activity expectedActivity;

  const ScannerScreen({
    super.key,
    required this.expectedActivity,
  });

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  bool _handling = false;
  String? _errorMessage;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_handling) return;
    final barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final raw = barcodes.first.rawValue;
    if (raw == null || raw.isEmpty) return;

    setState(() {
      _handling = true;
      _errorMessage = null;
    });

    // Validación local rápida (en producción también se valida firma HMAC)
    final isCorrect = _isValidForActivity(raw, widget.expectedActivity);

    if (isCorrect) {
      HapticFeedback.heavyImpact();
      // TODO: llamar a backend /completions + cancelar alarma local
      if (mounted) {
        Navigator.of(context).pop(true); // éxito
      }
    } else {
      HapticFeedback.vibrate();
      setState(() {
        _errorMessage = 'Código incorrecto.\nPrueba de nuevo.';
        _handling = false;
      });
      // Limpiar mensaje después de unos segundos
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) setState(() => _errorMessage = null);
      });
    }
  }

  /// Validación simplificada.
  /// En producción: parsear payload.firma y verificar HMAC + activityId.
  bool _isValidForActivity(String raw, Activity activity) {
    // Si el QR contiene el id de la actividad → aceptamos (demo)
    if (raw.contains(activity.id)) return true;
    // Si tenemos qrPayload guardado y coincide exactamente
    if (activity.qrPayload != null && raw == activity.qrPayload) return true;
    // Demo: aceptar cualquier QR que contenga la palabra "demo" o el nombre
    if (raw.toLowerCase().contains('demo') ||
        raw.toLowerCase().contains(activity.name.toLowerCase().split(' ').first)) {
      return true;
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Cámara
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),

          // Overlay con marco guía
          CustomPaint(
            painter: _ScannerOverlayPainter(),
            child: const SizedBox.expand(),
          ),

          // Texto superior
          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: Container(
                margin: const EdgeInsets.fromLTRB(24, 24, 24, 0),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.65),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  'Apunta al código de\n${widget.expectedActivity.name}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    height: 1.3,
                  ),
                ),
              ),
            ),
          ),

          // Mensaje de error
          if (_errorMessage != null)
            Align(
              alignment: Alignment.center,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 32),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.error,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  _errorMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

          // Controles inferiores
          SafeArea(
            child: Align(
              alignment: Alignment.bottomCenter,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 32),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // Linterna
                    IconButton.filled(
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white24,
                        foregroundColor: Colors.white,
                        minimumSize: const Size(64, 64),
                      ),
                      icon: const Icon(Icons.flashlight_on, size: 28),
                      onPressed: () => _controller.toggleTorch(),
                    ),
                    // Cancelar (solo en demo; en alarma real no debería existir)
                    IconButton.filled(
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white24,
                        foregroundColor: Colors.white,
                        minimumSize: const Size(64, 64),
                      ),
                      icon: const Icon(Icons.close, size: 28),
                      onPressed: () => Navigator.of(context).pop(false),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Dibuja un marco guía semi-transparente en el centro.
class _ScannerOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cutOutSize = size.width * 0.7;
    final left = (size.width - cutOutSize) / 2;
    final top = (size.height - cutOutSize) / 2;
    final cutOut = Rect.fromLTWH(left, top, cutOutSize, cutOutSize);

    // Oscurecer fuera del marco
    final overlayPaint = Paint()..color = Colors.black.withOpacity(0.55);
    final path = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height))
      ..addRRect(RRect.fromRectAndRadius(cutOut, const Radius.circular(20)))
      ..fillType = PathFillType.evenOdd;
    canvas.drawPath(path, overlayPaint);

    // Borde del marco
    final borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;
    canvas.drawRRect(
      RRect.fromRectAndRadius(cutOut, const Radius.circular(20)),
      borderPaint,
    );

    // Esquinas más gruesas
    final cornerPaint = Paint()
      ..color = const Color(0xFF2E75B6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8
      ..strokeCap = StrokeCap.round;

    const cornerLen = 28.0;
    // Top-left
    canvas.drawLine(Offset(left, top + cornerLen), Offset(left, top), cornerPaint);
    canvas.drawLine(Offset(left, top), Offset(left + cornerLen, top), cornerPaint);
    // Top-right
    canvas.drawLine(Offset(left + cutOutSize - cornerLen, top), Offset(left + cutOutSize, top), cornerPaint);
    canvas.drawLine(Offset(left + cutOutSize, top), Offset(left + cutOutSize, top + cornerLen), cornerPaint);
    // Bottom-left
    canvas.drawLine(Offset(left, top + cutOutSize - cornerLen), Offset(left, top + cutOutSize), cornerPaint);
    canvas.drawLine(Offset(left, top + cutOutSize), Offset(left + cornerLen, top + cutOutSize), cornerPaint);
    // Bottom-right
    canvas.drawLine(Offset(left + cutOutSize - cornerLen, top + cutOutSize), Offset(left + cutOutSize, top + cutOutSize), cornerPaint);
    canvas.drawLine(Offset(left + cutOutSize, top + cutOutSize - cornerLen), Offset(left + cutOutSize, top + cutOutSize), cornerPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
