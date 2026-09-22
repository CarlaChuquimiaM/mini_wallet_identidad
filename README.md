# Mini Wallet de Identidad

Aplicación móvil construida con Expo (React Native) que implementa un flujo
básico de wallet de identidad: onboarding con PIN y biometría, generación y
guardado seguro de claves, lectura y validación de credenciales por QR,
cifrado de datos de identidad, y operación offline con reintento idempotente.

Proyecto de aprendizaje del módulo Expo (Meta 1) aplicado a los flujos de
identidad de Wira.

---

## Requisitos

- Node.js (LTS) y npm
- Android SDK configurado (`ANDROID_HOME`)
- Un dispositivo Android físico (recomendado para biometría) o emulador
- Expo SDK 57

## Cómo correr el proyecto

```bash
npm install
npx expo run:android --device
```

La primera compilación descarga Gradle y dependencias nativas (puede tardar
varios minutos). Las siguientes son más rápidas.

> Este proyecto usa una **development build**, no Expo Go. El directorio
> `android/` es generado por prebuild y no se versiona; la ruta del SDK se
> define localmente en `android/local.properties`.

## Tests

```bash
npm test
```

---

## Características

| # | Característica | Estado |
|---|---|:---:|
| 1 | Development build en Android (no Expo Go), generada con prebuild | ✅ |
| 2 | Navegación stack + tabs con flujo protegido (sin sesión no se entra) | ✅ |
| 3 | Onboarding con PIN y desbloqueo biométrico | ✅ |
| 4 | Par de claves (ethers) en `expo-secure-store`, con la dirección visible | ✅ |
| 5 | Lectura de QR con JSON de identidad, validando su formato antes de usarlo | ✅ |
| 6 | Cifrado y guardado de datos de identidad con PIN; apertura por biometría | ✅ |
| 7 | Estado offline detectado con NetInfo y operación pendiente reintentada sin duplicarse | ✅ |
| 8 | Al menos 3 tests con Jest pasando | ✅ |

---

## Detalle por característica

### 1. Development build en Android con prebuild ✅
La app corre como development build propia (no Expo Go), generada con el flujo
de prebuild: `npx expo run:android` ejecuta prebuild por debajo, que crea el
proyecto nativo (`android/`) desde `app.json`, y luego compila e instala.
**Probado en:** emulador Pixel 9a (Android 16) y dispositivo físico.

### 2. Navegación stack + tabs con flujo protegido ✅
Separa una zona pública (`login`) de una protegida (`(app)/`, con las tabs). Un
contexto de sesión (`SessionContext`) guarda `haySesion`; la protección es por
redirección: sin sesión, el usuario va a `/login`. Se eligió redirección
explícita en lugar de `Stack.Protected` por usar `NativeTabs` (API unstable) y
para mantener el flujo de autenticación explícito.

### 3. Onboarding con PIN y desbloqueo biométrico ✅
Dos métodos de acceso: PIN propio (base) y biometría del sistema (comodidad).
La biometría hace tres comprobaciones (`hasHardwareAsync`, `isEnrolledAsync`,
`authenticateAsync`); la app nunca ve la huella, solo un `success`. El PIN se
guarda **hasheado** (SHA-256) en `expo-secure-store`, nunca en claro.

### 4. Par de claves en secure-store ✅
Genera un par de claves con `ethers`, guarda solo la **clave privada** cifrada
en `expo-secure-store` y muestra la **dirección pública**. La wallet se crea una
vez y persiste entre sesiones. Requiere el polyfill
`react-native-get-random-values` para la aleatoriedad criptográfica.

### 5. Lectura de QR con validación ✅
Lee un QR con `expo-camera` y valida su contenido **antes de usarlo**, en dos
capas: `JSON.parse` (¿es JSON?) y `zod.safeParse` (¿tiene la forma de
credencial?). Un QR que no es JSON, o un JSON sin los campos/tipos correctos, se
rechaza con su mensaje.

### 6. Cifrado con PIN y guardado con biometría ✅
Doble capa sobre los datos de identidad: se cifran con una clave derivada del
PIN (confidencialidad) y se guardan con `requireAuthentication` (el sistema
exige biometría para leerlos, control de acceso). Para acceder se necesita
biometría (que el SO entregue el dato) y PIN (para descifrarlo).

### 7. Offline con reintento idempotente ✅
Detecta la conexión con NetInfo. Las operaciones lanzadas offline quedan en una
cola persistente (AsyncStorage) y se reintentan al reconectar. Cada operación
lleva un **id único**; procesar la cola varias veces no duplica una operación ya
hecha (idempotencia).

### 8. Tests con Jest ✅
Tests unitarios sobre la lógica pura: validación de credencial (car. 5),
reversibilidad del cifrado (car. 6, con mock de `expo-crypto`) e idempotencia de
la cola (car. 7, con mock de `AsyncStorage`).

---

## Notas de implementación

- **Entorno Android (Manjaro):** el SDK se instaló con Android Studio;
  `ANDROID_HOME` se configuró en `~/.zshrc`. Como Gradle no heredaba la variable,
  la ruta del SDK se fijó en `android/local.properties`.
- **Router en `src/app/`:** el enrutamiento por archivos vive en `src/app/`; los
  grupos con paréntesis `(app)` agrupan sin añadir segmento a la URL.
- **Autenticar ≠ tener la clave:** la biometría confirma la identidad pero no
  entrega el PIN, así que no descifra por sí sola; si el usuario entra con huella,
  se le pide el PIN al acceder a datos cifrados.
- **secure-store persiste entre reinstalaciones:** un PIN de prueba sobrevivió a
  reinstalaciones parciales durante el desarrollo (contracara de que sea
  persistente por diseño).

## Límites conocidos (mejoras para producción)

- **PIN sin salt:** el hash del PIN y la clave de cifrado se derivan sin salt ni
  KDF con iteraciones (PBKDF2/Argon2), vulnerables a rainbow tables para PINs
  comunes. En producción: salt único + KDF + límite de intentos.
- **Cifrado didáctico:** el cifrado de la característica 6 es demostrativo (XOR con
  clave derivada); en producción se usaría AES-GCM (que verifica integridad).
- **Sin recuperación de PIN:** olvidar el PIN implica perder acceso a los datos
  cifrados; en producción se resolvería con recuperación social (guardianes).
- **Sincronización simulada:** la operación de red de la característica 7 se simula
  con un registro local, al no haber backend; el patrón (encolar, reintentar,
  idempotencia) es el real.

---

## Estructura del proyecto

```
src/
  app/                    # rutas (expo-router)
    _layout.tsx           # raíz: SessionProvider + Stack
    index.tsx             # semáforo: redirige según sesión
    login.tsx             # PIN + biometría
    (app)/                # zona protegida
      _layout.tsx         # guard + tabs
      home.tsx            # dirección wallet + ver datos
      escanear.tsx        # QR + validación + guardar cifrado
      sync.tsx            # offline + cola idempotente
  context/
    SessionContext.tsx    # estado de sesión + PIN en memoria
  lib/
    biometria.ts          # autenticación biométrica
    pin.ts                # hash y verificación del PIN
    wallet.ts             # par de claves ethers
    credencial.ts         # esquema zod + validación
    cifrado.ts            # cifrar/descifrar con PIN
    almacenIdentidad.ts   # guardado cifrado + biometría
    colaSync.ts           # cola idempotente offline
  __test__                # archivo de los test del proyecto
```