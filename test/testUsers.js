import { expect } from 'chai';
import { createUser, login, listUsers, updateUser, deleteUser } from '../dist/index.js';
import { connectDB } from '../dist/database/db.js'; 
import jwt from 'jsonwebtoken';
import sinon from 'sinon';
import chalk from 'chalk';

describe(chalk.green('Test de Funciones de Usuario'), () => {

  let testUser;
  let token;
  let secret_key = '6dda1e4cd219462335597978f7c6f57a83d12f4bf0c99ad4071dcce89ed4558dffb0478f197526a6401bad67fb350219a787ce170d4ac510db4798f5e509774e';
  let logStub;
  let errorStub;

  before(async () => {
    // Crear un usuario para pruebas
    testUser = {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@example.com',
      dni: '12345678',
      nick: 'juanito',
      password: 'password123',
      rol: 'usuario',
      fecha_creacion: new Date().toISOString()
    };

    // Creamos el usuario en la base de datos
    await createUser(testUser);

    // Verifica que el usuario se haya creado correctamente
    const db = await connectDB();
    const createdUser = await db.get('SELECT * FROM users WHERE email = ?', [testUser.email]);

    if (!createdUser || !createdUser.id) {
      throw new Error('No se pudo crear el usuario');
    }

    testUser.id = createdUser.id; // Asignamos el ID del usuario creado
    token = jwt.sign({ id: testUser.id, email: testUser.email }, secret_key, { expiresIn: '1h' });
    testUser.token = token; // Asignamos el token generado al usuario para futuras pruebas

    console.log(chalk.blue('Usuario creado para pruebas.'));
  });

  beforeEach(() => {
    // Creando stubs para console.log y console.error
    logStub = sinon.stub(console, 'log');
    errorStub = sinon.stub(console, 'error');
  });

  afterEach(() => {
    // Restaurar los stubs después de cada prueba
    logStub.restore();
    errorStub.restore();
  });

  describe(chalk.yellow('Prueba de login'), () => {
    it('Debe loguearse correctamente con el email y password', async () => {
      const loggedUser = await login(testUser.email, testUser.password);
      expect(loggedUser).to.not.be.null;
      expect(loggedUser.email).to.equal(testUser.email);
      console.log(chalk.green('Login exitoso.'));
    });

    it('Debe fallar si la contraseña es incorrecta', async () => {
      const loggedUser = await login(testUser.email, 'incorrectPassword');
      expect(loggedUser).to.be.null;
      console.log(chalk.green('Login fallido - Contraseña incorrecta.'));
    });
  });

  describe(chalk.yellow('Prueba de listado de usuarios'), () => {
    it('Debe listar todos los usuarios correctamente', async () => {
      const users = await listUsers(testUser.token);  // Pasamos el token aquí
      expect(users).to.be.an('array');
      expect(users).to.have.lengthOf.above(0);
      console.log(chalk.green('Listado de usuarios exitoso.'));
    });
  });

  describe(chalk.yellow('Prueba de actualización de usuario'), () => {
    it('Debe actualizar los datos de usuario correctamente', async () => {
      const updatedData = {
        nombre: 'Juan Carlos',
        apellido: 'Pérez Gómez',
        email: 'juan.carlos@example.com',
        dni: '98765432',
        nick: 'juancarlos',
        password: 'newpassword123',
        rol: 'admin',
        fecha_creacion: new Date().toISOString()
      };

      // Actualizamos los datos
      await updateUser(testUser, updatedData);  // Pasamos el token aquí también

      // Verificamos que la actualización se haya realizado
      const updatedUser = await login(updatedData.email, updatedData.password);  // Verifica con el nuevo email y password
      expect(updatedUser).to.not.be.null;
      expect(updatedUser.nombre).to.equal(updatedData.nombre);
      console.log(chalk.green('Usuario actualizado correctamente.'));
    });
  });

  describe(chalk.yellow('Prueba de eliminación de usuario'), () => {
    it('Debe eliminar el usuario correctamente', async () => {
      await deleteUser(testUser);  // Pasamos el token aquí también

      // Intentamos obtener el usuario eliminado
      const deletedUser = await login(testUser.email, testUser.password);  // El usuario no debe poder loguearse
      expect(deletedUser).to.be.null;
      console.log(chalk.green('Usuario eliminado correctamente.'));
    });
  });

  after(async () => {
    // Limpiar los datos de prueba si es necesario
    console.log(chalk.blue('Datos de prueba limpiados.'));
  });
});
