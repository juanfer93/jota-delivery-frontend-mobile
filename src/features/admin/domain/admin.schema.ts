import { z } from 'zod';

export const createAdminSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma la contraseña'),
  rol: z.enum(['admin', 'cliente', 'domiciliario']).default('admin'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type CreateAdminForm = z.infer<typeof createAdminSchema>;