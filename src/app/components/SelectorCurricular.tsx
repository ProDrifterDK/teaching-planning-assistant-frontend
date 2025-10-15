'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Nivel, Curso } from '@/app/lib/types';
import { Select, MenuItem, Button, FormControl, InputLabel, Box } from '@mui/material';

export default function SelectorCurricular({ niveles }: { niveles: Nivel[] }) {
  const router = useRouter();
  const [selectedNivel, setSelectedNivel] = useState<string>('');
  const [selectedCurso, setSelectedCurso] = useState<string>('');

  const cursos = useMemo(() => {
    if (!selectedNivel) return [];
    const nivel = niveles.find(n => n.nombre === selectedNivel);
    return nivel ? nivel.cursos : [];
  }, [selectedNivel, niveles]);

  const handleNavigation = () => {
    if (selectedCurso) {
      router.push(`/planificar/${selectedCurso}/${selectedCurso}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, margin: 'auto' }}>
      <FormControl fullWidth>
        <InputLabel>Nivel</InputLabel>
        <Select value={selectedNivel} label="Nivel" onChange={(e) => {
          setSelectedNivel(e.target.value);
          setSelectedCurso('');
          setSelectedCurso('');
        }}>
          {niveles.map((nivel) => (
            <MenuItem key={nivel.nombre} value={nivel.nombre}>{nivel.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!selectedNivel}>
        <InputLabel>Curso</InputLabel>
        <Select value={selectedCurso} label="Curso" onChange={(e) => {
          const curso = e.target.value;
          setSelectedCurso(curso);
          router.push(`/planificar/${curso}/${curso}`);
        }}>
          {cursos.map((curso) => (
            <MenuItem key={curso.nombre} value={curso.nombre}>{curso.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={handleNavigation}
        disabled={!selectedCurso}
      >
        Seleccionar
      </Button>
    </Box>
  );
}