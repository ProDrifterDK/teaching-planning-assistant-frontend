'use client';

import { signIn, getSession } from 'next-auth/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextField, Button, Container, Typography, Box, Link, Alert, CircularProgress } from '@mui/material';
import NextLink from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from "next/image";

const validationSchema = z.object({
  username: z.string().min(1, { message: "El nombre de usuario es requerido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

type SignInForm = z.infer<typeof validationSchema>;

export default function SignInForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInForm>({
    resolver: zodResolver(validationSchema)
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered) {
      setSuccess("Tu cuenta ha sido creada exitosamente. Por favor, inicia sesión.");
    }
    const errorParam = searchParams.get('error');
    if (errorParam === 'SessionExpired') {
      setError("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
    }
  }, [searchParams]);

  const onSubmit: SubmitHandler<SignInForm> = async (data) => {
    setError(null);
    setSuccess(null);

    const result = await signIn('credentials', {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    // After signIn, the session should be updated. We check it directly.
    const session = await getSession();

    if (session) {
      router.replace('/');
    } else {
      // If there's still no session, then the error from signIn is the real one.
      setError(result?.error || 'No se pudo iniciar sesión. Verifique sus credenciales.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Image
            src="/images/logo/copilot-docente-image.png"
            alt="Copilot Docente Logo"
            width={200}
            height={200}
        />
        <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
          Iniciar Sesión
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nombre de usuario"
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Contraseña"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
          </Button>
          <Button component={NextLink} href="/auth/register" variant="text">
            ¿No tienes una cuenta? Regístrate
          </Button>
        </Box>
      </Box>
    </Container>
  );
}