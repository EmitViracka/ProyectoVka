import { DataTypes } from 'sequelize';
import sequelize from '../config/bd.js';
import bcrypt from 'bcryptjs';

const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    rol: { type: DataTypes.ENUM('admin', 'usuario'), defaultValue: 'usuario' },
    password_strength: { type: DataTypes.STRING(20) }
}, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

Usuario.prototype.validarPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

Usuario.beforeCreate(async (usuario) => {
    if (usuario.password) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
    }
});

export default Usuario;