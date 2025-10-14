'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { TextField, Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import { UserCreate } from '@/app/lib/types';
import { useRouter } from 'next/navigation';

export default function Register() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<UserCreate>();
  const router = useRouter();

  const onSubmit: SubmitHandler<UserCreate> = async (data) => {
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    router.push('/auth/signin?registered=true');
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Register
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
            label="Email"
            type="email"
            {...register('email')}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Full Name"
            {...register('full_name')}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}