import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Temas accesibles para RutinaQR.
/// El modo Usuario usa tipografía grande y alto contraste por defecto.
class AppTheme {
  static const Color primary = Color(0xFF1F4E79);
  static const Color primaryLight = Color(0xFF2E75B6);
  static const Color success = Color(0xFF2E7D32);
  static const Color warning = Color(0xFFF9A825);
  static const Color error = Color(0xFFC62828);
  static const Color background = Color(0xFFF5F7FA);
  static const Color surface = Colors.white;

  static ThemeData light({double fontScale = 1.0}) {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        brightness: Brightness.light,
        primary: primary,
        surface: surface,
      ),
      scaffoldBackgroundColor: background,
    );

    return base.copyWith(
      textTheme: GoogleFonts.nunitoTextTheme(base.textTheme).apply(
        fontSizeFactor: fontScale,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(88, 64), // botones grandes
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          textStyle: TextStyle(
            fontSize: 20 * fontScale,
            fontWeight: FontWeight.bold,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(88, 64),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          textStyle: TextStyle(
            fontSize: 22 * fontScale,
            fontWeight: FontWeight.bold,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }

  static ThemeData dark({double fontScale = 1.0}) {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        brightness: Brightness.dark,
      ),
    );
    return base.copyWith(
      textTheme: GoogleFonts.nunitoTextTheme(base.textTheme).apply(
        fontSizeFactor: fontScale,
      ),
    );
  }

  /// Tema específico para el modo Usuario (aún más simple y grande)
  static ThemeData userMode({
    Color primaryColor = primary,
    Color backgroundColor = background,
    double fontScale = 1.3,
    bool highContrast = false,
  }) {
    return light(fontScale: fontScale).copyWith(
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: Brightness.light,
        primary: primaryColor,
        surface: highContrast ? Colors.white : backgroundColor,
      ),
      scaffoldBackgroundColor: highContrast ? Colors.white : backgroundColor,
    );
  }
}
