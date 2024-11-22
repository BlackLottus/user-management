import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {
  createUser,
  login,
  listUsers,
  updateUser,
  deleteUser,
} from './controllers/userController.js'; 

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Rutas de usuarios
app.post('/api/users/register', async (req, res) => {
  try {
    await createUser(req.body);
    res.status(201).json({ message: 'Usuario creado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

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

app.get('/api/users', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  try {
    const users = await listUsers(token);
    if (users) {
      res.json(users);
    } else {
      res.status(401).json({ error: 'Token inválido' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});



app.put('/api/users', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  try {
    await updateUser(req.body.user, req.body.newUser);
    res.json({ message: 'Usuario actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

app.delete('/api/users', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return 
  }

  try {
    await deleteUser(req.body.user);
    res.json({ message: 'Usuario eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});