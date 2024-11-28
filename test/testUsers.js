import { connectDB } from '../dist/database/db.js';
import {
    addUser,
    login,
    listUsers,
    updateUser,
    deleteUser,
    getUserId
} from '../dist/index.js';
import { expect } from 'chai';
import sinon from 'sinon';

describe('Funciones de Usuarios', () => {
    let db;
    let logStub;
    let errorStub;

    beforeEach(() => {
        // Silenciar console.log y console.error
        logStub = sinon.stub(console, 'log');
        errorStub = sinon.stub(console, 'error');
    });

    afterEach(() => {
        logStub.restore();
        errorStub.restore();
    });

    // Configuración inicial: Crear tabla de usuarios
    before(async () => {
        db = await connectDB();
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                apellido TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                dni TEXT UNIQUE NOT NULL,
                nick TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                rol TEXT CHECK(rol IN ('admin', 'propietario', 'usuario')) NOT NULL,
                fecha_creacion TEXT NOT NULL
            );
        `);
    });

    // Limpieza después de todas las pruebas
    after(async () => {
        await db.exec(`DROP TABLE users`);
        db.close();
    });

    it('Debe agregar un nuevo usuario', async () => {
        const nuevoUsuario = {
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan.perez@example.com',
            dni: '12345678A',
            nick: 'juanperez',
            password: 'password123',
            rol: 'usuario'
        };

        await addUser(nuevoUsuario);
        const usuarios = await listUsers();
        expect(usuarios).to.have.lengthOf(1);
        expect(usuarios[0].email).to.equal('juan.perez@example.com');
    });

    it('No debe agregar un usuario con email duplicado', async () => {
        const usuarioDuplicado = {
            nombre: 'Maria',
            apellido: 'Lopez',
            email: 'juan.perez@example.com',
            dni: '87654321B',
            nick: 'marialopez',
            password: 'password456',
            rol: 'usuario'
        };

        await addUser(usuarioDuplicado);
        expect(logStub.calledWithMatch('LOG_Error: Ya existe un usuario registrado')).to.be.true;
    });

    it('Debe iniciar sesión con credenciales válidas', async () => {
        const usuario = await login('juan.perez@example.com', 'password123');
        expect(usuario).to.not.be.null;
        expect(usuario.email).to.equal('juan.perez@example.com');
    });

    it('No debe iniciar sesión con contraseña incorrecta', async () => {
        const usuario = await login('juan.perez@example.com', 'wrongpassword');
        expect(usuario).to.be.null;
    });

    it('Debe listar todos los usuarios', async () => {
        const usuarios = await listUsers();
        expect(usuarios).to.have.lengthOf(1);
    });

    it('Debe actualizar un usuario existente', async () => {
        const usuarios = await listUsers();
        const usuario = usuarios[0];
        const nuevosDatos = {
            nombre: 'Juanito',
            apellido: 'Pérez García',
            email: 'juanito.perez@example.com',
            dni: '12345678A',
            nick: 'juanito',
            password: 'newpassword123',
            rol: 'usuario'
        };
        await updateUser(usuario.id, nuevosDatos);
        const usuariosActualizados = await listUsers();
        expect(usuariosActualizados[0].nombre).to.equal('Juanito');
        expect(usuariosActualizados[0].email).to.equal('juanito.perez@example.com');
    });

    it('Debe eliminar un usuario existente', async () => {
        const usuarios = await listUsers();
        const usuario = usuarios[0];

        await deleteUser(usuario.id);
        const usuariosRestantes = await listUsers();
        expect(usuariosRestantes).to.have.lengthOf(0);
    });

    it('Debe obtener un usuario por ID', async () => {
        const nuevoUsuario = {
            nombre: 'Carlos',
            apellido: 'Sánchez',
            email: 'carlos.sanchez@example.com',
            dni: '11223344C',
            nick: 'carloss',
            password: 'mypassword',
            rol: 'usuario'
        };

        await addUser(nuevoUsuario);
        const usuarios = await listUsers();
        const usuario = await getUserId(usuarios[0].id);

        expect(usuario).to.not.be.null;
        expect(usuario.email).to.equal('carlos.sanchez@example.com');
    });

    it('No debe obtener un usuario con ID inválido', async () => {
        const usuario = await getUserId(99999);
        expect(usuario).to.be.null;
    });
});
