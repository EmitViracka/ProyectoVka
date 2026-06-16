const API_URL = 'http://localhost:3001/api';

// ============ FUNCIONES AUXILIARES ============
const getToken = () => localStorage.getItem('token');
const setToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

const getUsuario = () => {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
};

const setUsuario = (usuario) => {
    if (usuario) {
        localStorage.setItem('usuario', JSON.stringify(usuario));
    } else {
        localStorage.removeItem('usuario');
    }
};

// ============ API ============
export const api = {
    // ============ PRODUCTOS ============
    
    async getProductos() {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) throw new Error('Error');
            return await response.json();
        } catch (error) {
            console.error(' Error:', error);
            return [];
        }
    },

    async getProducto(id) {
        try {
            const response = await fetch(`${API_URL}/products/${id}`);
            if (!response.ok) throw new Error('Producto no encontrado');
            return await response.json();
        } catch (error) {
            console.error(' Error:', error);
            return null;
        }
    },

    async crearProducto(producto) {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(producto)
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    },

    async actualizarProducto(id, producto) {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(producto)
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    },

    async eliminarProducto(id) {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    },

    // ============ AUTENTICACIÓN ============
    
    // CAPTCHA
    async getCaptcha() {
        try {
            const response = await fetch(`${API_URL}/auth/captcha`, {
                method: 'GET',
                credentials: 'include'
            });
            return await response.text();
        } catch (error) {
            console.error(' Error captcha:', error);
            return '';
        }
    },

    // REGISTRO
    async registrar(usuarioData) {
        try {
            console.log(' Enviando registro:', usuarioData);
            
            const response = await fetch(`${API_URL}/auth/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    nombre: usuarioData.nombre,
                    email: usuarioData.email,
                    password: usuarioData.password,
                    captcha: usuarioData.captcha
                })
            });
            
            const data = await response.json();
            console.log(' Respuesta:', data);
            
            if (data.token) {
                setToken(data.token);
                setUsuario(data.usuario);
            }
            return data;
        } catch (error) {
            console.error(' Error:', error);
            return { error: error.message };
        }
    },

    // LOGIN
    async login(credentials) {
        console.log(" Llamando a login con:", credentials);
    
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',  // ← Debe ser POST, no GET
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            captcha: credentials.captcha
        })
    });
    
    const data = await response.json();
    console.log(" Respuesta del servidor:", data);
    return data;
    },

    // LOGOUT
    async logout() {
        try {
            const token = getToken();
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                credentials: 'include'
            });
            setToken(null);
            setUsuario(null);
        } catch (error) {
            console.error(error);
        }
    },

    // VERIFICAR TOKEN
    async verificarToken() {
        try {
            const token = getToken();
            if (!token) return { valido: false };
            
            const response = await fetch(`${API_URL}/auth/verificar`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            return { valido: false };
        }
    },

    // ============ UTILIDADES ============
    
    isAuthenticated: () => !!getToken(),
    getCurrentUser: () => getUsuario(),
    
    isAdmin: () => {
        const user = getUsuario();
        return user?.rol === 'admin';
    },

    // ============ CATEGORÍAS ============
    
    async getCategorias() {
        try {
            const response = await fetch(`${API_URL}/categorias`);
            return await response.json();
        } catch (error) {
            return [];
        }
    },

    async crearCategoria(categoria) {
        try {
            const response = await fetch(`${API_URL}/categorias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoria)
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    },

    async actualizarCategoria(id, categoria) {
        try {
            const response = await fetch(`${API_URL}/categorias/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoria)
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    },

    async eliminarCategoria(id) {
        try {
            const response = await fetch(`${API_URL}/categorias/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }
};