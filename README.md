# User Management API

Bienvenido a la **User Management API**, una API RESTful para gestionar usuarios, con capacidades de registro, inicio de sesión y acceso a datos protegidos. Esta API permite registrar usuarios y realizar operaciones de gestión de usuarios.

## Características

- **Gestión de usuarios**: Permite consultar los datos de los usuarios, actualizarlos y eliminarlos.
- **Registro de usuarios**: Permite registrar nuevos usuarios con su nombre, apellido, email y contraseña.

## Módulo NPM
**User Management** esta disponible como paquete **NPM**
Si quieres usarlo en tu proyecto sin necesidad de clonar el código simplemente haz uso de los comandos de npm para ello.
```text
npm install user-management-package
```

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

Estará disponible en http://localhost:3000.

```javascript
npm run server
```

### 4. Revisar los Tests:

Por último si se desean revisar los tests efectuados para la comprobación de las funciones implementadas en user-management
```javascript
npm run testUsers
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
  "rol": "usuario"
}
```

### 2. Iniciar sesión

`POST /api/users/login`

Este endpoint permite a los usuarios autenticarse con su email y contraseña.

**Request Body:**

```json
{
  "email": "Alejandro@gmail.com",
  "password": "password"
}
```

### 3. Obtener todos los usuarios

`GET /api/users`

Este endpoint devuelve una lista de todos los usuarios registrados en el sistema. Puedes usar parámetros de consulta opcionales para filtrar o paginar los resultados.

**Parámetros de consulta:**

- `nombre` (opcional): Filtra los usuarios por nombre.
- `apellido` (opcional): Filtra los usuarios por apellido.
- `email` (opcional): Filtra los usuarios por dirección de correo electrónico.

### 4. Actualizar un usuario por ID

`PUT /api/users/:id`

Este endpoint permite actualizar la información de un usuario específico mediante su ID.

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
  "rol": "usuario"
}
```

### 5. Eliminar un usuario por ID 

`DELETE /api/users/:id`

Este endpoint permite eliminar un usuario específico mediante su ID.

#### **Parámetros:**

- **id** : El ID del usuario que deseas eliminar.
