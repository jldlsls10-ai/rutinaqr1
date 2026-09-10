import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/user/home/home_user_screen.dart';
import 'features/caregiver/dashboard/dashboard_screen.dart';

/// Punto de entrada de la UI.
/// La navegación real se basará en el rol del usuario autenticado.
class RutinaQrApp extends ConsumerWidget {
  const RutinaQrApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // TODO: leer authStateProvider para decidir ruta inicial
    return MaterialApp(
      title: 'RutinaQR',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.light,

      // i18n ES + EN
      locale: const Locale('es'),
      supportedLocales: const [
        Locale('es'),
        Locale('en'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],

      // Rutas básicas (se ampliarán con go_router o auto_route)
      initialRoute: '/login',
      routes: {
        '/login': (_) => const LoginScreen(),
        '/user/home': (_) => const HomeUserScreen(),
        '/caregiver/dashboard': (_) => const DashboardScreen(),
      },
    );
  }
}
