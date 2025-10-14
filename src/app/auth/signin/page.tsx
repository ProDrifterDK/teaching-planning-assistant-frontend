'use client';

import { signIn } from 'next-auth/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextField, Button, Container, Typography, Box, Link, Alert, CircularProgress } from '@mui/material';
import NextLink from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const validationSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type SignInForm = z.infer<typeof validationSchema>;

export default function SignIn() {
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
      setSuccess("Your account has been created successfully. Please sign in.");
    }
  }, [searchParams]);

  const onSubmit: SubmitHandler<SignInForm> = async (data) => {
    const result = await signIn('credentials', {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
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
            {isSubmitting ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Link component={NextLink} href="/auth/register" variant="body2">
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
}