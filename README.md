# Mini Wallet de Identidad

Aplicación móvil de ensayo construida con Expo (React Native) que implementa
un flujo básico de wallet de identidad: onboarding con PIN y biometría,
generación y guardado seguro de claves, lectura de credenciales por QR,
cifrado de datos de identidad y operación offline.

Proyecto de aprendizaje del módulo Expo (Meta 1) aplicado a los flujos de
identidad de Wira.

---

## Requisitos

- Node.js (LTS) y npm
- Android SDK configurado (`ANDROID_HOME`)
- Un emulador Android o un dispositivo físico con depuración USB
- Expo SDK 57

## Cómo correr el proyecto

```bash
# Instalar dependencias
npm install

# Compilar e instalar la development build en Android
# (con un emulador encendido o un dispositivo conectado)
npx expo run:android
```

La primera compilación descarga Gradle y las dependencias nativas, por lo que
puede tardar varios minutos. Las siguientes son mucho más rápidas.

> Nota: este proyecto usa una **development build**, no Expo Go. El directorio
> `android/` es generado por prebuild y no se versiona; la ruta del SDK se
> define localmente en `android/local.properties` (`sdk.dir=...`).

---

## Características

| # | Característica | Estado |
|---|---|:---:|
| 1 | Development build en Android (no Expo Go), generada con prebuild | ✅ |
| 2 | Navegación stack + tabs con flujo protegido (sin sesión no se entra) | ⬜ |
| 3 | Onboarding con PIN y desbloqueo biométrico | ⬜ |
| 4 | Par de claves (ethers) guardado en `expo-secure-store`, con la dirección visible | ⬜ |
| 5 | Lectura de QR con JSON de identidad, validando su formato antes de usarlo | ⬜ |
| 6 | Cifrado y guardado de datos de identidad con PIN; apertura por biometría | ⬜ |
| 7 | Estado offline detectado con NetInfo y operación pendiente reintentada sin duplicarse | ⬜ |
| 8 | Al menos 3 tests con Jest pasando | ⬜ |

---

## Detalle por característica

### 1. Development build en Android con prebuild ✅

La app corre como una **development build** propia en Android, no dentro de
Expo Go. La build se genera con el flujo de prebuild de Expo: `npx expo
run:android` ejecuta `prebuild` por debajo, que crea el proyecto nativo
(`android/`) a partir de la configuración de `app.json`, y luego compila e
instala el APK.

**Cómo probarlo:**
1. Tener el SDK de Android configurado (`ANDROID_HOME`).
2. Con un emulador encendido o un dispositivo conectado, ejecutar
   `npx expo run:android`.
3. La app abre desde su propio ícono y la consola muestra
   `Using development build` (no Expo Go).

**Verificado en:** emulador Pixel 9a (Android 16, API 36).

### 2. Navegación stack + tabs con flujo protegido ⬜
_Pendiente._

### 3. Onboarding con PIN y desbloqueo biométrico ⬜
- **Estado persistente del secure-store:** durante el desarrollo, un PIN de una
  prueba anterior sobrevivió a reinstalaciones parciales de la app, causando
  fallos de validación hasta desinstalar por completo. Es la contracara de que
  el secure-store sea persistente por diseño.

### 4. Par de claves en secure-store ⬜
_Pendiente._

### 5. Lectura de QR con validación de formato ⬜
_Pendiente._

### 6. Cifrado de datos de identidad ⬜
_Pendiente._

### 7. Operación offline con reintento idempotente ⬜
_Pendiente._

### 8. Tests con Jest ⬜
_Pendiente._

---

## Notas de implementación

Decisiones técnicas y aprendizajes durante el desarrollo.

- **Entorno Android (Manjaro/Linux):** el SDK se instaló con Android Studio;
  `ANDROID_HOME` se configuró en `~/.zshrc`. Gradle no heredaba la variable de
  entorno, por lo que la ruta del SDK se fijó también en
  `android/local.properties` (`sdk.dir=...`).
- **Router:** el enrutamiento por archivos de Expo Router vive en `src/app/`.

---

## Tests

```bash
npm test
```