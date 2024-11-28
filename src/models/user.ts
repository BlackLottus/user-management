export interface User {
    id?: number;
    nombre: string;
    apellido: string;
    email: string;
    dni: string;
    nick: string;
    password: string;
    rol: 'admin' | 'propietario' | 'usuario';
    fecha_creacion: string;
    activo: Boolean;
    image: string;
  }
    
