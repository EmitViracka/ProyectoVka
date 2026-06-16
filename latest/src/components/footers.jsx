import React from 'react';
import './footers.css';

const Footers = () => {
    return (
        <>
            <footer id="ofertas" className="footer-ofertas">
                <div className="footer-content">
                    <h2>Ofertas del día</h2>
                    <p>Lo sentimos, por el momento no tenemos ofertas disponibles</p>
                    <img src="/iconotriste.png" alt="Cara triste" className="icono-triste" />
                </div>
            </footer>
            <footer id="servicio" className="footer-servicio">
                <div className="footer-content">
                    <h2>Servicio al Cliente</h2>
                    <p>Entrega, pedido o devolución</p>
                    <p>Pagos: Tarjeta, QR</p>
                    <p>Ayuda para iniciar sesión</p>
                </div>
            </footer>
            <footer id="contacto" className="footer-contacto">
                <div className="footer-content">
                    <h2>Contactos</h2>
                    <p>Teléfono: +591 78759093</p>
                    <p>Redes sociales: CreateYourOutfit</p>
                    <p>Email: createyouroutfit@gmail.com</p>
                </div>
            </footer>
        </>
    );
};

export default Footers;