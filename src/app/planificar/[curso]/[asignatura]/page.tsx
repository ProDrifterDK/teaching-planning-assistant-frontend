import FormularioPlanificacion from "@/app/components/FormularioPlanificacion";
import { Eje } from "@/app/lib/types";
import { Container, Typography, Tooltip } from "@mui/material";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function getOAs(curso: string, asignatura: string, accessToken: string): Promise<Eje[] | undefined> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/curriculum/oas?curso=${encodeURIComponent(curso)}&asignatura=${encodeURIComponent(asignatura)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) return;
  return res.json();
}

interface PageProps {
  params: Promise<{ curso: string; asignatura: string }>;
  searchParams: Promise<{ selectedOA?: string }>;
}

export default async function PlanificarPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { curso, asignatura } = params;

  const session = await auth();
  if (!session) {
    redirect('/auth/signin');
  }

  const decodedCurso = decodeURIComponent(curso);
  const decodedAsignatura = decodeURIComponent(asignatura);

  const ejesConOAs = await getOAs(decodedCurso, decodedAsignatura, session.accessToken as string);

  const selectedOAObject = ejesConOAs
    ?.flatMap(eje => eje.oas)
    .find(oa => oa.oa_codigo_oficial === searchParams.selectedOA);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Planificar para {decodedCurso} - {decodedAsignatura}
      </Typography>
      {searchParams.selectedOA && (
        <Tooltip title={selectedOAObject?.descripcion_oa || ''} arrow>
          <Typography variant="subtitle1" component="h2" gutterBottom align="center" sx={{ color: 'text.secondary', cursor: 'help' }}>
            {decodeURIComponent(searchParams.selectedOA)}
          </Typography>
        </Tooltip>
      )}
      <FormularioPlanificacion ejes={ejesConOAs || []} selectedOA_initial={searchParams.selectedOA} curso={decodedCurso} sx={{ mb: 8 }} />
    </Container>
  );
}