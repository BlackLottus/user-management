# User Management API

Bienvenido a la **User Management API**, una API RESTful para gestionar usuarios, con capacidades de registro, inicio de sesión y acceso a datos protegidos. Esta API permite registrar usuarios, autenticar sus credenciales mediante JWT y realizar operaciones de gestión de usuarios.

## Características

- **Gestión de usuarios**: Permite consultar los datos de los usuarios, actualizarlos y eliminarlos.
- **Registro de usuarios**: Permite registrar nuevos usuarios con su nombre, apellido, email y contraseña.
- **Inicio de sesión**: Proporciona un token JWT para autenticarse en la API y acceder a recursos protegidos.
- **Protección de rutas**: Utiliza JWT para proteger rutas y asegurar que solo los usuarios autenticados puedan acceder a datos sensibles.


## Autenticación
La API utiliza JWT (JSON Web Tokens) para autenticar a los usuarios y proteger rutas sensibles. Para obtener un token, simplemente inicia sesión con tu email y contraseña. Luego, usa el token en los headers de tus solicitudes a los endpoints protegidos.

## Instrucciones de la API

### 1. Clonar el repositorio:
```javascript
git clone https://github.com/BlackLottus/user-management.git
cd user-management
```

### 2. Instalar dependencias:
```javascript
npm install
```

### 3. Ejecutar la API:

```javascript
npm run 
La API estará disponible en http://localhost:3000.
```

## Endpoints

### 1. Registrar un nuevo usuario

`POST /api/users/register`

Este endpoint permite registrar un nuevo usuario en el sistema. Los parámetros requeridos para la creación del usuario son:

- **nombre** : El nombre del usuario.
- **apellido** : El apellido del usuario.
- **email** : El email del usuario, debe ser único.
- **dni** : El DNI del usuario.
- **nick** : El nombre de usuario o apodo.
- **password** : La contraseña del usuario, debe ser fuerte.
- **rol** : El rol del usuario ("admin", "usuario", "propietario").

#### **Request Body:**

```json
{
  "nombre": "Alejandro",
  "apellido": "Pastor",
  "email": "Alejandro@gmail.com",
  "dni": "12345678A",
  "nick": "Alex",
  "password": "password",
  "rol": "usuario",
}
```

### 2. Iniciar sesión

`POST /api/users/login`

Este endpoint permite a los usuarios autenticarse con su email y contraseña. Necesitarás Iniciar sesión para obtener un Token y para utilizar los demás métodos de la aplicación.

**Request Body:**

```json
{
  "email": "Alejandro@gmail.com",
  "password": "password"
}
```

### 3. Obtener todos los usuarios (Protegido)

`GET /api/users`

Este endpoint devuelve una lista de todos los usuarios registrados en el sistema. Puedes usar parámetros de consulta opcionales para filtrar o paginar los resultados.

**Parámetros de consulta:**

- `nombre` (opcional): Filtra los usuarios por nombre.
- `apellido` (opcional): Filtra los usuarios por apellido.
- `email` (opcional): Filtra los usuarios por dirección de correo electrónico.


**Headers:**

```text
Authorization: Bearer <token>
```

### 4. Obtener un usuario por ID (Protegido)

`GET /api/users/:id`

Este endpoint permite obtener la información de un usuario específico mediante su ID. Requiere autenticación con un token.

**Parámetros:**
- `id`: El ID del usuario que deseas obtener.

**Headers:**

```text
Authorization: Bearer <token>
```

### 5. Actualizar un usuario por ID (Protegido)

`PUT /api/users/:id`

Este endpoint permite actualizar la información de un usuario específico mediante su ID. Se requiere autenticación mediante un token.

#### **Parámetros:**

- **id** : El ID del usuario que deseas actualizar.

Los parámetros son opcionales. Se pueden actualizar de uno en uno sin necesidad de actualizar todos a la vez.

Los siguientes parámetros se pueden actualizar:

- **nombre** : El nombre del usuario.
- **apellido** : El apellido del usuario.
- **email** : El email del usuario, debe ser único.
- **dni** : El DNI del usuario.
- **nick** : El nombre de usuario o apodo.
- **password** : La contraseña del usuario, debe ser fuerte.
- **rol** : El rol del usuario ("admin", "usuario", "propietario").

#### **Request Body:**

```json
{
  "nombre": "Alejandro",
  "apellido": "Pastor",
  "email": "Alejandro@gmail.com",
  "dni": "12345678A",
  "nick": "Alex",
  "password": "password",
  "rol": "usuario",
}
```

### 6. Eliminar un usuario por ID (Protegido)

`DELETE /api/users/:id`

Este endpoint permite eliminar un usuario específico mediante su ID. Se requiere un token.

#### **Parámetros:**

- **id** : El ID del usuario que deseas eliminar.

#### **Headers:**

```text
Authorization: Bearer <token>
```