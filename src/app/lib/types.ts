export interface Asignatura {
  nombre: string;
}

export interface Curso {
  nombre: string;
  asignaturas: Asignatura[];
}

export interface Nivel {
  nombre: string;
  cursos: Curso[];
}

export interface OA {
  oa_codigo_oficial: string;
  descripcion_oa: string;
  desglose_componentes?: string[];
  habilidades?: string[];
}

export interface Eje {
  nombre_eje: string;
  oas: OA[];
}

export interface PlanRequest {
  oa_codigo_oficial: string;
  recurso_principal: string;
  nivel_real_estudiantes: string;
  materiales_disponibles?: string;
  duracion_clase_minutos?: number;
  numero_estudiantes?: number;
  diversidad_aula?: string;
  clima_de_aula?: string;
  estilo_docente_preferido?: string;
  tipo_evaluacion_formativa?: string;
  contexto_unidad?: string;
  conocimientos_previos_requeridos?: string;
  solicitud_especial?: string;
  multimodal_resources?: {
    youtube_urls?: string[];
    attachments?: {
      filename: string;
      gemini_uri: string;
    }[];
  };
}

export interface User {
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  role: string;
}

export interface UserCreate {
  username: string;
  email: string;
  full_name?: string;
  password?: string;
}

export interface UserSummary {
  username: string;
  total_cost: number;
  total_plannings: number;
  is_active: boolean;
  role: string;
}

export interface AdminDashboardStats {
  total_users: number;
  total_system_cost: number;
  total_system_plannings: number;
  users_summary: UserSummary[];
}

export interface PlanningLogResponse {
  id: number;
  oa_codigo: string;
  timestamp: string;
}

export interface PlanningLogDetailResponse {
  id: number;
  oa_codigo: string;
  cost: number;
  timestamp: string;
  input_tokens: number;
  output_tokens: number;
  thought_tokens: number;
  plan_request_data: PlanRequest;
  plan_markdown: string;
}