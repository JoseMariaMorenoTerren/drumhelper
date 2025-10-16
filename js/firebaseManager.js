class FirebaseManager {
    constructor() {
        this.db = null;
        this.auth = null;
        this.initialized = false;
        this.user = null;
        this.lastSyncTime = null;
        this.syncEnabled = false;
        
        // Configuración por defecto (será sobrescrita por configuración real)
        this.firebaseConfig = window.drumHelperFirebaseConfig || {
            apiKey: "your-api-key",
            authDomain: "your-project.firebaseapp.com",
            projectId: "your-project-id",
            storageBucket: "your-project.appspot.com",
            messagingSenderId: "your-sender-id",
            appId: "your-app-id"
        };
        
        this.initializeFirebase();
    }
    
    async initializeFirebase() {
        try {
            // Verificar si Firebase está disponible
            if (typeof firebase === 'undefined') {
                console.warn('🔥 Firebase SDK no está disponible');
                return;
            }
            
            // Inicializar Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }
            
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.initialized = true;
            
            // Configurar listener de cambios de autenticación
            this.auth.onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });
            
            console.log('🔥 Firebase inicializado correctamente');
            
            // Cargar configuración de sincronización
            this.loadSyncSettings();
            
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            this.initialized = false;
        }
    }
    
    handleAuthStateChange(user) {
        this.user = user;
        
        if (user) {
            console.log('✅ Usuario autenticado:', user.email);
            console.log('👤 User ID:', user.uid);
            
            // Habilitar sincronización automáticamente cuando el usuario se autentica
            if (!this.syncEnabled) {
                this.enableSync();
            }
            
            // Notificar al SongManager sobre el cambio de autenticación
            if (window.songManager && window.songManager.onAuthStateChanged) {
                window.songManager.onAuthStateChanged(user);
            }
        } else {
            console.log('❌ Usuario no autenticado');
            // Deshabilitar sincronización cuando no hay usuario
            this.disableSync();
            
            // Notificar al SongManager
            if (window.songManager && window.songManager.onAuthStateChanged) {
                window.songManager.onAuthStateChanged(null);
            }
        }
    }
    
    async signInWithEmail(email, password) {
        if (!this.auth) {
            throw new Error('Firebase Auth no inicializado');
        }
        
        try {
            console.log('🔐 Intentando iniciar sesión con:', email);
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            console.log('✅ Inicio de sesión exitoso');
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Error en inicio de sesión:', error);
            return { success: false, error: error.message };
        }
    }
    
    async signUpWithEmail(email, password) {
        if (!this.auth) {
            throw new Error('Firebase Auth no inicializado');
        }
        
        try {
            console.log('📝 Creando cuenta para:', email);
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            console.log('✅ Cuenta creada exitosamente');
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Error creando cuenta:', error);
            return { success: false, error: error.message };
        }
    }
    
    async signOut() {
        if (!this.auth) {
            throw new Error('Firebase Auth no inicializado');
        }
        
        try {
            await this.auth.signOut();
            console.log('👋 Sesión cerrada exitosamente');
            return { success: true };
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            return { success: false, error: error.message };
        }
    }
    
    getCurrentUser() {
        return this.user;
    }
    
    isAuthenticated() {
        return !!this.user;
    }
    
    getUserId() {
        // Retorna el UID único del usuario autenticado de Firebase
        // Esto permite sincronización entre múltiples dispositivos del mismo usuario
        return this.user ? this.user.uid : null;
    }
    
    loadSyncSettings() {
        const syncEnabled = localStorage.getItem('drumhelper-sync-enabled');
        this.syncEnabled = syncEnabled === 'true';
        
        const lastSync = localStorage.getItem('drumhelper-last-sync');
        this.lastSyncTime = lastSync ? new Date(lastSync) : null;
        
        console.log('⚙️ Configuración de sincronización cargada:', {
            enabled: this.syncEnabled,
            lastSync: this.lastSyncTime
        });
    }
    
    saveSyncSettings() {
        localStorage.setItem('drumhelper-sync-enabled', this.syncEnabled.toString());
        if (this.lastSyncTime) {
            localStorage.setItem('drumhelper-last-sync', this.lastSyncTime.toISOString());
        }
    }
    
    enableSync() {
        this.syncEnabled = true;
        this.saveSyncSettings();
        console.log('✅ Sincronización habilitada');
    }
    
    disableSync() {
        this.syncEnabled = false;
        this.saveSyncSettings();
        console.log('❌ Sincronización deshabilitada');
    }
    
    async uploadRepertoires(repertoires) {
        if (!this.initialized || !this.syncEnabled || !this.isAuthenticated()) {
            console.log('⚠️ Firebase no inicializado, sincronización deshabilitada o usuario no autenticado');
            return false;
        }
        
        try {
            const userId = this.getUserId();
            
            // Convertir Map a objeto para almacenamiento
            const repertoiresData = {};
            repertoires.forEach((value, key) => {
                repertoiresData[key] = value;
            });
            
            const dataToUpload = {
                repertoires: repertoiresData,
                lastModified: new Date(),
                version: '1.3.0',
                userId: userId, // UID del usuario autenticado - permite multi-dispositivo
                userEmail: this.user.email
            };
            
            console.log('⬆️ Subiendo repertorios a Firebase para usuario:', this.user.email);
            
            // Usar UID como clave del documento - garantiza que cada usuario tenga sus propios datos
            await this.db.collection('drumhelper-data').doc(userId).set(dataToUpload);
            
            this.lastSyncTime = new Date();
            this.saveSyncSettings();
            
            console.log('✅ Repertorios subidos correctamente a Firebase');
            return true;
            
        } catch (error) {
            console.error('❌ Error subiendo repertorios:', error);
            return false;
        }
    }
    
    async downloadRepertoires() {
        if (!this.initialized || !this.syncEnabled || !this.isAuthenticated()) {
            console.log('⚠️ Firebase no inicializado, sincronización deshabilitada o usuario no autenticado');
            return null;
        }
        
        try {
            const userId = this.getUserId();
            console.log('⬇️ Descargando repertorios desde Firebase para usuario:', this.user.email);
            
            // Buscar documento usando UID del usuario - datos específicos por usuario
            const doc = await this.db.collection('drumhelper-data').doc(userId).get();
            
            if (doc.exists) {
                const data = doc.data();
                
                console.log('✅ Repertorios descargados desde Firebase');
                console.log('📅 Última modificación en servidor:', data.lastModified?.toDate());
                
                // Convertir objeto de vuelta a Map
                const repertoires = new Map();
                if (data.repertoires) {
                    Object.entries(data.repertoires).forEach(([key, value]) => {
                        repertoires.set(key, value);
                    });
                }
                
                this.lastSyncTime = new Date();
                this.saveSyncSettings();
                
                return {
                    repertoires: repertoires,
                    lastModified: data.lastModified?.toDate(),
                    version: data.version
                };
            } else {
                console.log('📭 No hay datos en Firebase para este usuario');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error descargando repertorios:', error);
            return null;
        }
    }
    
    async syncRepertoires(localRepertoires) {
        if (!this.initialized || !this.syncEnabled || !this.isAuthenticated()) {
            return { success: false, message: 'Usuario no autenticado o sincronización no disponible' };
        }
        
        try {
            console.log('🔄 Iniciando sincronización...');
            
            // Descargar datos del servidor
            const serverData = await this.downloadRepertoires();
            
            if (!serverData) {
                // No hay datos en el servidor, subir datos locales
                console.log('📤 Primer sync - subiendo datos locales');
                const success = await this.uploadRepertoires(localRepertoires);
                return { 
                    success: success, 
                    message: success ? 'Datos sincronizados (primera vez)' : 'Error en primera sincronización'
                };
            }
            
            // Comparar fechas de modificación
            const localModified = this.getLocalLastModified();
            const serverModified = serverData.lastModified;
            
            if (!localModified || serverModified > localModified) {
                // Servidor más reciente, descargar
                console.log('⬇️ Servidor más reciente, descargando datos');
                return {
                    success: true,
                    message: 'Datos descargados del servidor',
                    shouldUpdateLocal: true,
                    data: serverData
                };
            } else if (localModified > serverModified) {
                // Local más reciente, subir
                console.log('⬆️ Local más reciente, subiendo datos');
                const success = await this.uploadRepertoires(localRepertoires);
                return {
                    success: success,
                    message: success ? 'Datos subidos al servidor' : 'Error subiendo datos'
                };
            } else {
                // Misma fecha, ya sincronizado
                console.log('✅ Datos ya sincronizados');
                return {
                    success: true,
                    message: 'Datos ya sincronizados'
                };
            }
            
        } catch (error) {
            console.error('❌ Error en sincronización:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }
    
    getLocalLastModified() {
        const lastModified = localStorage.getItem('drumhelper-last-modified');
        return lastModified ? new Date(lastModified) : null;
    }
    
    setLocalLastModified(date = new Date()) {
        localStorage.setItem('drumhelper-last-modified', date.toISOString());
    }
    
    async deleteUserData() {
        if (!this.initialized || !this.isAuthenticated()) {
            return false;
        }
        
        try {
            const userId = this.getUserId();
            console.log('🗑️ Eliminando datos de usuario en Firebase...');
            await this.db.collection('drumhelper-data').doc(userId).delete();
            console.log('✅ Datos eliminados de Firebase');
            return true;
        } catch (error) {
            console.error('❌ Error eliminando datos:', error);
            return false;
        }
    }
    
    getConnectionStatus() {
        return {
            initialized: this.initialized,
            syncEnabled: this.syncEnabled,
            authenticated: this.isAuthenticated(),
            user: this.user ? {
                uid: this.user.uid,
                email: this.user.email
            } : null,
            lastSync: this.lastSyncTime
        };
    }
}

// Exportar para uso global
window.FirebaseManager = FirebaseManager;
