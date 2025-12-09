import { auth } from "@/auth";
import SelectorCurricular from "./components/SelectorCurricular";
import { Curso } from "./lib/types";
import { Container, Typography, Alert, Box } from "@mui/material";
import { redirect } from "next/navigation";
import Image from "next/image";

type NivelesResponse = {
  data: Curso[] | null;
  error: string | null;
}

type RawData = Record<string, string[]>;

async function getCursos(accessToken: string): Promise<NivelesResponse> {
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

    const rawData: RawData = await res.json();
    console.log("Raw API Response:", JSON.stringify(rawData, null, 2));
    const transformedData: Curso[] = Object.entries(rawData).map(([cursoNombre, asignaturasData]) => ({
      nombre: cursoNombre,
      asignaturas: Array.isArray(asignaturasData)
        ? asignaturasData.map((asignaturaNombre) => ({
            nombre: asignaturaNombre,
          }))
        : [],
    }));
    return { data: transformedData, error: null };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { data: null, error: "Could not connect to the server. Please try again later." };
  }
}

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  const { data: cursos, error } = await getCursos(session.accessToken as string);

  if (error === "SESSION_EXPIRED") {
    redirect('/auth/signin');
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Planificador de Clases
      </Typography>
      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <SelectorCurricular cursos={cursos || []} />
      )}
    </Container>
  );
}
