'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { TextField, Button, Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { UserCreate } from '@/app/lib/types';
import { useState } from 'react';
import Image from "next/image";

export default function Register() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<UserCreate>();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<UserCreate> = async (data) => {
    setError(null);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setRegistrationSuccess(true);
    } else {
      const errorData = await response.json();
      setError(errorData.detail || 'An unexpected error occurred.');
    }
  };
  if (registrationSuccess) {
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
                <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                    ¡Registro exitoso!
                </Alert>
                <Typography variant="body1" align="center">
                    Tu cuenta ha sido creada. Un administrador necesita activarla antes de que puedas iniciar sesión.
                </Typography>
                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => window.location.href = '/auth/signin'}
                >
                    Ir al Login
                </Button>
            </Box>
        </Container>
    );
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Image
            src="/images/logo/copilot-docente landscape.png"
            alt="Copilot Docente Logo"
            width={300}
            height={75}
        />
        <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            {...register('username')}
            autoComplete="username"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            {...register('email')}
            autoComplete="email"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Full Name"
            {...register('full_name')}
            autoComplete="name"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            {...register('password')}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}