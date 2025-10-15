'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Grid, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, Select, MenuItem, SelectChangeEvent, Snackbar } from '@mui/material';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { updateUserStatus, updateUserRole } from '../lib/api';

interface UserSummary {
  username: string;
  total_cost: number;
  total_plannings: number;
  is_active: boolean;
  role: string;
}

interface AdminDashboardStats {
  total_users: number;
  total_system_cost: number;
  total_system_plannings: number;
  users_summary: UserSummary[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchStats = async () => {
    if (session) {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/dashboard-stats`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError("Unauthorized. Please sign in again.");
          } else {
            const errorData = await res.json();
            setError(errorData.detail || "Failed to fetch dashboard stats.");
          }
          return;
        }

        const data = await res.json();
        setStats(data);

      } catch (err) {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [session, status]);

  if (status === 'loading') {
    return <CircularProgress />;
  }

  if (!session) {
    redirect('/auth/signin');
  }

  if (session?.user?.role !== 'admin') {
    return (
        <Container>
            <Alert severity="error">You are not authorized to view this page.</Alert>
        </Container>
    );
  }

  const handleStatusChange = async (username: string, isActive: boolean) => {
    try {
        await updateUserStatus(username, isActive);
        setStats(prevStats => {
            if (!prevStats) return null;
            const updatedUsers = prevStats.users_summary.map(user => 
                user.username === username ? { ...user, is_active: isActive } : user
            );
            return { ...prevStats, users_summary: updatedUsers };
        });
        setSnackbarMessage('User status updated successfully.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    } catch (error) {
        setSnackbarMessage('Failed to update user status.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    }
  };

  const handleRoleChange = async (event: SelectChangeEvent<string>, username: string) => {
    const newRole = event.target.value;
    try {
        await updateUserRole(username, newRole);
        setStats(prevStats => {
            if (!prevStats) return null;
            const updatedUsers = prevStats.users_summary.map(user => 
                user.username === username ? { ...user, role: newRole } : user
            );
            return { ...prevStats, users_summary: updatedUsers };
        });
        setSnackbarMessage('User role updated successfully.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    } catch (error) {
        setSnackbarMessage('Failed to update user role.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Total Users
              </Typography>
              <Typography variant="h3">
                {stats?.total_users}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Total Plannings
              </Typography>
              <Typography variant="h3">
                {stats?.total_system_plannings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Total System Cost
              </Typography>
              <Typography variant="h3">
                ${stats?.total_system_cost.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 5 }}>
        Users Summary
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell align="right">Total Cost</TableCell>
              <TableCell align="right">Total Plannings</TableCell>
              <TableCell align="center">Is Active</TableCell>
              <TableCell align="center">Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats?.users_summary.map((user) => (
              <TableRow
                key={user.username}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {user.username}
                </TableCell>
                <TableCell align="right">${user.total_cost.toFixed(2)}</TableCell>
                <TableCell align="right">{user.total_plannings}</TableCell>
                <TableCell align="center">
                  <Switch
                    checked={user.is_active}
                    onChange={(e) => handleStatusChange(user.username, e.target.checked)}
                    name="isActive"
                  />
                </TableCell>
                <TableCell align="center">
                  <Select
                    value={user.role}
                    onChange={(e) => handleRoleChange(e, user.username)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    size="small"
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}