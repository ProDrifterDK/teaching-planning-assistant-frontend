'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Box,
    Divider,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Link,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableCellProps,
    Button,
    ButtonGroup,
} from '@mui/material';
import { getPlanningHistoryDetail, exportPlanning } from '../../lib/api';
import { PlanningLogDetailResponse, PlanRequest } from '../../lib/types';
import { isAxiosError } from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

const planRequestLabels: Partial<Record<keyof PlanRequest, string>> = {
    oa_codigo_oficial: "OA Código Oficial",
    recurso_principal: "Recurso Principal",
    nivel_real_estudiantes: "Nivel Real de los Estudiantes",
    materiales_disponibles: "Materiales Disponibles",
    duracion_clase_minutos: "Duración de la Clase (minutos)",
    numero_estudiantes: "Número de Estudiantes",
    diversidad_aula: "Diversidad en el Aula",
    clima_de_aula: "Clima de Aula",
    estilo_docente_preferido: "Estilo Docente Preferido",
    tipo_evaluacion_formativa: "Tipo de Evaluación Formativa",
    contexto_unidad: "Contexto de la Unidad",
    conocimientos_previos_requeridos: "Conocimientos Previos Requeridos",
    solicitud_especial: "Solicitud Especial",
};

export default function HistoryDetailPage() {
    const [detail, setDetail] = useState<PlanningLogDetailResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { status } = useSession();
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'pdf' | 'docx') => {
        if (!id) return;
        setIsExporting(true);
        try {
            const blob = await exportPlanning(id as string, format);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `planificacion_${id}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting planning:', error);
            setError('No se pudo generar la exportación. Inténtelo de nuevo.');
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }

        if (status === 'authenticated' && id) {
            const fetchDetail = async () => {
                try {
                    setLoading(true);
                    const data = await getPlanningHistoryDetail(id as string);
                    setDetail(data);
                } catch (err: unknown) {
                    if (isAxiosError(err) && err.response?.status === 404) {
                        setError('La planificación no fue encontrada o no tienes acceso a ella.');
                    } else {
                        setError('Error al cargar los detalles de la planificación.');
                    }
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };

            fetchDetail();
        }
    }, [status, id, router]);

    if (status === 'loading' || loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Detalle de Planificación
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {!error && !loading && detail && (
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
                            <Typography variant="h6" gutterBottom>Parámetros de la Solicitud</Typography>
                            <List dense>
                                {Object.entries(detail.plan_request_data).map(([key, value]) => (
                                    value && <ListItem key={key} disableGutters>
                                        <ListItemText
                                            primary={planRequestLabels[key as keyof PlanRequest]}
                                            secondary={value.toString()}
                                            primaryTypographyProps={{ fontWeight: 'bold' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Divider sx={{ my: 2 }} />
                             <Typography color="text.secondary">
                                Fecha de Creación: {new Date(detail.timestamp).toLocaleString()}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>Exportar</Typography>
                                <ButtonGroup variant="outlined" aria-label="outlined primary button group" disabled={isExporting}>
                                    <Button
                                        startIcon={isExporting ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
                                        onClick={() => handleExport('pdf')}
                                    >
                                        PDF
                                    </Button>
                                    <Button
                                        startIcon={isExporting ? <CircularProgress size={20} /> : <DescriptionIcon />}
                                        onClick={() => handleExport('docx')}
                                    >
                                        Word
                                    </Button>
                                </ButtonGroup>
                            </Box>
                            {detail.plan_request_data.multimodal_resources && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" mt={2}>
                                        Recursos Multimodales Utilizados
                                    </Typography>
                                    <Box mt={1}>
                                        {detail.plan_request_data.multimodal_resources.youtube_urls?.map((url, index) => (
                                            <Link key={index} href={url} target="_blank" rel="noopener noreferrer" display="block">
                                                {url}
                                            </Link>
                                        ))}
                                        {detail.plan_request_data.multimodal_resources.attachments?.map((attachment, index) => (
                                            <Chip key={index} label={attachment.filename} sx={{ mt: 1 }} />
                                        ))}
                                    </Box>
                                </>
                            )}
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper elevation={2} sx={{ p: 3, minHeight: '300px' }}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    br: () => <br />,
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
                                                pl: 0,
                                                mb: 2,
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
                                        <ListItem
                                            sx={{
                                                py: 0.5,
                                                px: 0,
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                listStyleType: 'none',
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: '28px',
                                                    mt: '3px',
                                                    alignItems: 'flex-start',
                                                    flexShrink: 0,
                                                }}
                                            >
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
                                                    component: 'div',
                                                    sx: { lineHeight: 1.8 }
                                                }}
                                                sx={{ margin: 0 }}
                                            />
                                        </ListItem>
                                    ),
                                    blockquote: ({ children }) => {
                                        const childrenText = String(children);
                                        const alertMatch = childrenText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*)$/);

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
                                                            <Typography variant="body2" component="div">
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    rehypePlugins={[rehypeRaw]}
                                                                    components={{ p: (props) => <span {...props} /> }}
                                                                >
                                                                    {content.trim()}
                                                                </ReactMarkdown>
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Alert>
                                            );
                                        }

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
                                            href={href || ''}
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
                                {detail.plan_markdown}
                            </ReactMarkdown>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
}
