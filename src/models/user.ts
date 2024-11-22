export interface User {
    id?: number;
    nombre: string;
    apellido: string;
    email: string;
    dni: string;
    nick: string;
    password: string;
    rol: 'admin' | 'propietario' | 'usuario';
    token: string;
    fecha_creacion: string;
  }
    
