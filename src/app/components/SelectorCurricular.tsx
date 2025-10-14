'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Nivel, Curso, Asignatura } from '@/app/lib/types';
import { Select, MenuItem, Button, FormControl, InputLabel, Box } from '@mui/material';

export default function SelectorCurricular({ niveles }: { niveles: Nivel[] }) {
  const router = useRouter();
  const [selectedNivel, setSelectedNivel] = useState<string>('');
  const [selectedCurso, setSelectedCurso] = useState<string>('');
  const [selectedAsignatura, setSelectedAsignatura] = useState<string>('');

  const cursos = useMemo(() => {
    if (!selectedNivel) return [];
    const nivel = niveles.find(n => n.nombre === selectedNivel);
    return nivel ? nivel.cursos : [];
  }, [selectedNivel, niveles]);

  const asignaturas = useMemo(() => {
    if (!selectedCurso) return [];
    const curso = cursos.find(c => c.nombre === selectedCurso);
    return curso ? curso.asignaturas : [];
  }, [selectedCurso, cursos]);

  const handleNavigation = () => {
    if (selectedCurso && selectedAsignatura) {
      router.push(`/planificar/${selectedCurso}/${selectedAsignatura}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, margin: 'auto' }}>
      <FormControl fullWidth>
        <InputLabel>Nivel</InputLabel>
        <Select value={selectedNivel} label="Nivel" onChange={(e) => {
          setSelectedNivel(e.target.value);
          setSelectedCurso('');
          setSelectedAsignatura('');
        }}>
          {niveles.map((nivel) => (
            <MenuItem key={nivel.nombre} value={nivel.nombre}>{nivel.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!selectedNivel}>
        <InputLabel>Curso</InputLabel>
        <Select value={selectedCurso} label="Curso" onChange={(e) => {
          setSelectedCurso(e.target.value);
          setSelectedAsignatura('');
        }}>
          {cursos.map((curso) => (
            <MenuItem key={curso.nombre} value={curso.nombre}>{curso.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!selectedCurso}>
        <InputLabel>Asignatura</InputLabel>
        <Select value={selectedAsignatura} label="Asignatura" onChange={(e) => setSelectedAsignatura(e.target.value)}>
          {asignaturas.map((asignatura) => (
            <MenuItem key={asignatura.nombre} value={asignatura.nombre}>{asignatura.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={handleNavigation}
        disabled={!selectedCurso || !selectedAsignatura}
      >
        Planificar
      </Button>
    </Box>
  );
}