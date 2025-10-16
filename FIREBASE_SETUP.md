# Firebase Setup para Drum Helper

## Configuración de Firebase

Para habilitar la sincronización en la nube, necesitas configurar un proyecto de Firebase:

### 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Añadir proyecto"
3. Nombra tu proyecto (ej: "drumhelper-tu-nombre")
4. Configura las opciones según tus preferencias
5. Crea el proyecto

### 2. Habilitar Firestore

1. En tu proyecto Firebase, ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (temporalmente)
4. Selecciona una ubicación cercana a tus usuarios

### 3. Habilitar Authentication

1. En tu proyecto Firebase, ve a "Authentication"
2. Haz clic en "Comenzar"
3. Ve a la pestaña "Sign-in method"
4. Habilita "Correo electrónico/contraseña"
5. Guarda los cambios

### 4. Configurar reglas de seguridad

Ve a "Firestore Database" > "Reglas" y actualiza con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso a los datos solo al usuario autenticado propietario
    match /drumhelper-data/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Obtener configuración

1. Ve a "Configuración del proyecto" (icono de engranaje)
2. Baja hasta "Tus apps" y haz clic en "Agregar app" > "Web"
3. Registra tu app con un nombre
4. Copia la configuración que aparece

### 6. Actualizar configuración local

Edita el archivo `js/firebaseConfig.js` y reemplaza los valores de ejemplo con tu configuración real:

```javascript
const firebaseConfig = {
    apiKey: "tu-api-key-aqui",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "tu-sender-id",
    appId: "tu-app-id"
};
```

### 7. Desplegar la aplicación

Si usas GitHub Pages o otro servicio de hosting, asegúrate de que el archivo `firebaseConfig.js` esté incluido.

## Características de sincronización

Una vez configurado Firebase:

- ✅ **Autenticación segura**: Login con email y contraseña
- ✅ **Backup automático**: Todos los repertorios se guardan en la nube
- ✅ **Sincronización entre dispositivos**: Accede a tus datos desde cualquier dispositivo con tu cuenta
- ✅ **Resolución de conflictos**: El sistema maneja automáticamente las diferencias entre versiones
- ✅ **Modo offline**: La aplicación funciona sin conexión y sincroniza cuando se reconecta
- ✅ **Datos privados**: Cada usuario solo puede acceder a sus propios datos

## Uso de la sincronización

1. **Crear cuenta**: Haz clic en "Iniciar Sesión" y luego "¿No tienes cuenta? Regístrate"
2. **Iniciar sesión**: Usa tu email y contraseña para acceder a tus datos
3. **Habilitar sync**: Marca la casilla "Habilitar sincronización automática"
4. **Sync manual**: Usa el botón "Sincronizar Ahora" para forzar una sincronización
5. **Ver estado**: Haz clic en "Estado" para ver información de conexión y último sync
6. **Cerrar sesión**: Usa el botón "Cerrar Sesión" cuando termines

## Sincronización Multi-Dispositivo

La gran ventaja del sistema es que puedes acceder a tus repertorios desde cualquier dispositivo:

### Ejemplo de uso típico:
1. **Tablet en ensayos**: Creas y organizas repertorios, añades notas y grabaciones
2. **Móvil en casa**: Inicias sesión con tu cuenta y todos los datos están disponibles
3. **Ordenador**: Los mismos repertorios sincronizados automáticamente
4. **Otro tablet**: Solo inicia sesión y tendrás acceso completo a tu biblioteca

### Cómo funciona:
- **Por usuario, no por dispositivo**: Los datos se asocian a tu email/cuenta, no al dispositivo
- **UID único**: Firebase asigna un identificador único (UID) a cada cuenta de usuario
- **Sincronización automática**: Al iniciar sesión, se descargan automáticamente tus datos
- **Resolución inteligente**: Si modificas en varios dispositivos, el sistema usa la versión más reciente

### Datos que se sincronizan:
- ✅ Todos los repertorios y sus configuraciones
- ✅ Canciones con letras, notas e imágenes
- ✅ Grabaciones de movimientos (playbooks)
- ✅ Configuraciones de visualización por repertorio
- ✅ Duraciones personalizadas de canciones
- ✅ Orden personalizado de canciones

## Solución de problemas

- **Firebase no disponible**: Verifica que el archivo `firebaseConfig.js` esté correctamente configurado
- **Error de permisos**: Revisa las reglas de Firestore y que Authentication esté habilitado
- **Error de conexión**: Verifica tu conexión a internet
- **No puedes sincronizar**: Asegúrate de haber iniciado sesión
- **Error de autenticación**: Verifica tu email y contraseña

## Seguridad

- Los datos se almacenan usando el UID único del usuario autenticado
- Se requiere autenticación con email y contraseña
- Las reglas de Firestore garantizan que cada usuario solo acceda a sus propios datos
- Los datos se cifran en tránsito y en reposo por Firebase
