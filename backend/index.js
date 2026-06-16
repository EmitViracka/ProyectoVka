import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import svgCaptcha from 'svg-captcha';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { conectarDB } from './config/bd.js';
import Producto from './models/Producto.js';
import Usuario from './models/Usuario.js';
import LogAcceso from './models/LogAcceso.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_tienda_2024';

// Middlewares
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Sesión (solo una vez)
app.use(session({
    secret: 'mi_secreto_captcha_2026',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 5 * 60 * 1000,
        sameSite: 'lax'
    },
    name: 'sessionId'
}));

await conectarDB();

// ============ CAPTCHA ============
app.get('/api/auth/captcha', (req, res) => {
    const captcha = svgCaptcha.create({
        size: 6,
        noise: 2,
        color: true,
        background: '#f0f0f0',
        width: 150,
        height: 50
    });
    req.session.captcha = captcha.text;
    console.log('CAPTCHA guardado en sesión:', captcha.text);
    res.type('svg');
    res.send(captcha.data);
});

// ============ REGISTRO ============
app.post('/api/auth/registro', async (req, res) => {
    try {
        const { nombre, email, password, captcha } = req.body;

        if (!req.session?.captcha || captcha !== req.session.captcha) {
            return res.status(400).json({ error: 'CAPTCHA incorrecto' });
        }
        delete req.session.captcha;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos' });
        }

        const existe = await Usuario.findOne({ where: { email } });
        if (existe) return res.status(400).json({ error: 'Email ya registrado' });

        // Validar fortaleza (usando función separada)
        const fortaleza = validarFortalezaPassword(password);
        if (fortaleza.nivel === 'Débil') {
            return res.status(400).json({ error: 'La contraseña es demasiado débil' });
        }

        // Crear usuario con contraseña en texto plano. El hook beforeCreate la encriptará.
        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            password,          // texto plano
            password_strength: fortaleza.nivel,
            rol: email === 'admin@tienda.com' ? 'admin' : 'usuario'
        });

        // Verificación inmediata (opcional)
        const test = await bcrypt.compare(password, nuevoUsuario.password);
        console.log(`Registro ok, verificación post: ${test}`);

        const token = jwt.sign(
            { id: nuevoUsuario.id, email, rol: nuevoUsuario.rol },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(201).json({
            mensaje: 'Registrado',
            token,
            usuario: { id: nuevoUsuario.id, nombre, email, rol: nuevoUsuario.rol }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// ============ LOGIN ============
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, captcha } = req.body;

        if (!req.session?.captcha || captcha !== req.session.captcha) {
            return res.status(400).json({ error: 'CAPTCHA incorrecto' });
        }
        delete req.session.captcha;

        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) return res.status(401).json({ error: 'Credenciales inválidas' });

        await LogAcceso.create({
            usuario_id: usuario.id,
            usuario_email: email,
            evento: 'ingreso',
            ip: req.ip,
            browser: req.headers['user-agent']
        });

        const token = jwt.sign(
            { id: usuario.id, email, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, email, rol: usuario.rol }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// ============ LOGOUT ============
app.post('/api/auth/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            await LogAcceso.create({
                usuario_id: decoded.id,
                usuario_email: decoded.email,
                evento: 'salida',
                ip: req.ip,
                browser: req.headers['user-agent']
            });
        }
        res.json({ mensaje: 'Sesión cerrada' });
    } catch (error) {
        res.json({ mensaje: 'Sesión cerrada' });
    }
});

// ============ VERIFICAR TOKEN ============
app.get('/api/auth/verificar', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ valido: false });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valido: true, usuario: decoded });
    } catch {
        res.status(401).json({ valido: false });
    }
});

// ============ RUTAS DE PRODUCTOS (CRUD) ============
app.get('/api/products', async (req, res) => {
    const productos = await Producto.findAll({ where: { activo: true }, order: [['id', 'DESC']] });
    res.json(productos);
});
app.get('/api/products/:id', async (req, res) => {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto || !producto.activo) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
});
app.post('/api/products', async (req, res) => {
    const { nombre, precio, colores, tallas, publico, temporada, stock } = req.body;
    if (!nombre || !precio) return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
    const nuevo = await Producto.create({ nombre, precio: parseFloat(precio), colores: colores || [], tallas: tallas || [], publico: publico || 'Dama', temporada: temporada || 'Verano', stock: stock || 10 });
    res.status(201).json({ mensaje: 'Producto creado', producto: nuevo });
});
app.patch('/api/products/:id', async (req, res) => {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update(req.body);
    res.json({ mensaje: 'Producto actualizado', producto });
});
app.delete('/api/products/:id', async (req, res) => {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update({ activo: false });
    res.json({ mensaje: 'Producto eliminado' });
});

// ============ HEALTH ============
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// ============ FUNCIÓN DE VALIDACIÓN DE FORTALEZA (unificada) ============
function validarFortalezaPassword(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>_-]/.test(password)) score++;
    if (score <= 2) return { nivel: 'Débil', color: '#dc3545' };
    if (score <= 4) return { nivel: 'Intermedia', color: '#ffc107' };
    return { nivel: 'Fuerte', color: '#28a745' };
}

// ============ RUTAS TEMPORALES DE DEPURACIÓN (opcionales, puedes eliminarlas) ============
app.post('/api/auth/check-password', async (req, res) => {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    const valida = await bcrypt.compare(password, usuario.password);
    res.json({ email, esValida: valida });
});
app.post('/api/auth/generate-hash', async (req, res) => {
    const { password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    res.json({ password, hash });
});

app.listen(PORT, () => {
    console.log(`\nServidor corriendo en http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`Productos: http://localhost:${PORT}/api/products`);
    console.log(`CAPTCHA: http://localhost:${PORT}/api/auth/captcha`);
    console.log(`Registro: POST http://localhost:${PORT}/api/auth/registro`);
    console.log(`Login: POST http://localhost:${PORT}/api/auth/login\n`);
});