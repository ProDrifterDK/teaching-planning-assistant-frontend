import { getServerSession } from "next-auth";
import SelectorCurricular from "./components/SelectorCurricular";
import { Nivel } from "./lib/types";
import { Container, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";

async function getNiveles(accessToken: string): Promise<Nivel[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/curriculum/niveles`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'force-cache'
  });
  if (!res.ok) throw new Error('Failed to fetch niveles');
  return res.json();
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  const niveles = await getNiveles(session.accessToken as string);
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Planificador de Clases
      </Typography>
      <SelectorCurricular niveles={niveles} />
    </Container>
  );
}
