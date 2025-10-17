'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { getPlanningHistory } from '../lib/api';
import { PlanningLogResponse } from '../lib/types';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState<PlanningLogResponse[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    if (status === 'authenticated') {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          const data = await getPlanningHistory();
          setHistory(data);
        } catch (err) {
          setError('Error al cargar el historial de planificaciones.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchHistory();
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
        <Grid container justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
          <Grid size={12}>
            <CircularProgress />
          </Grid>
        </Grid>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Historial de Planificaciones
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {!error && !loading && history && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>OA Planificado</TableCell>
                <TableCell>Fecha de Creación</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length > 0 ? (
                history.map((log) => (
                  <TableRow
                    key={log.id}
                    component={Link}
                    href={`/history/${log.id}`}
                    hover
                    sx={{ cursor: 'pointer', textDecoration: 'none' }}
                  >
                    <TableCell component="th" scope="row">
                      {log.oa_codigo}
                    </TableCell>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No hay registros de planificación aún.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}