import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { api } from "../services/api";
import "./estadisticasChart.css";

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function EstadisticasChart() {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            setCargando(true);
            const productos = await api.getProductos();
            
            if (!productos || productos.length === 0) {
                setError("No hay productos para mostrar estadísticas");
                return;
            }
            
            // Contar por público
            const publicos = ["Niña", "Joven", "Dama"];
            const porPublico = publicos.map(p => ({
                nombre: p,
                cantidad: productos.filter(prod => prod.publico === p).length
            }));

            // Contar por temporada
            const temporadas = ["Verano", "Invierno"];
            const porTemporada = temporadas.map(t => ({
                nombre: t,
                cantidad: productos.filter(prod => prod.temporada === t).length
            }));

            // Estadísticas generales
            const totalProductos = productos.length;
            const totalStock = productos.reduce((sum, p) => sum + (p.stock || 0), 0);
            const valorTotal = productos.reduce((sum, p) => sum + ((p.precio || 0) * (p.stock || 0)), 0);

            setDatos({ porPublico, porTemporada, totalProductos, totalStock, valorTotal });
        } catch (error) {
            console.error("Error al cargar estadísticas:", error);
            setError("Error al cargar las estadísticas");
        } finally {
            setCargando(false);
        }
    };

    // Configuración del gráfico por público
    const chartDataPublico = {
        labels: datos?.porPublico.map(d => d.nombre) || [],
        datasets: [{
            label: 'Cantidad de Productos',
            data: datos?.porPublico.map(d => d.cantidad) || [],
            backgroundColor: ['rgba(112, 161, 191, 0.7)', 'rgba(74, 124, 156, 0.7)', 'rgba(41, 69, 87, 0.7)'],
            borderColor: ['rgba(112, 161, 191, 1)', 'rgba(74, 124, 156, 1)', 'rgba(41, 69, 87, 1)'],
            borderWidth: 1,
            borderRadius: 8
        }]
    };

    // Configuración del gráfico por temporada
    const chartDataTemporada = {
        labels: datos?.porTemporada.map(d => d.nombre) || [],
        datasets: [{
            label: 'Cantidad de Productos',
            data: datos?.porTemporada.map(d => d.cantidad) || [],
            backgroundColor: ['rgba(110, 7, 151, 0.7)', 'rgba(23, 162, 184, 0.7)'],
            borderColor: ['rgba(110, 7, 151, 0.7)', 'rgba(23, 162, 184, 1)'],
            borderWidth: 1,
            borderRadius: 8
        }]
    };

    // Opciones comunes para los gráficos
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { font: { size: 12 } }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `Productos: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, precision: 0 },
                title: { display: true, text: 'Cantidad de Productos', font: { size: 12 } }
            },
            x: {
                title: { display: true, text: 'Categorías', font: { size: 12 } }
            }
        }
    };

    if (cargando) {
        return <div className="estadisticas-loading">Cargando estadísticas...</div>;
    }

    if (error) {
        return <div className="estadisticas-error">{error}</div>;
    }

    return (
        <div className="estadisticas-container">
            {/* Tarjetas de resumen */}
            <div className="estadisticas-grid">
                <div className="estadisticas-card">
                    <p className="estadisticas-number">{datos?.totalProductos || 0}</p>
                    <p className="estadisticas-label">Total Productos</p>
                </div>
                <div className="estadisticas-card">
                    <p className="estadisticas-number">{datos?.totalStock || 0}</p>
                    <p className="estadisticas-label">Stock Total</p>
                </div>
                <div className="estadisticas-card">
                    <p className="estadisticas-number">Bs {datos?.valorTotal?.toFixed(2) || '0.00'}</p>
                    <p className="estadisticas-label">Valor Inventario</p>
                </div>
            </div>

            {/* Gráfico por Público */}
            <div className="estadisticas-chart-container">
                <h3 className="estadisticas-chart-title">Productos por Público</h3>
                <Bar data={chartDataPublico} options={chartOptions} />
            </div>

            {/* Gráfico por Temporada */}
            <div className="estadisticas-chart-container">
                <h3 className="estadisticas-chart-title">Productos por Temporada</h3>
                <Bar data={chartDataTemporada} options={chartOptions} />
            </div>
        </div>
    );
}

export default EstadisticasChart;