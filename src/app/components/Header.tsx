'use client';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
              Teaching Planning Assistant
            </Link>
          </Typography>
          {status === 'authenticated' ? (
            <>
              {session?.user?.role === 'admin' && (
                  <Button color="inherit" component={Link} href="/admin">
                    Admin
                  </Button>
                )}
              <Button color="inherit" component={Link} href="/">
                Planificar
              </Button>
              <Button color="inherit" component={Link} href="/history">
                Historial
              </Button>
              <Button color="inherit" onClick={() => signOut()}>
                Logout
              </Button>
            </>
          ) : status === 'unauthenticated' ? (
            <>
              <Button color="inherit" component={Link} href="/auth/signin">
                Login
              </Button>
              <Button color="inherit" component={Link} href="/auth/register">
                Register
              </Button>
            </>
          ) : null}
        </Toolbar>
      </AppBar>
    </Box>
  );
}