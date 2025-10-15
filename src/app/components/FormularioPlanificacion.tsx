'use client';

import { useState, useEffect } from 'react';
import { Eje, OA, PlanRequest } from '@/app/lib/types';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField, Button,
  Typography, Box, Paper, CircularProgress, Stepper, Step, StepLabel, Grid, Slider, Divider, Chip, Fade, Skeleton
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { generatePlanStream } from '@/app/lib/api';
import ReactMarkdown from 'react-markdown';
import { TypeAnimation } from 'react-type-animation';

interface IFormInput {
  recurso_principal: string;
  nivel_real_estudiantes: string;
  materiales_disponibles?: string;
  duracion_clase_minutos: number;
  numero_estudiantes?: number | '';
  diversidad_aula?: string;
  clima_de_aula?: string;
  estilo_docente_preferido?: string;
  tipo_evaluacion_formativa?: string;
  contexto_unidad?: string;
  conocimientos_previos_requeridos?: string;
}

interface Props {
  ejes: Eje[];
  selectedOA_initial?: string;
}

export default function FormularioPlanificacion({ ejes, selectedOA_initial }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedOA, setSelectedOA] = useState<OA | null>(() => {
    if (!selectedOA_initial) return null;
    for (const eje of ejes) {
      const oa = eje.oas.find(oa => oa.oa_codigo_oficial === selectedOA_initial);
      if (oa) return oa;
    }
    return null;
  });

  const { control, handleSubmit, formState: { isSubmitting }, trigger } = useForm<IFormInput>({
    defaultValues: {
      duracion_clase_minutos: 90,
      numero_estudiantes: '',
    }
  });

  const [pensamientos, setPensamientos] = useState<string[]>([]);
  const [planificacion, setPlanificacion] = useState('');
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const onSubmit = async (data: IFormInput) => {
    if (!selectedOA) return;
    setIsStreamingComplete(false);
    setPlanificacion('');
    setPensamientos([]);

    const requestData: PlanRequest = {
      ...data,
      oa_codigo_oficial: selectedOA.oa_codigo_oficial,
      duracion_clase_minutos: Number(data.duracion_clase_minutos) || 90,
      numero_estudiantes: data.numero_estudiantes === '' ? undefined : Number(data.numero_estudiantes),
    };

    let thoughtBuffer = '';
    await generatePlanStream(
      requestData,
      (thought) => {
        thoughtBuffer += thought;
        if (thought.endsWith('\n')) {
          setPensamientos(prev => [...prev, thoughtBuffer]);
          thoughtBuffer = '';
        }
      },
      (answerChunk) => setPlanificacion(prev => prev + answerChunk),
      () => setIsStreamingComplete(true)
    );
  };

  const steps = ['Contexto del Aula', 'Generación y Visualización'];

  return (
    <Box sx={{ mt: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit(onSubmit)}>
        {activeStep === 0 && (
          <Box sx={{ mt: 3 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Contexto del Aula</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="recurso_principal" control={control} defaultValue="" render={({ field, fieldState }) => <TextField {...field} label="Recurso Principal" fullWidth margin="normal" required error={!!fieldState.error} helperText={fieldState.error?.message} />} />
                  <Controller name="nivel_real_estudiantes" control={control} defaultValue="" render={({ field, fieldState }) => <TextField {...field} label="Nivel Real de los Estudiantes" fullWidth margin="normal" required error={!!fieldState.error} helperText={fieldState.error?.message} />} />
                  <Controller name="materiales_disponibles" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="Materiales Disponibles" fullWidth margin="normal" />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography gutterBottom>Duración de la Clase (minutos)</Typography>
                  <Controller name="duracion_clase_minutos" control={control} render={({ field }) => <Slider {...field} aria-label="Duración" valueLabelDisplay="auto" step={15} marks min={30} max={120} />} />
                  <Controller name="numero_estudiantes" control={control} render={({ field }) => <TextField {...field} label="Número de Estudiantes" fullWidth margin="normal" type="number" />} />
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="diversidad_aula" control={control} defaultValue="" render={({ field }) => <TextField {...field} multiline rows={2} label="Diversidad del Aula" fullWidth margin="normal" />} />
                  <Controller name="clima_de_aula" control={control} defaultValue="" render={({ field }) => <TextField {...field} multiline rows={2} label="Clima de Aula" fullWidth margin="normal" />} />
                  <Controller name="estilo_docente_preferido" control={control} defaultValue="" render={({ field }) => <TextField {...field} multiline rows={2} label="Estilo Docente Preferido" fullWidth margin="normal" />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="tipo_evaluacion_formativa" control={control} defaultValue="" render={({ field }) => <TextField {...field} multiline rows={2} label="Tipo de Evaluación Formativa" fullWidth margin="normal" />} />
                  <Controller name="contexto_unidad" control={control} defaultValue="" render={({ field }) => <TextField {...field} multiline rows={2} label="Contexto de la Unidad" fullWidth margin="normal" />} />
                  <Controller name="conocimientos_previos_requeridos" control={control} defaultValue="" render={({ field }) => <TextField {...field} multiline rows={2} label="Conocimientos Previos Requeridos" fullWidth margin="normal" />} />
                </Grid>
              </Grid>
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" onClick={handleNext}>Siguiente</Button>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="h6" gutterBottom>Flujo de Pensamiento de la IA</Typography>
                <Paper elevation={2} sx={{ p: 2, height: '100%', minHeight: '300px' }}>
                  {pensamientos.map((thought, index) => (
                    <Fade in={true} key={index} timeout={500}>
                      <Box sx={{ mb: 2 }}>
                        <Chip icon={<PsychologyIcon />} label="Pensando..." size="small" />
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'grey.600', mt: 1 }}>
                          <TypeAnimation sequence={[thought]} speed={80} repeat={0} cursor={false} />
                        </Typography>
                      </Box>
                    </Fade>
                  ))}
                  {!isStreamingComplete && pensamientos.length === 0 && <Skeleton variant="text" height={100} />}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="h6" gutterBottom>Planificación Generada</Typography>
                <Paper elevation={2} sx={{ p: 3, height: '100%', minHeight: '300px', transition: 'height 0.3s ease-out' }}>
                  {planificacion ? (
                    <Box>
                      <ReactMarkdown>{planificacion}</ReactMarkdown>
                      {!isStreamingComplete && <span className="blinking-cursor">|</span>}
                    </Box>
                  ) : (
                    <Skeleton variant="rectangular" height={200} />
                  )}
                </Paper>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Generar Planificación'}
              </Button>
            </Box>
          </Box>
        )}
      </form>

      {/* OA display is now implicit in the page title, no longer needed here */}
    </Box>
  );
}