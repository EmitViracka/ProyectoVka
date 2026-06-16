import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './producto.css';

const Producto = ({ onProductosChange }) => {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [editandoId, setEditandoId] = useState(null);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        colores: '',   
        tallas: '',    
        publico: 'Dama',
        temporada: 'Verano',
        stock: 10
    });

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        setCargando(true);
        const data = await api.getProductos();
        setProductos(data);
        if (onProductosChange) onProductosChange(data);
        setCargando(false);
    };

    const mostrarMensaje = (texto, tipo = 'exito') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // CREATE
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.precio) {
            mostrarMensaje('Nombre y precio son obligatorios', 'error');
            return;
        }

        const productoData = {
            nombre: formData.nombre,
            precio: parseFloat(formData.precio),
            colores: formData.colores.split(',').map(c => c.trim()).filter(c => c),
            tallas: formData.tallas.split(',').map(t => t.trim()).filter(t => t),
            publico: formData.publico,
            temporada: formData.temporada,
            stock: parseInt(formData.stock)
        };

        const resultado = await api.crearProducto(productoData);
        if (resultado.mensaje) {
            mostrarMensaje('Producto creado exitosamente');
            setFormData({ nombre: '', precio: '', colores: '', tallas: '', publico: 'Dama', temporada: 'Verano', stock: 10 });
            cargarProductos();
        } else {
            mostrarMensaje('Error al crear', 'error');
        }
    };

    // EDIT
    const handleEdit = (producto) => {
        setEditandoId(producto.id);
        setFormData({
            nombre: producto.nombre,
            precio: producto.precio,
            colores: (producto.colores || []).join(', '),
            tallas: (producto.tallas || []).join(', '),
            publico: producto.publico || 'Dama',
            temporada: producto.temporada || 'Verano',
            stock: producto.stock || 10
        });
    };

    // UPDATE
    const handleUpdate = async (e) => {
        e.preventDefault();
        const productoData = {
            nombre: formData.nombre,
            precio: parseFloat(formData.precio),
            colores: formData.colores.split(',').map(c => c.trim()).filter(c => c),
            tallas: formData.tallas.split(',').map(t => t.trim()).filter(t => t),
            publico: formData.publico,
            temporada: formData.temporada,
            stock: parseInt(formData.stock)
        };

        const resultado = await api.actualizarProducto(editandoId, productoData);
        if (resultado.mensaje) {
            mostrarMensaje('Producto actualizado');
            setEditandoId(null);
            setFormData({ nombre: '', precio: '', colores: '', tallas: '', publico: 'Dama', temporada: 'Verano', stock: 10 });
            cargarProductos();
        } else {
            mostrarMensaje('Error al actualizar', 'error');
        }
    };

    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Eliminar la prenda "${nombre}"?`)) {
            const resultado = await api.eliminarProducto(id);
            if (resultado.mensaje) {
                mostrarMensaje(`Prenda "${nombre}" eliminada`);
                cargarProductos();
            } else {
                mostrarMensaje('Error al eliminar', 'error');
            }
        }
    };

    const handleCancel = () => {
        setEditandoId(null);
        setFormData({ nombre: '', precio: '', colores: '', tallas: '', publico: 'Dama', temporada: 'Verano', stock: 10 });
    };

    if (cargando) return <div className="producto-loading">Cargando productos...</div>;

    return (
        <div className="producto">
            <h2>Administrar Prendas de Ropa</h2>
            {mensaje.texto && (
                <div className={mensaje.tipo === 'error' ? 'mensaje-error' : 'mensaje-exito'}>
                    {mensaje.texto}
                </div>
            )}
            <form onSubmit={editandoId ? handleUpdate : handleCreate} className="producto-form">
                <input type="text" name="nombre" placeholder="Nombre *" value={formData.nombre} onChange={handleChange} required />
                <input type="number" name="precio" placeholder="Precio *" value={formData.precio} onChange={handleChange} required />
                <input type="text" name="colores" placeholder="Colores (rojo, azul, verde)" value={formData.colores} onChange={handleChange} />
                <input type="text" name="tallas" placeholder="Tallas (S, M, L)" value={formData.tallas} onChange={handleChange} />
                <select name="publico" value={formData.publico} onChange={handleChange}>
                    <option value="Niña">Niña</option>
                    <option value="Joven">Joven</option>
                    <option value="Dama">Dama</option>
                </select>
                <select name="temporada" value={formData.temporada} onChange={handleChange}>
                    <option value="Verano">Verano</option>
                    <option value="Invierno">Invierno</option>
                </select>
                <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} />
                {editandoId ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn-actualizar">ACTUALIZAR</button>
                        <button type="button" onClick={handleCancel} className="btn-cancelar">CANCELAR</button>
                    </div>
                ) : (
                    <button type="submit" className="btn-crear">CREAR PRENDA</button>
                )}
            </form>
            <table className="producto-tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>PRENDA</th>
                        <th>PRECIO</th>
                        <th>COLORES</th>
                        <th>TALLAS</th>
                        <th>PÚBLICO</th>
                        <th>TEMPORADA</th>
                        <th>STOCK</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.length === 0 ? (
                        <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No hay productos. ¡Crea uno!</td></tr>
                    ) : (
                        productos.map(p => (
                            <tr key={p.id}>
                                <td>#{p.id}</td>
                                <td><strong>{p.nombre}</strong></td>
                                <td>Bs {p.precio}</td>
                                <td>{(p.colores || []).join(', ')}</td>
                                <td>{(p.tallas || []).join(', ')}</td>
                                <td>{p.publico || 'Dama'}</td>
                                <td>{p.temporada || 'Verano'}</td>
                                <td>{p.stock || 10}</td>
                                <td>
                                    <button className="btn-editar" onClick={() => handleEdit(p)}>EDITAR</button>
                                    <button className="btn-eliminar" onClick={() => handleDelete(p.id, p.nombre)}>ELIMINAR</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Producto;