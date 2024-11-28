import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {
  addUser,login,listUsers,updateUser,deleteUser,getUserId
} from './controllers/userController.js'; 

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Rutas de usuarios

/* ******************************************************* */
/*            EndPoint para Registrar Usuarios             */
/* ******************************************************* */
app.post('/api/users/register', async (req, res) => {
  try {
    await addUser(req.body);
    res.status(201).json({ message: 'Usuario creado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

/* ******************************************************* */
/*             EndPoint para Loguear Usuarios              */
/* ******************************************************* */
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await login(email, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

/* ******************************************************* */
/*             EndPoint para Listar Usuarios               */
/* ******************************************************* */
app.get('/api/users', async (req: Request, res: Response) => {

  try {
    const users = await listUsers();
    if (users) {
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

/* ******************************************************* */
/*            EndPoint para Actualizar Usuarios            */
/* ******************************************************* */
app.put('/api/users/:id', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id); // Obtener el ID de la reserva desde la URL
  const newUser = req.body; // Obtener los nuevos datos de la reserva desde el cuerpo de la petición
  
  try {
  // Comprobar si la reserva existe antes de actualizarla
  const existingUser = await getUserId(userId);
      
  if (!existingUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return 
  }
  
  // Llamar a la función updateReserva para realizar la actualización
  await updateUser(userId, newUser);
  
  const newU = await getUserId(userId);
  // Responder con un mensaje de éxito
  res.status(200).json({ newU });
  } catch (error) {
  console.error('Error al actualizar el usuario:', error);
  res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

/* ******************************************************* */
/*             EndPoint para Eliminar Usuarios             */
/* ******************************************************* */
app.delete('/api/users/:id', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id); // Obtener el ID de la reserva desde la URL
  
    try {
      // Comprobar si la reserva existe antes de eliminarla
      const existingUser = await getUserId(userId);
  
      if (!existingUser) {
        res.status(404).json({ error: 'User no encontrado' });
        return 
      }
  
      // Llamar a la función deleteReserva para eliminar la reserva
      await deleteUser(userId);
  
      // Responder con un mensaje de éxito
      res.status(200).json({ UserID: userId , text: "Usuario Eliminado correctamente."});
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});