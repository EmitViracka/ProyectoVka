import React, { useState, useEffect } from 'react';
import Topbar from './components/topbar';
import Sidebar from './components/sidebar';
import ProductGrid from './components/productGrid';
import Producto from './components/producto';
import EstadisticasChart from './components/estadisticasChart';
import Footers from './components/footers';
import Login from './components/login';
import Registro from './components/registro';
import pdfService from './services/pdfService';
import { api } from './services/api';
import './App.css';

function App() {
    const [carrito, setCarrito] = useState([]);
    const [productos, setProductos] = useState([]);
    const [paginaActual, setPaginaActual] = useState('tienda');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [mostrarAdmin, setMostrarAdmin] = useState(false);
    const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);

    useEffect(() => {
        if (api.isAuthenticated()) {
            setIsLoggedIn(true);
            setUsuario(api.getCurrentUser());
        }
        setCargando(false);
    }, []);

    const addToCart = (product) => {
        setCarrito([...carrito, { ...product, cartId: Date.now() }]);
        alert(`${product.nombre} agregado al carrito`);
    };

    const generarPDF = () => {
        if (productos.length > 0) pdfService.generarReporteProductos(productos);
        else alert('No hay productos');
    };

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLoginSuccess = (user) => {
        setIsLoggedIn(true);
        setUsuario(user);
        setPaginaActual('tienda');
    };

    const handleLoginClick = () => setPaginaActual('login');
    const handleLogout = async () => {
        await api.logout();
        setIsLoggedIn(false);
        setUsuario(null);
        setPaginaActual('tienda');
    };
    const isAdmin = usuario?.rol === 'admin';

    const styles = {
        modalOverlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        },
        modalContent: {
            backgroundColor: 'white', borderRadius: '16px', maxWidth: '95%',
            maxHeight: '90vh', overflowY: 'auto', padding: '20px', position: 'relative',top: '50%',                   // ← agrega esto
            transform: 'translateY(-50%)'
        },
        modalHeader: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #eee'
        },
        modalTitle: { fontSize: '1.5rem', margin: 0 },
        closeBtn: {
            backgroundColor: '#5d056e', color: 'white', border: 'none',
            borderRadius: '5px', padding: '8px 16px', cursor: 'pointer'
        },
        mainContainer: {
            maxWidth: '1200px', margin: '2rem auto', padding: '0 0.5rem',
            display: 'flex', gap: '1.5rem', alignItems: 'flex-start'
        },
        sidebar: { width: '250px', flexShrink: 0, position: 'sticky', top: '1rem' },
        mainContent: { flex: 1, minWidth: 0 },
        pageTitle: { marginBottom: '1.5rem', color: '#111', fontSize: '1.8rem' },
        serviceBox: {
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '1rem'
        },
        serviceItem: {
            flex: 1,
            minWidth: '200px',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }
    };

    if (cargando) return <div className="loading">Cargando...</div>;

    // Página de Login
    if (paginaActual === 'login') {
        return (
            <>
                <Topbar
                    onRegistroClick={() => setPaginaActual('registro')}
                    onLoginClick={handleLoginClick}
                    onCarritoClick={() => alert(`Carrito: ${carrito.length}`)}
                    onPdfClick={generarPDF}
                    carritoCount={carrito.length}
                    isLoggedIn={isLoggedIn}
                    usuario={usuario}
                    onLogout={handleLogout}
                />
                <Login onLoginSuccess={handleLoginSuccess} />
            </>
        );
    }

    // Página de Registro
    if (paginaActual === 'registro') {
        return (
            <>
                <Topbar
                    onRegistroClick={() => setPaginaActual('registro')}
                    onLoginClick={handleLoginClick}
                    onCarritoClick={() => alert(`Carrito: ${carrito.length}`)}
                    onPdfClick={generarPDF}
                    carritoCount={carrito.length}
                    isLoggedIn={isLoggedIn}
                    usuario={usuario}
                    onLogout={handleLogout}
                />
                <Registro onRegistroSuccess={() => setPaginaActual('login')} />
            </>
        );
    }

    // Página principal (Tienda)
    return (
        <>
            <Topbar
                onRegistroClick={() => setPaginaActual('registro')}
                onLoginClick={handleLoginClick}
                onCarritoClick={() => alert(`Carrito: ${carrito.length} productos`)}
                onPdfClick={generarPDF}
                carritoCount={carrito.length}
                isLoggedIn={isLoggedIn}
                usuario={usuario}
                onLogout={handleLogout}
            />

            {/* Menú principal */}
            <div className="menu-principal">
                <div className="menu-container">
                    <button className="menu-link" onClick={() => scrollToSection('ofertas')}>Ofertas del día</button>
                    <button className="menu-link" onClick={() => scrollToSection('servicio')}>Servicio al Cliente</button>
                    <button className="menu-link" onClick={() => scrollToSection('contacto')}>Contactanos</button>
                    <button className="menu-btn" onClick={generarPDF}>Reporte PDF</button>
                    <button className="menu-btn" onClick={() => setMostrarEstadisticas(true)}>Estadísticas</button>
                    {isAdmin && (
                        <button className="menu-btn" onClick={() => setMostrarAdmin(true)}>Productos</button>
                    )}
                </div>
            </div>

            <div style={styles.mainContainer}>
                <aside style={styles.sidebar}>
                    <Sidebar />
                </aside>
                <main style={styles.mainContent}>
                    <h3 style={styles.pageTitle}>Renueva tu estilo - Ropa para mujer</h3>
                    <ProductGrid addToCart={addToCart} onProductosCargados={setProductos} />

                </main>
            </div>

            <Footers />

            {/* MODAL CRUD */}
            {mostrarAdmin && (
                <div style={styles.modalOverlay} onClick={() => setMostrarAdmin(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Administrar Productos</h2>
                            <button style={styles.closeBtn} onClick={() => setMostrarAdmin(false)}>Cerrar</button>
                        </div>
                        <Producto onProductosChange={setProductos} />
                    </div>
                </div>
            )}

            {/* MODAL ESTADÍSTICAS */}
            {mostrarEstadisticas && (
                <div style={styles.modalOverlay} onClick={() => setMostrarEstadisticas(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Estadísticas de la Tienda</h2>
                            <button style={styles.closeBtn} onClick={() => setMostrarEstadisticas(false)}>Cerrar</button>
                        </div>
                        <EstadisticasChart />
                    </div>
                </div>
            )}
            
        </>
    );
}

export default App;