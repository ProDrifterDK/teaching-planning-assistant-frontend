'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { Curso, Asignatura, Eje } from '@/app/lib/types';
import { getOAs } from '@/app/lib/api';
import { Select, MenuItem, Button, FormControl, InputLabel, Box, CircularProgress, Autocomplete, TextField } from '@mui/material';

export default function SelectorCurricular({ cursos }: { cursos: Curso[] }) {
  const router = useRouter();
  const [selectedCurso, setSelectedCurso] = useState<string>('');
  const [selectedAsignatura, setSelectedAsignatura] = useState<string>('');
  const [oas, setOas] = useState<Eje[]>([]);
  const [selectedOA, setSelectedOA] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const asignaturas = useMemo(() => {
    if (!selectedCurso) return [];
    const curso = cursos.find(c => c.nombre === selectedCurso);
    return curso ? curso.asignaturas : [];
  }, [selectedCurso, cursos]);

  useEffect(() => {
    if (selectedCurso && selectedAsignatura) {
      const fetchOAs = async () => {
        setIsLoading(true);
        try {
          const oasData = await getOAs(selectedCurso, selectedAsignatura);
          setOas(oasData);
        } catch (error) {
          console.error("Failed to fetch OAs", error);
          setOas([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOAs();
    }
  }, [selectedCurso, selectedAsignatura]);


  const handleNavigation = () => {
    if (selectedCurso && selectedAsignatura && selectedOA) {
      router.push(`/planificar/${selectedCurso}/${selectedAsignatura}?selectedOA=${selectedOA}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, margin: 'auto' }}>
      <FormControl fullWidth>
        <InputLabel>Curso</InputLabel>
        <Select value={selectedCurso} label="Curso" onChange={(e) => {
          setSelectedCurso(e.target.value);
          setSelectedAsignatura('');
          setSelectedOA('');
          setOas([]);
        }}>
          {cursos.map((curso) => (
            <MenuItem key={curso.nombre} value={curso.nombre}>{curso.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!selectedCurso}>
        <InputLabel>Asignatura</InputLabel>
        <Select value={selectedAsignatura} label="Asignatura" onChange={(e) => {
          setSelectedAsignatura(e.target.value);
          setSelectedOA('');
        }}>
          {asignaturas.map((asignatura) => (
            <MenuItem key={asignatura.nombre} value={asignatura.nombre}>{asignatura.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Autocomplete
        options={oas.flatMap(eje => eje.oas.map(oa => ({ ...oa, ejeNombre: eje.nombre_eje })))}
        groupBy={(option) => option.ejeNombre}
        getOptionLabel={(option) => `${option.oa_codigo_oficial}: ${option.descripcion_oa}`}
        isOptionEqualToValue={(option, value) => option.oa_codigo_oficial === value.oa_codigo_oficial}
        onChange={(_, value) => setSelectedOA(value ? value.oa_codigo_oficial : '')}
        loading={isLoading}
        disabled={!selectedAsignatura || isLoading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Objetivo de Aprendizaje"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Button
        variant="contained"
        onClick={handleNavigation}
        disabled={!selectedOA}
      >
        Planificar
      </Button>
    </Box>
  );
}