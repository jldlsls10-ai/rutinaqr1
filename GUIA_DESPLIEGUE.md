# RutinaQR – Guía de dónde subir los archivos y cómo publicar la app

Esta guía te indica **exactamente** en qué plataforma subir cada parte del proyecto.

---

## 1. Código fuente (control de versiones)

**Sube aquí todo el proyecto** (carpeta `RutinaQR/` + los `.docx` y el `.sql`):

| Plataforma | Uso recomendado | Enlace |
|------------|-----------------|--------|
| **GitHub** (recomendado) | Repositorio privado o público, Issues, Actions (CI/CD) | https://github.com |
| GitLab | Alternativa completa | https://gitlab.com |
| Bitbucket | Si ya usas Atlassian | https://bitbucket.org |

### Pasos rápidos con GitHub
```bash
cd RutinaQR
git init
git add .
git commit -m "Initial commit - RutinaQR v1.0 base"
# Crea un repo vacío en GitHub y luego:
git remote add origin https://github.com/TU_USUARIO/rutinaqr.git
git branch -M main
git push -u origin main
```

---

## 2. Base de datos (PostgreSQL)

Necesitas un PostgreSQL gestionado. Opciones fáciles y baratas:

| Plataforma | Ventaja | Enlace |
|------------|---------|--------|
| **Neon** | Serverless, free tier generoso, muy fácil | https://neon.tech |
| **Railway** | Postgres + backend en el mismo sitio | https://railway.app |
| **Supabase** | Solo usamos el Postgres (la lógica es tuya) | https://supabase.com |
| **Render** | Free tier disponible | https://render.com |
| DigitalOcean Managed DB | Más robusto para producción | https://digitalocean.com |

1. Crea una base de datos.
2. Copia la connection string.
3. Ejecuta el archivo `RutinaQR_schema.sql` (desde la consola SQL del proveedor o con `psql`).

---

## 3. Backend (API NestJS)

Sube la carpeta `backend/` a una de estas plataformas:

| Plataforma | Dificultad | Notas |
|------------|------------|-------|
| **Railway** | Muy fácil | Conecta el repo de GitHub, detecta Node, añade variables de entorno |
| **Render** | Fácil | Web Service + Postgres |
| **Fly.io** | Media | Buen rendimiento, global |
| **DigitalOcean App Platform** | Media | Escalable |
| VPS (DigitalOcean Droplet, Hetzner, Contabo) | Manual | Más control, más trabajo |

### Variables de entorno que debes configurar
```
NODE_ENV=production
PORT=3000
DB_HOST=...
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=rutinaqr
JWT_ACCESS_SECRET=  (mínimo 32 caracteres aleatorios)
JWT_REFRESH_SECRET= (otro secreto diferente)
QR_HMAC_SECRET=     (otro secreto diferente)
CORS_ORIGIN=https://tu-dominio.com
```

### Comando de arranque típico
```
npm install
npm run build
npm run start:prod
```

---

## 4. Aplicación móvil (Flutter → Android + iOS)

### Desarrollo y pruebas
- En tu ordenador con **Flutter SDK** instalado:
  ```bash
  cd mobile
  flutter pub get
  flutter run          # dispositivo o emulador
  ```
- No necesitas subir el código a ninguna tienda todavía.

### Publicación en tiendas

| Tienda | Qué necesitas | Coste aproximado |
|--------|---------------|------------------|
| **Google Play** | Cuenta de desarrollador de Google | 25 USD (pago único) |
| **App Store (Apple)** | Cuenta Apple Developer | 99 USD / año |

1. Generas el **APK/AAB** (Android) y el **IPA** (iOS) desde Flutter:
   ```bash
   flutter build appbundle   # Android
   flutter build ipa         # iOS (necesitas Mac + Xcode)
   ```
2. Subes el AAB a **Google Play Console**: https://play.google.com/console
3. Subes el IPA a **App Store Connect**: https://appstoreconnect.apple.com

> **Nota iOS**: Necesitas un Mac (o un servicio de CI como Codemagic / GitHub Actions con runners macOS) para firmar y subir la app.

### Servicios de CI/CD recomendados para móviles
- **Codemagic** → especializado en Flutter
- **GitHub Actions** + runners
- **Bitrise**
- **Fastlane** (automatización de subida a tiendas)

---

## 5. Resumen práctico – orden recomendado

| Paso | Qué hacer | Dónde |
|------|-----------|-------|
| 1 | Subir código | **GitHub** (repo privado) |
| 2 | Crear base de datos | **Neon** o **Railway** |
| 3 | Ejecutar `RutinaQR_schema.sql` | Consola SQL del proveedor |
| 4 | Desplegar backend | **Railway** o **Render** (conectado al repo) |
| 5 | Probar API | Postman / Insomnia / navegador |
| 6 | Desarrollar y probar app | Tu PC con Flutter + emulador/dispositivo |
| 7 | Publicar Android | Google Play Console |
| 8 | Publicar iOS | App Store Connect (requiere Mac) |

---

## 6. Costes aproximados de arranque (2026)

| Concepto | Coste |
|----------|-------|
| GitHub | Gratis (privado) |
| Neon / Railway free tier | 0 € |
| Backend + DB pequeño | 0–15 €/mes |
| Google Play | 25 USD (una vez) |
| Apple Developer | 99 USD/año |
| Dominio (opcional) | 10–15 €/año |

Puedes empezar **casi gratis** en desarrollo y solo pagar cuando quieras publicar en las tiendas.

---

## 7. Seguridad importante antes de producción

- Cambia **todos** los secretos del `.env` (JWT, QR_HMAC, contraseñas de BD).
- Activa HTTPS (la mayoría de plataformas lo dan automáticamente).
- No subas el archivo `.env` a GitHub (ya está en `.gitignore` conceptualmente; no lo incluyas).
- Revisa que el CORS solo acepte los orígenes de tu app.

---

¿Necesitas que te prepare también los archivos de configuración para Railway/Render o el workflow de GitHub Actions?
