import { getServerSession } from "next-auth";
import SelectorCurricular from "./components/SelectorCurricular";
import { Nivel } from "./lib/types";
import { Container, Typography, Alert } from "@mui/material";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";

type NivelesResponse = {
  data: Nivel[] | null;
  error: string | null;
}

type RawAsignaturas = string[];
type RawCursos = Record<string, RawAsignaturas>;
type RawNiveles = Record<string, RawCursos>;

async function getNiveles(accessToken: string): Promise<NivelesResponse> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/curriculum/niveles`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { data: null, error: "SESSION_EXPIRED" };
      }
      const errorData = await res.json();
      console.error("API Error:", errorData);
      return { data: null, error: errorData.detail || "Your account may not be active yet, or there may be a server issue." };
    }

    const rawData: RawNiveles = await res.json();
    const transformedData: Nivel[] = Object.entries(rawData).map(([nivelNombre, cursosData]) => ({
      nombre: nivelNombre,
      cursos: Object.entries(cursosData).map(([cursoNombre, asignaturasData]) => ({
        nombre: cursoNombre,
        asignaturas: Array.isArray(asignaturasData)
          ? asignaturasData.map((asignaturaNombre) => ({
              nombre: asignaturaNombre,
            }))
          : [],
      })),
    }));
    return { data: transformedData, error: null };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { data: null, error: "Could not connect to the server. Please try again later." };
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  const { data: niveles, error } = await getNiveles(session.accessToken as string);

  if (error === "SESSION_EXPIRED") {
    redirect('/api/auth/signin?error=Your session has expired. Please log in again.');
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Planificador de Clases
      </Typography>
      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <SelectorCurricular niveles={niveles || []} />
      )}
    </Container>
  );
}
