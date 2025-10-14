import FormularioPlanificacion from "@/app/components/FormularioPlanificacion";
import { Eje } from "@/app/lib/types";
import { Container, Typography } from "@mui/material";

async function getOAs(curso: string, asignatura: string): Promise<Eje[] | undefined> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/curriculum/oas?curso=${encodeURIComponent(curso)}&asignatura=${encodeURIComponent(asignatura)}`);
  if (!res.ok) return;
  return res.json();
}

export default async function PlanificarPage({ params }: { params: { curso: string; asignatura: string } }) {
  const ejesConOAs = await getOAs(decodeURIComponent(params.curso), decodeURIComponent(params.asignatura));

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Planificar para {decodeURIComponent(params.curso)} - {decodeURIComponent(params.asignatura)}
      </Typography>
      <FormularioPlanificacion ejes={ejesConOAs || []} />
    </Container>
  );
}