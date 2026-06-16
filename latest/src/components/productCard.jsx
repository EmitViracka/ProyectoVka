import React from 'react';
import './productCard.css';

const ProductCard = ({ product, addToCart }) => {
    if (!product) {
        return <div className="product-card error">Producto no disponible</div>;
    }

    const precio = product.precio || 0;
    const nombre = product.nombre || 'Producto sin nombre';
    const colores = Array.isArray(product.colores) ? product.colores : [];
    const tallas = Array.isArray(product.tallas) ? product.tallas : [];

    return (
        <div className="product-card">
            <div className="product-info">
                <h3 className="product-title">{nombre}</h3>
                <div className="precio-container">
                    <p className="product-price">Bs {precio}</p>
                </div>
                <div className="product-colors">
                    {colores.length > 0 ? (
                        colores.map((color, i) => (
                            <span 
                                key={i} 
                                className="color-dot" 
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))
                    ) : (
                        <span className="no-colors">Sin colores</span>
                    )}
                </div>
                <p className="product-sizes">
                    Tallas: {tallas.length > 0 ? tallas.join(', ') : 'No disponible'}
                </p>
                <button className="add-to-cart" onClick={() => addToCart(product)}>
                    Agregar al carrito
                </button>
            </div>
        </div>
    );
};

export default ProductCard;