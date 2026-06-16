import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { api } from "../services/api";
import PasswordStrengthIndicator from "./passwordStrengthIndicator";
import { validarRequisitosPassword } from "../utils/passwordStrength";
import "./registro.css";
import "./Login.css";

function Registro({ onRegistroSuccess }) {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const [captchaSvg, setCaptchaSvg] = useState("");
    const [captchaText, setCaptchaText] = useState("");
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
        confirmarPassword: ""
    });

    useEffect(() => {
        cargarCaptcha();
    }, []);

    const cargarCaptcha = async () => {
        try {
            const svg = await api.getCaptcha();
            setCaptchaSvg(svg);
            console.log(' CAPTCHA cargado');
        } catch (error) {
            console.error("Error cargando CAPTCHA:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError("");
        setExito("");

        const nombreLimpio = formData.nombre.trim();
        const emailLimpio = formData.email.trim().toLowerCase();
        const passwordLimpia = formData.password.trim();
        const confirmarPasswordLimpia = formData.confirmarPassword.trim();

        console.log('  DATOS DEL REGISTRO:');
        console.log('   Nombre:', nombreLimpio);
        console.log('   Email:', emailLimpio);
        console.log('   Contraseña:', passwordLimpia);
        console.log('   Longitud contraseña:', passwordLimpia.length);
        console.log('   CAPTCHA:', captchaText);

        if (!captchaText) {
            setError(" Debes ingresar el código CAPTCHA");
            setCargando(false);
            return;
        }

        if (passwordLimpia !== confirmarPasswordLimpia) {
            setError(" Las contraseñas no coinciden");
            setCargando(false);
            return;
        }

        if (passwordLimpia.length < 8) {
            setError(" La contraseña debe tener al menos 8 caracteres");
            setCargando(false);
            return;
        }

        const validacion = validarRequisitosPassword(passwordLimpia);
        if (!validacion.isValid) {
            setError(validacion.errors[0]);
            setCargando(false);
            return;
        }

        try {
            const result = await api.registrar({
                nombre: nombreLimpio,
                email: emailLimpio,
                password: passwordLimpia,
                captcha: captchaText
            });

            console.log(" Respuesta del servidor:", result);

            if (result.mensaje) {
                setExito(" Usuario registrado exitosamente. Redirigiendo...");
                setTimeout(() => {
                    if (onRegistroSuccess) {
                        onRegistroSuccess();
                    } else {
                        window.location.href = "/login";
                    }
                }, 2000);
            } else {
                setError(result.error || "Error al registrar");
                cargarCaptcha();
                setCaptchaText("");
            }
        } catch (error) {
            console.error(" Error en registro:", error);
            setError("Error de conexión con el servidor");
            cargarCaptcha();
            setCaptchaText("");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-card registro-card" onSubmit={handleSubmit}>
                <img src="/logotipo.png" alt="Logo" className="login-logo" />
                <h1>Crear Cuenta</h1>
                <p>Regístrate para comprar en nuestra tienda</p>

                {error && <div className="error-message"> {error}</div>}
                {exito && <div className="success-message"> {exito}</div>}

                <div className="input-group">
                    <FaUser />
                    <input 
                        name="nombre" 
                        placeholder="Nombre completo" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                        required 
                        disabled={cargando} 
                    />
                </div>

                <div className="input-group">
                    <FaEnvelope />
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Correo electrónico" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        disabled={cargando} 
                    />
                </div>

                <div className="input-group">
                    <FaLock />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Contraseña" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        disabled={cargando} 
                    />
                </div>

                <PasswordStrengthIndicator password={formData.password} />

                <div className="input-group">
                    <FaLock />
                    <input 
                        type="password" 
                        name="confirmarPassword" 
                        placeholder="Confirmar contraseña" 
                        value={formData.confirmarPassword} 
                        onChange={handleChange} 
                        required 
                        disabled={cargando} 
                    />
                </div>

                <div className="captcha-section">
                    <div 
                        className="captcha-svg" 
                        dangerouslySetInnerHTML={{ __html: captchaSvg }} 
                    />
                    <button 
                        type="button" 
                        className="captcha-refresh" 
                        onClick={cargarCaptcha} 
                        disabled={cargando}
                    >
                         Actualizar
                    </button>
                </div>

                <div className="input-group">
                    <input 
                        type="text" 
                        placeholder="Ingrese el código de la imagen" 
                        value={captchaText} 
                        onChange={(e) => setCaptchaText(e.target.value)} 
                        required 
                        disabled={cargando} 
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn-submit" 
                    disabled={cargando}
                >
                    {cargando ? "Registrando..." : "Registrarse"}
                </button>
            </form>
        </div>
    );
}

export default Registro;