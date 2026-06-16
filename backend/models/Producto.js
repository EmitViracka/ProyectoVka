import { DataTypes } from 'sequelize';
import sequelize from '../config/bd.js';

const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    colores: {
        type: DataTypes.TEXT,
        get() {
            const raw = this.getDataValue('colores');
            if (!raw) return [];
            // Si ya es un array, devolverlo; si no, parsear JSON
            if (Array.isArray(raw)) return raw;
            try {
                return JSON.parse(raw);
            } catch {
                return [];
            }
        },
        set(val) {
            // Asegurar que se guarda como JSON string
            const coloresArray = Array.isArray(val) ? val : (val ? [val] : []);
            this.setDataValue('colores', JSON.stringify(coloresArray));
        }
    },
    tallas: {
        type: DataTypes.TEXT,
        get() {
            const raw = this.getDataValue('tallas');
            if (!raw) return [];
            if (Array.isArray(raw)) return raw;
            try {
                return JSON.parse(raw);
            } catch {
                return [];
            }
        },
        set(val) {
            const tallasArray = Array.isArray(val) ? val : (val ? [val] : []);
            this.setDataValue('tallas', JSON.stringify(tallasArray));
        }
    },
    publico: {
        type: DataTypes.ENUM('Niña', 'Joven', 'Dama'),
        defaultValue: 'Dama'
    },
    temporada: {
        type: DataTypes.ENUM('Verano', 'Invierno'),
        defaultValue: 'Verano'
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        validate: { min: 0 }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'productos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

export default Producto;