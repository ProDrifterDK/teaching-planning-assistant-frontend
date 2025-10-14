import SelectorCurricular from "./components/SelectorCurricular";
import { Nivel } from "./lib/types";
import { Container, Typography } from "@mui/material";

async function getNiveles(): Promise<Nivel[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/curriculum/niveles`, {
    cache: 'force-cache'
  });
  if (!res.ok) throw new Error('Failed to fetch niveles');
  return res.json();
}

export default async function HomePage() {
  const niveles = await getNiveles();
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Planificador de Clases
      </Typography>
      <SelectorCurricular niveles={niveles} />
    </Container>
  );
}
