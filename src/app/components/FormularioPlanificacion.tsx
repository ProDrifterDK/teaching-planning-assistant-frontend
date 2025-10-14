'use client';

import { useState } from 'react';
import { Eje, OA, PlanRequest } from '@/app/lib/types';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField, Button,
  Accordion, AccordionSummary, AccordionDetails, Typography, Box, Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { generatePlanStream } from '@/app/lib/api';
import ReactMarkdown from 'react-markdown';

interface IFormInput {
  recurso_principal: string;
  nivel_real_estudiantes: string;
  materiales_disponibles?: string;
  duracion_clase_minutos: number;
  numero_estudiantes?: number;
  diversidad_aula?: string;
  clima_de_aula?: string;
  estilo_docente_preferido?: string;
  tipo_evaluacion_formativa?: string;
  contexto_unidad?: string;
  conocimientos_previos_requeridos?: string;
}

export default function FormularioPlanificacion({ ejes }: { ejes: Eje[] }) {
  const [selectedOA, setSelectedOA] = useState<OA | null>(null);
  const { control, handleSubmit } = useForm<IFormInput>();
  const [pensamiento, setPensamiento] = useState('');
  const [planificacion, setPlanificacion] = useState('');

  const onSubmit = async (data: IFormInput) => {
    if (!selectedOA) return;
    setPlanificacion('');
    setPensamiento('');

    const requestData: PlanRequest = {
      ...data,
      oa_codigo_oficial: selectedOA.oa_codigo_oficial,
      duracion_clase_minutos: Number(data.duracion_clase_minutos) || 90,
    };

    await generatePlanStream(
      requestData,
      (thought) => setPensamiento(thought),
      (answerChunk) => setPlanificacion(prev => prev + answerChunk),
      () => setPensamiento('')
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 4 }}>
      <Typography variant="h6">Seleccione un Objetivo de Aprendizaje (OA)</Typography>
      {ejes.map((eje) => (
        <Accordion key={eje.nombre_eje}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{eje.nombre_eje}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {eje.oas.map((oa) => (
              <Paper
                key={oa.oa_codigo_oficial}
                onClick={() => setSelectedOA(oa)}
                sx={{
                  p: 2,
                  mb: 1,
                  cursor: 'pointer',
                  border: selectedOA?.oa_codigo_oficial === oa.oa_codigo_oficial ? '2px solid' : '1px solid',
                  borderColor: selectedOA?.oa_codigo_oficial === oa.oa_codigo_oficial ? 'primary.main' : 'grey.300'
                }}
              >
                <Typography variant="subtitle1">{oa.oa_codigo_oficial}</Typography>
                <Typography variant="body2">{oa.descripcion_oa}</Typography>
              </Paper>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      <Typography variant="h6" sx={{ mt: 4 }}>Contexto del Aula</Typography>
      <Controller
        name="recurso_principal"
        control={control}
        defaultValue=""
        render={({ field }) => <TextField {...field} label="Recurso Principal" fullWidth margin="normal" required />}
      />
      <Controller
        name="nivel_real_estudiantes"
        control={control}
        defaultValue=""
        render={({ field }) => <TextField {...field} label="Nivel Real de los Estudiantes" fullWidth margin="normal" required />}
      />
      {/* ... más campos del formulario ... */}
      <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={!selectedOA}>
        Generar Planificación
      </Button>

      {pensamiento && <Typography sx={{ mt: 2 }}>Pensando: {pensamiento}</Typography>}
      {planificacion && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6">Planificación Generada</Typography>
          <ReactMarkdown>{planificacion}</ReactMarkdown>
        </Paper>
      )}
    </Box>
  );
}