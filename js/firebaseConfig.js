// Configuración de Firebase para Drum Helper
// IMPORTANTE: Reemplaza estos valores con tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD_dywuvEoj981wyNoyZh7s0VTdvsg-eUk",
  authDomain: "drumhelper-a7b8a.firebaseapp.com",
  projectId: "drumhelper-a7b8a",
  storageBucket: "drumhelper-a7b8a.firebasestorage.app",
  messagingSenderId: "423469467977",
  appId: "1:423469467977:web:67bc4c7e6b2232c15ab298",
  measurementId: "G-NWV8CGBYHL"
};

// Actualizar la configuración en FirebaseManager
if (typeof window !== 'undefined' && window.FirebaseManager) {
    // Si FirebaseManager ya está cargado, actualizar su configuración
    if (window.firebaseManagerInstance) {
        window.firebaseManagerInstance.firebaseConfig = firebaseConfig;
    }
} else {
    // Guardar configuración para cuando se cargue FirebaseManager
    window.drumHelperFirebaseConfig = firebaseConfig;
}

console.log('🔧 Configuración de Firebase cargada');
console.log('🔥 Proyecto Firebase: drumhelper-a7b8a');
