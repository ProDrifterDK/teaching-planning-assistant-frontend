import FormularioPlanificacion from "@/app/components/FormularioPlanificacion";
import { Eje } from "@/app/lib/types";
import { Container, Typography } from "@mui/material";

async function getOAs(curso: string, asignatura: string): Promise<Eje[] | undefined> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/curriculum/oas?curso=${encodeURIComponent(curso)}&asignatura=${encodeURIComponent(asignatura)}`);
  if (!res.ok) return;
  return res.json();
}

interface PageProps {
  params: { curso: string; asignatura: string };
  searchParams: { selectedOA?: string };
}

export default async function PlanificarPage({ params: { curso, asignatura }, searchParams }: PageProps) {
  const decodedCurso = decodeURIComponent(curso);
  const decodedAsignatura = decodeURIComponent(asignatura);

  const ejesConOAs = await getOAs(decodedCurso, decodedAsignatura);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Planificar para {decodedCurso} - {decodedAsignatura}
      </Typography>
      <FormularioPlanificacion ejes={ejesConOAs || []} selectedOA_initial={searchParams.selectedOA} />
    </Container>
  );
}