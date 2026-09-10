# RutinaQR

Aplicación móvil multiplataforma (Android + iOS) para personas con dificultades de aprendizaje.  
Ayuda a seguir rutinas diarias mediante **códigos QR físicos** y alarmas obligatorias.

## Estructura del repositorio

```
RutinaQR/
├── backend/          # API NestJS + PostgreSQL + WebSockets
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── links/          # multi-cuidador ↔ multi-usuario
│   │   ├── routines/
│   │   ├── activities/     # + generación y validación de QR firmados
│   │   ├── completions/
│   │   ├── preferences/
│   │   ├── realtime/       # Socket.IO
│   │   └── common/         # entidades TypeORM + QrService
│   ├── package.json
│   └── .env.example
│
├── mobile/           # App Flutter
│   ├── lib/
│   │   ├── core/           # theme, network, storage…
│   │   ├── models/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── caregiver/
│   │   │   └── user/       # Home · Alarm · Scanner · Success
│   │   ├── services/
│   │   └── shared/
│   └── pubspec.yaml
│
└── (en /artifacts)
    ├── RutinaQR_schema.sql
    ├── RutinaQR_Especificacion_Requisitos_v1.0.docx
    └── RutinaQR_Documentacion_Tecnica_Completa_v1.0.docx
```

## Características principales

- **Modo Usuario**: interfaz extremadamente simple, alarmas que solo se desactivan al escanear el QR correcto.
- **Modo Cuidador**: gestión de rutinas, generación/impresión de QR, notificaciones en tiempo real.
- **Multi-cuidador y multi-usuario** desde el inicio (relación many-to-many).
- **Backend propio** (NestJS + PostgreSQL).
- **Idiomas**: Español + Inglés.
- QR firmados con HMAC-SHA256 para evitar falsificación.

## Cómo empezar

### 1. Base de datos
```bash
psql -U postgres -c "CREATE USER rutinaqr WITH PASSWORD 'change_me';"
psql -U postgres -c "CREATE DATABASE rutinaqr OWNER rutinaqr;"
psql -U rutinaqr -d rutinaqr -f ../RutinaQR_schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# editar secretos
npm install
npm run start:dev
```

### 3. App Flutter
```bash
cd mobile
flutter pub get
flutter run
```

## Flujos críticos implementados (código base)

| Flujo | Estado |
|-------|--------|
| Auth cuidador (registro/login JWT) | ✅ Base |
| Vinculación multi-usuario (invite/accept) | ✅ Base |
| CRUD rutinas + actividades | ✅ Base |
| Generación de QR firmados + imagen PNG | ✅ |
| Validación de escaneo QR | ✅ |
| Pantallas Modo Usuario (Home / Scanner / Success / Alarm) | ✅ UI completa |
| Dashboard cuidador (multi-usuario) | ✅ Stub visual |
| Alarmas prioritarias (flutter_local_notifications + Full-Screen Intent) | ✅ Servicio base |
| Generación PDF de QR para imprimir | ✅ QrPdfService |
| Carga de rutina del día + programación de alarmas | ✅ TodayRoutineService |
| WebSocket tiempo real | ✅ Gateway base |
| Offline-first (Drift) | 🔲 Por completar |
| Conexión completa Flutter ↔ API en todas las pantallas | 🔲 Parcial |

## Dónde subir los archivos

Consulta la guía completa: **[GUIA_DESPLIEGUE.md](GUIA_DESPLIEGUE.md)**

Resumen rápido:
- **Código** → GitHub (repo privado)
- **Base de datos** → Neon o Railway (PostgreSQL)
- **Backend** → Railway / Render / Fly.io
- **App Android** → Google Play Console
- **App iOS** → App Store Connect (requiere Mac)

## Próximos pasos de desarrollo

1. Integrar Drift para caché offline de la rutina del día.
2. Conectar todas las pantallas Flutter a la API real.
3. Probar alarmas en dispositivos físicos (especialmente Full-Screen Intent en Android).
4. Añadir generación de PDF desde el dashboard del cuidador.
5. Pruebas de usabilidad con usuarios reales.

---

**Documentación completa**: ver los archivos `.docx`, el esquema SQL y `GUIA_DESPLIEGUE.md`.
