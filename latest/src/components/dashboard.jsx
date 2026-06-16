import React, { useState } from 'react';
import ProductoManager from './producto';
import EstadisticasChart from './EstadisticasChart';
import Topbar from './topbar';
import Footers from './footers';
import pdfService from '../services/pdfService';
import { api } from '../services/api';
import './Dashboard.css';

function Dashboard({ usuario, setProductos, productos }) {
    const [seccionActiva, setSeccionActiva] = useState('crud');
    const isAdmin = usuario?.rol === 'admin';

    const generarPDF = () => {
        if (productos.length > 0) {
            pdfService.generarReporteProductos(productos);
            alert('Reporte PDF generado correctamente');
        } else {
            alert('No hay productos para generar el reporte');
        }
    };

    const handleLogout = async () => {
        await api.logout();
        window.location.href = '/';
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-sidebar">
                <div className="dashboard-sidebar-title">Mi Panel</div>
                {isAdmin && (
                    <button
                        className={`dashboard-menu-item ${seccionActiva === 'crud' ? 'active' : ''}`}
                        onClick={() => setSeccionActiva('crud')}
                    >
                        Administrar Productos
                    </button>
                )}
                <button
                    className={`dashboard-menu-item ${seccionActiva === 'estadisticas' ? 'active' : ''}`}
                    onClick={() => setSeccionActiva('estadisticas')}
                >
                    Estadísticas
                </button>
                <button
                    className={`dashboard-menu-item ${seccionActiva === 'pdf' ? 'active' : ''}`}
                    onClick={generarPDF}
                >
                    Generar Reporte PDF
                </button>
                <button className="dashboard-logout-btn" onClick={handleLogout}>
                    Cerrar Sesión
                </button>
            </div>
            <div className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-welcome">
                        Bienvenido, <span className="dashboard-user-name">{usuario?.nombre}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        Rol: {usuario?.rol === 'admin' ? 'Administrador' : 'Cliente'}
                    </div>
                </div>
                <div className="dashboard-content-card">
                    {seccionActiva === 'crud' && isAdmin && <ProductoManager onProductosChange={setProductos} />}
                    {seccionActiva === 'crud' && !isAdmin && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p>No tienes permisos de administrador.</p>
                            <p>Contacta al administrador para acceder al CRUD.</p>
                        </div>
                    )}
                    {seccionActiva === 'estadisticas' && <EstadisticasChart />}
                    {seccionActiva === 'pdf' && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '1rem' }}>Generar Reporte PDF</h2>
                            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                                Genera un reporte completo de todos los productos en formato PDF.
                            </p>
                            <button
                                onClick={generarPDF}
                                style={{
                                    backgroundColor: '#5d056e',
                                    color: 'white',
                                    padding: '12px 30px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                Generar Reporte PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;