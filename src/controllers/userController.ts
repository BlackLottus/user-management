import { connectDB } from '../database/db.js'; 
import { User } from '../models/user.js'; 
import bcrypt from 'bcryptjs';

var CONSULTAS = {
    INSERT : `INSERT OR IGNORE INTO users (nombre, apellido, email, dni, nick, password, rol, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    SELECT_BY_EMAIL : `SELECT * FROM users WHERE email = ?`,
    SELECT_BY_ID : `SELECT * FROM users WHERE id = ?`,
    SELECT_ALL : `SELECT * FROM users`,
    UPDATE : `UPDATE users SET nombre = ?, apellido = ?, email = ?, dni = ?, nick = ?, password = ?, rol = ?, fecha_creacion = ? WHERE id = ?`,
    DELETE : `DELETE FROM users WHERE id = ?`
}

/**
 * Crear un nuevo usuario en la base de datos de la aplicación.
 * @param user El usuario que deseas registrar.
 */
export const createUser = async (user: User): Promise<void> => {
    const db = await connectDB();
    
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const fechaActual = new Date();
    const fecha = `${fechaActual.getDate()}/${fechaActual.getMonth() + 1}/${fechaActual.getFullYear()} ${fechaActual.getHours()}:${fechaActual.getMinutes()}:${fechaActual.getSeconds()}`;
    
    const existentUser = await db.get<User>(CONSULTAS.SELECT_BY_EMAIL, [user.email]);
    if(existentUser?.email == user.email){
        console.log(`LOG_Error: Ya existe un usuario registrado en nuestra base de datos con ese email.`);
        return;
    }

    if (!user.password || user.password.trim() === '') {
        console.log(`LOG_Error: Se necesita especificar una contraseña.`);
        return;
    }
    const rolesPermitidos = ['admin', 'propietario', 'usuario'];

    if (!rolesPermitidos.includes(user.rol)) {
        console.log(`LOG_Error: Rol inválido: ${user.rol}. Debe ser uno de los siguientes: ${rolesPermitidos.join(', ')}`);
        return;
    }

    // Roles disponibles ['admin', 'propietario', 'usuario'];
    await db.run(CONSULTAS.INSERT, [user.nombre, user.apellido, user.email, user.dni, user.nick, hashedPassword, user.rol, fecha]);
};


/**
 * Loguearse en la aplicación / Acceder para obtener un token.
 * @param email El email del usuario para autenticar la solicitud.
 * @param passsword La contraseña del usuario para autenticar la solicitud.
 * @returns Devuelve al usuario User si es correcto; de lo contrario, null.
 */
export const login = async (email: string, password: string): Promise<User | null> => {
    const db = await connectDB();
    const user = await db.get<User>(CONSULTAS.SELECT_BY_EMAIL, [email]);

    if (!user) {
        return null; // Usuario no encontrado
    } 
    
    // Comparar la contraseña ingresada con la almacenada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)  {
        return null; // Contraseña incorrecta
    }

    // Genera el token usando el ID y el email del usuario
    user.token = generateToken({ id: user.id, email: user.email });

    return user; // Devuelve el token y los datos del usuario
};

/**
 * Obtiene todos los usuarios si el token es válido.
 * @param token El token JWT para autenticar la solicitud.
 * @returns Un arreglo de usuarios si el token es válido; de lo contrario, Error.
 */
export const listUsers = async (token: string): Promise<User[] | void> => {
    const db = await connectDB();

    const decoded = verifyToken(token);
    if (!decoded) {
        console.log("LOG_Error: Token inválido");
        return;
    }
    
    return await db.all<User[]>(CONSULTAS.SELECT_ALL);
};


/**
 * Actualiza los datos del usuario actual.
 * @param User El usuario atenticado en la aplicación y el cual quiere actualizar sus datos.
 * @param newUser El nuevo usuario que dispone de los datos de usuario que desean ser actualizados.
 */
export const updateUser = async (user: User, newUser: Partial<User>): Promise<void> => {
    const db = await connectDB();

    const decoded = verifyToken(user.token);
    if (!decoded) {
        console.log('LOG_Error: Token inválido');
    }

    if(newUser.password){
        const hashedPassword = await bcrypt.hash(newUser.password, 10);
        await db.run(CONSULTAS.UPDATE,[newUser.nombre, newUser.apellido, newUser.email, newUser.dni, 
            newUser.nick, hashedPassword, newUser.rol, newUser.fecha_creacion, user.id]);
    }else await db.run(CONSULTAS.UPDATE,[newUser.nombre, newUser.apellido, newUser.email, newUser.dni, 
        newUser.nick, newUser.password, newUser.rol, newUser.fecha_creacion, user.id]);
};

/**
 * Elimina al usuario actual de la base de datos y de la aplicación.
 * @param User El usuario atenticado en la aplicación y el cual quiere eliminar sus datos.
 */
export const deleteUser = async (user: User): Promise<void> => {

    const decoded = verifyToken(user.token); // Validamos el token pasado como parámetro
    if (!decoded) {
        console.log('LOG_Error: Token inválido');
        return;
    }
    const db = await connectDB();
    await db.run(CONSULTAS.DELETE, [user.id]);
};



// TOKEN
import jwt, { JwtPayload } from 'jsonwebtoken';
var secret_key = '6dda1e4cd219462335597978f7c6f57a83d12f4bf0c99ad4071dcce89ed4558dffb0478f197526a6401bad67fb350219a787ce170d4ac510db4798f5e509774e';
type TokenPayload = {
    id: number;
    email: string;
};

export const generateToken = (payload: object): string => {
    const secretKey = process.env.JWT_SECRET || secret_key;
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Genera un token con expiración de 1 hora
    return token;
};

export const verifyToken = (token: string): TokenPayload | null => {
    try {
        const secretKey = process.env.JWT_SECRET || secret_key;
        const decoded = jwt.verify(token, secretKey);

        if (typeof decoded === 'object' && 'id' in decoded && 'email' in decoded) {
            return decoded as TokenPayload;
        }

        console.log('LOG_Error: El token decodificado no tiene el formato esperado');
        return null;
    } catch (err) {
        console.log('LOG_Error: Token inválido:', err);
        return null;
    }
};

