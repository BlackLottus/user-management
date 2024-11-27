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
 * Loguearse en la aplicación.
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

    return user; // Devuelve ños datos del usuario
};

/**
 * Obtiene todos los usuarios.
 * @returns Un arreglo de usuarios; de lo contrario, Error.
 */
export const listUsers = async (): Promise<User[] | void> => {
    const db = await connectDB();
    return await db.all<User[]>(CONSULTAS.SELECT_ALL);
};


/**
 * Actualiza los datos del usuario actual.
 * @param User El usuario atenticado en la aplicación y el cual quiere actualizar sus datos.
 * @param newUser El nuevo usuario que dispone de los datos de usuario que desean ser actualizados.
 */
export const updateUser = async (user: User, newUser: Partial<User>): Promise<void> => {
    const db = await connectDB();
  
    try {
      // Verificar si alguno de los datos únicos ya existe en la base de datos (email, dni, nick)
      if (newUser.email || newUser.dni || newUser.nick) {
        const existingUser = await db.get(
          `SELECT * FROM users WHERE (email = ? OR dni = ? OR nick = ?) AND id != ?`,
          [newUser.email, newUser.dni, newUser.nick, user.id]
        );
  
        if (existingUser) {
          throw new Error('Email, DNI o Nick ya están en uso por otro usuario.');
        }
      }
  
      // Si se proporciona una contraseña nueva, generar un hash
      let hashedPassword = user.password; // Usar la contraseña actual si no se actualiza
      if (newUser.password) {
        hashedPassword = await bcrypt.hash(newUser.password, 10);
      }
  
      // Construir la consulta dinámicamente solo con los campos proporcionados
      const updates = [];
      const values = [];
  
      for (const [key, value] of Object.entries(newUser)) {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
  
      if (updates.length === 0) {
        throw new Error('No se proporcionaron datos para actualizar.');
      }
  
      // Asegurar que la contraseña siempre se incluya en la actualización
      updates.push(`password = ?`);
      values.push(hashedPassword);
  
      // Agregar el ID del usuario al final de los valores
      values.push(user.id);
  
      // Ejecutar la actualización
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      await db.run(query, values);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw error;
    } finally {
      await db.close();
    }
  };
  

/*export const updateUser = async (user: User, newUser: Partial<User>): Promise<void> => {
    const db = await connectDB();

    // Revisar si los datos del nuevo usuario existen ya en la base de datos...
    // Solo actualizar los datos que nos pasan por newUser...

    if(newUser.password){
        const hashedPassword = await bcrypt.hash(newUser.password, 10);
        await db.run(CONSULTAS.UPDATE,[newUser.nombre, newUser.apellido, newUser.email, newUser.dni, 
            newUser.nick, hashedPassword, newUser.rol, newUser.fecha_creacion, user.id]);
    }else await db.run(CONSULTAS.UPDATE,[newUser.nombre, newUser.apellido, newUser.email, newUser.dni, 
        newUser.nick, newUser.password, newUser.rol, newUser.fecha_creacion, user.id]);
};*/

/**
 * Elimina al usuario actual de la base de datos y de la aplicación.
 * @param User El usuario atenticado en la aplicación y el cual quiere eliminar sus datos.
 */
export const deleteUser = async (user: User): Promise<void> => {
    const db = await connectDB();
    await db.run(CONSULTAS.DELETE, [user.id]);
};

// Función para obtener una reserva por su ID
export const getUserId = async (id: number): Promise<User | null> => {
    const db = await connectDB();

    // Validación del ID
    if (!id || id <= 0) {
        console.log('ID del usuario inválido');
        return null;
    }

    try {
        // Consulta SQL para obtener la reserva por ID
        const user = await db.get<User>(CONSULTAS.SELECT_BY_ID, [id]);

        // Si no se encuentra la reserva, devolver null
        if (!user) {
            console.log(`User con ID ${id} no encontrado.`);
            return null;
        }

        return user;
    } catch (err) {
        console.error('Error al obtener el usuario:', err);
        return null;
    }
};


