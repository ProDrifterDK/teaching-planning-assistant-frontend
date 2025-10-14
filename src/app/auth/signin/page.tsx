'use client';

import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

interface SignInForm {
  username: string;
  password: string;
}

export default function SignIn() {
  const { register, handleSubmit } = useForm<SignInForm>();

  const onSubmit = async (data: SignInForm) => {
    await signIn('credentials', {
      username: data.username,
      password: data.password,
      redirect: true,
      callbackUrl: '/',
    });
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            {...register('username')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            {...register('password')}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}