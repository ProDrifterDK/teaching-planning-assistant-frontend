'use client';

import { useState, useEffect } from 'react';
import { Eje, OA, PlanRequest } from '@/app/lib/types';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField, Button,
  Typography, Box, Paper, CircularProgress, Stepper, Step, StepLabel, Grid, Slider, Divider, Chip, Fade, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableCellProps,
  List, ListItem, ListItemIcon, ListItemText, Link, Alert
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { generatePlanStream } from '@/app/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  solicitud_especial?: string;
}

interface Props {
  ejes: Eje[];
  selectedOA_initial?: string;
}

const PENSAMIENTOS_FALSOS = [
  "Analizando el Objetivo de Aprendizaje...",
  "Considerando el nivel de los estudiantes...",
  "Buscando los recursos más adecuados...",
  "Estructurando la secuencia de la clase...",
  "Diseñando actividades de inicio...",
  "Creando el núcleo de la actividad principal...",
  "Integrando momentos de evaluación formativa...",
  "Planificando el cierre y la reflexión...",
  "Ajustando los tiempos para cada etapa...",
  "¡Casi listo! Dando los toques finales...",
];

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

  const { control, handleSubmit, formState: { isSubmitting, isValid }, trigger } = useForm<IFormInput>({
    defaultValues: {
      recurso_principal: '',
      nivel_real_estudiantes: '',
      duracion_clase_minutos: 90,
      numero_estudiantes: '',
    },
    mode: 'onChange',
  });

  const [pensamiento, setPensamiento] = useState<string>('');
  const [planificacion, setPlanificacion] = useState('');
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeStep === 1 && !isStreamingComplete) {
      setPensamiento(PENSAMIENTOS_FALSOS[0]);
      let i = 1;
      interval = setInterval(() => {
        setPensamiento(PENSAMIENTOS_FALSOS[i % PENSAMIENTOS_FALSOS.length]);
        i++;
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeStep, isStreamingComplete]);

  const onSubmit = async (data: IFormInput) => {
    setActiveStep(1);
    if (!selectedOA) return;
    setIsStreamingComplete(false);
    setPlanificacion('');
    setPensamiento('');

    const requestData: PlanRequest = {
      ...data,
      oa_codigo_oficial: selectedOA.oa_codigo_oficial,
      duracion_clase_minutos: Number(data.duracion_clase_minutos) || 90,
      numero_estudiantes: data.numero_estudiantes === '' ? undefined : Number(data.numero_estudiantes),
    };

    await generatePlanStream(
      requestData,
      () => { },
      (answerChunk) => {
        if (planificacion === '') {
          // Clear fake thoughts once real data arrives
          setPensamiento('');
        }
        setPlanificacion(prev => prev + answerChunk)
      },
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
                  <Controller name="recurso_principal" control={control} rules={{ required: 'Este campo es requerido' }} render={({ field, fieldState }) => <TextField {...field} label="Recurso Principal" fullWidth margin="normal" required error={!!fieldState.error} helperText={fieldState.error?.message} />} />
                  <Controller name="nivel_real_estudiantes" control={control} rules={{ required: 'Este campo es requerido' }} render={({ field, fieldState }) => <TextField {...field} label="Nivel Real de los Estudiantes" fullWidth margin="normal" required error={!!fieldState.error} helperText={fieldState.error?.message} />} />
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
                  <Controller name="solicitud_especial" control={control} defaultValue="" render={({ field }) => <TextField {...field} multiline rows={2} label="Solicitud Especial" fullWidth margin="normal" />} />
                </Grid>
              </Grid>
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Generar Planificación'}
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ mt: 3, mb: 5 }}>
            <Grid container spacing={4}>
              {planificacion === '' ? (
                <Grid size={{ xs: 12 }}>
                  <Paper elevation={2} sx={{ p: 2, minHeight: '300px' }}>
                    {pensamiento && (
                      <Box sx={{ mb: 2 }}>
                        <Chip icon={<PsychologyIcon />} label="Pensando..." size="small" />
                        <Fade in={true} key={pensamiento} timeout={500}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'grey.600', mt: 1 }}>
                            {pensamiento}
                          </Typography>
                        </Fade>
                      </Box>
                    )}
                    {!isStreamingComplete && !pensamiento && <Skeleton variant="text" height={100} />}
                  </Paper>
                </Grid>
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>Planificación Generada</Typography>
                  <Paper elevation={2} sx={{ p: 3, minHeight: '300px', transition: 'height 0.3s ease-out' }}>
                    <Box>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: (props) => (
                            <Typography
                              variant="h3"
                              gutterBottom
                              sx={{
                                mt: 4,
                                mb: 3,
                                fontWeight: 700,
                                color: 'primary.main',
                                borderBottom: 2,
                                borderColor: 'primary.light',
                                pb: 2
                              }}
                              {...props}
                            />
                          ),
                          h2: (props) => (
                            <Typography
                              variant="h4"
                              gutterBottom
                              sx={{
                                mt: 3,
                                mb: 2,
                                fontWeight: 600,
                                color: 'text.primary',
                                borderBottom: 1,
                                borderColor: 'divider',
                                pb: 1
                              }}
                              {...props}
                            />
                          ),
                          h3: (props) => (
                            <Typography
                              variant="h5"
                              gutterBottom
                              sx={{
                                mt: 2.5,
                                mb: 1.5,
                                fontWeight: 600,
                                color: 'text.primary',
                              }}
                              {...props}
                            />
                          ),
                          h4: (props) => (
                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{ mt: 2, mb: 1, fontWeight: 500 }}
                              {...props}
                            />
                          ),
                          h5: (props) => (
                            <Typography
                              variant="subtitle1"
                              gutterBottom
                              sx={{ mt: 1.5, mb: 1, fontWeight: 500 }}
                              {...props}
                            />
                          ),
                          h6: (props) => (
                            <Typography
                              variant="subtitle2"
                              gutterBottom
                              sx={{ mt: 1.5, mb: 1, fontWeight: 500 }}
                              {...props}
                            />
                          ),
                          p: (props) => (
                            <Typography
                              variant="body1"
                              paragraph
                              sx={{ mb: 2, lineHeight: 1.8 }}
                              {...props}
                            />
                          ),
                          strong: (props) => (
                            <Box
                              component="strong"
                              sx={{
                                fontWeight: 700,
                                color: 'primary.main',
                              }}
                              {...props}
                            />
                          ),
                          em: (props) => (
                            <Box
                              component="em"
                              sx={{
                                fontStyle: 'italic',
                                color: 'text.secondary',
                              }}
                              {...props}
                            />
                          ),
                          ul: (props) => (
                            <List
                              sx={{
                                pl: 2,
                                mb: 2,
                                '& .MuiListItem-root': {
                                  display: 'list-item',
                                  listStyleType: 'none',
                                }
                              }}
                              {...props}
                            />
                          ),
                          ol: (props) => (
                            <Box
                              component="ol"
                              sx={{
                                pl: 4,
                                mb: 2,
                                counterReset: 'item',
                                '& > li': {
                                  display: 'block',
                                  mb: 1,
                                  position: 'relative',
                                  '&:before': {
                                    content: 'counter(item) ". "',
                                    counterIncrement: 'item',
                                    position: 'absolute',
                                    left: -24,
                                    color: 'primary.main',
                                    fontWeight: 'bold',
                                  }
                                }
                              }}
                              {...props}
                            />
                          ),
                          li: ({ children }) => (
                            <ListItem sx={{ py: 0.5, px: 0, display: 'flex', alignItems: 'flex-start' }}>
                              <ListItemIcon sx={{ minWidth: '28px', mt: 0.5 }}>
                                <FiberManualRecordIcon
                                  sx={{
                                    fontSize: '0.5rem',
                                    color: 'primary.main',
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={children}
                                primaryTypographyProps={{
                                  variant: 'body1',
                                  sx: { lineHeight: 1.8 }
                                }}
                              />
                            </ListItem>
                          ),
                          blockquote: ({ children }) => {
                            // Check if it's a GitHub-style alert blockquote
                            const childrenText = String(children);
                            const alertMatch = childrenText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/);
                            
                            if (alertMatch) {
                              const [, type, content] = alertMatch;
                              const severity = type === 'WARNING' || type === 'CAUTION' ? 'warning' :
                                             type === 'NOTE' ? 'info' :
                                             type === 'TIP' ? 'success' :
                                             type === 'IMPORTANT' ? 'error' : 'info';
                              
                              return (
                                <Alert
                                  severity={severity}
                                  sx={{
                                    my: 3,
                                    '& .MuiAlert-message': {
                                      width: '100%',
                                    }
                                  }}
                                  icon={type === 'TIP' ? <CheckCircleOutlineIcon /> : undefined}
                                >
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: content ? 1 : 0 }}>
                                      {type}
                                    </Typography>
                                    {content && (
                                      <Typography variant="body2">
                                        {content}
                                      </Typography>
                                    )}
                                  </Box>
                                </Alert>
                              );
                            }
                            
                            // Regular blockquote
                            return (
                              <Paper
                                elevation={0}
                                sx={{
                                  borderLeft: (theme) => `5px solid ${theme.palette.primary.main}`,
                                  pl: 3,
                                  pr: 3,
                                  py: 2,
                                  my: 3,
                                  bgcolor: (theme) => theme.palette.mode === 'dark'
                                    ? 'rgba(144, 202, 249, 0.08)'
                                    : 'rgba(25, 118, 210, 0.04)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                }}
                              >
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 10,
                                    left: 10,
                                    opacity: 0.1,
                                  }}
                                >
                                  <FormatQuoteIcon sx={{ fontSize: '3rem', color: 'primary.main' }} />
                                </Box>
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                  <Typography
                                    variant="body1"
                                    component="div"
                                    sx={{
                                      fontStyle: 'italic',
                                      color: 'text.primary',
                                      lineHeight: 1.8,
                                    }}
                                  >
                                    {children}
                                  </Typography>
                                </Box>
                              </Paper>
                            );
                          },
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : '';
                            
                            return !match ? (
                              // Inline code
                              <Box
                                component="code"
                                sx={{
                                  bgcolor: (theme) => theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(0, 0, 0, 0.06)',
                                  borderRadius: 0.5,
                                  px: 0.75,
                                  py: 0.25,
                                  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                                  fontSize: '0.875em',
                                  color: (theme) => theme.palette.mode === 'dark'
                                    ? theme.palette.secondary.light
                                    : theme.palette.secondary.dark,
                                  border: 1,
                                  borderColor: 'divider',
                                }}
                                {...props}
                              >
                                {children}
                              </Box>
                            ) : (
                              // Code block
                              <Paper
                                elevation={2}
                                sx={{
                                  my: 3,
                                  overflow: 'hidden',
                                  bgcolor: (theme) => theme.palette.mode === 'dark'
                                    ? '#1e1e1e'
                                    : '#f5f5f5',
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    px: 2,
                                    py: 1,
                                    bgcolor: (theme) => theme.palette.mode === 'dark'
                                      ? 'rgba(255, 255, 255, 0.05)'
                                      : 'rgba(0, 0, 0, 0.03)',
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CodeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      {language || 'code'}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ p: 2, overflowX: 'auto' }}>
                                  <pre style={{
                                    margin: 0,
                                    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.6,
                                  }}>
                                    <code {...props}>{children}</code>
                                  </pre>
                                </Box>
                              </Paper>
                            );
                          },
                          a: ({ href, children, ...props }) => (
                            <Link
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                color: 'primary.main',
                                textDecoration: 'none',
                                fontWeight: 500,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                '&:hover': {
                                  textDecoration: 'underline',
                                  color: 'primary.dark',
                                },
                              }}
                              {...props}
                            >
                              {children}
                              <LinkIcon sx={{ fontSize: '0.875rem' }} />
                            </Link>
                          ),
                          hr: () => (
                            <Divider
                              sx={{
                                my: 4,
                                '&:before, &:after': {
                                  borderColor: 'primary.light',
                                  borderWidth: 2,
                                }
                              }}
                            >
                              <Chip
                                label="•••"
                                size="small"
                                sx={{
                                  bgcolor: 'background.paper',
                                  color: 'primary.main',
                                  fontWeight: 'bold',
                                }}
                              />
                            </Divider>
                          ),
                          table: (props) => (
                            <TableContainer
                              component={Paper}
                              elevation={1}
                              sx={{
                                my: 3,
                                '& .MuiTable-root': {
                                  '& .MuiTableCell-root': {
                                    borderColor: 'divider',
                                  }
                                }
                              }}
                            >
                              <Table {...props} />
                            </TableContainer>
                          ),
                          thead: ({ children }) => (
                            <TableHead
                              sx={{
                                bgcolor: (theme) => theme.palette.mode === 'dark'
                                  ? 'rgba(255, 255, 255, 0.05)'
                                  : 'rgba(0, 0, 0, 0.03)',
                              }}
                            >
                              {children}
                            </TableHead>
                          ),
                          tbody: ({ children }) => <TableBody>{children}</TableBody>,
                          tr: ({ children }) => (
                            <TableRow
                              sx={{
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              {children}
                            </TableRow>
                          ),
                          th: ({ align, ...props }) => (
                            <TableCell
                              align={align as TableCellProps['align']}
                              sx={{
                                fontWeight: 700,
                                color: 'primary.main',
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                              }}
                              {...props}
                            />
                          ),
                          td: ({ align, ...props }) => (
                            <TableCell
                              align={align as TableCellProps['align']}
                              sx={{
                                fontSize: '0.875rem',
                              }}
                              {...props}
                            />
                          ),
                        }}
                      >
                        {planificacion}
                      </ReactMarkdown>
                      {!isStreamingComplete && (
                        <span className="blinking-cursor">|</span>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )
        }
      </form >

      {/* OA display is now implicit in the page title, no longer needed here */}
    </Box >
  );
}