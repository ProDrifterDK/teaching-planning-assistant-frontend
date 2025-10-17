### Prompt para el Desarrollador de Backend

**Asunto:** Implementación de API para Exportar Planificaciones a PDF y DOCX

**Objetivo:**

Crear un nuevo endpoint en la API que permita convertir una planificación de clase (almacenada en formato Markdown) a un archivo PDF o DOCX y enviarlo al cliente para su descarga.

**Contexto del Proyecto:**

-   **Framework:** FastAPI
-   **ORM:** SQLAlchemy con modelos Pydantic
-   **Autenticación:** JWT (HTTPOnly cookies gestionadas por `fastapi-users`)
-   **Modelo de datos relevante:** `PlanningLog` (o similar), que contiene un campo `plan_response_markdown` con el contenido a convertir.

**Requisitos Funcionales:**

1.  **Crear un nuevo endpoint:**
    -   **Ruta:** `/api/v1/export/plan/{planning_id}`
    -   **Método:** `GET`
    -   **Parámetros de Path:** `planning_id: int`
    -   **Parámetros de Query:** `format: str` (valores permitidos: 'pdf', 'docx').

2.  **Seguridad:**
    -   El endpoint debe estar protegido y solo ser accesible para usuarios autenticados.
    -   Se debe verificar que el usuario que realiza la solicitud es el propietario de la planificación (`planning_id`) que intenta exportar.

3.  **Lógica del Endpoint:**
    -   Recuperar el objeto `PlanningLog` de la base de datos usando el `planning_id`.
    -   Si no se encuentra o el usuario no es el propietario, devolver un error `404 Not Found`.
    -   Extraer el contenido del campo `plan_response_markdown`.
    -   Utilizar la librería `pypandoc` (un wrapper de Python para Pandoc) para convertir el string de Markdown al formato especificado por el parámetro `format`.
        -   Ejemplo de uso: `pypandoc.convert_text(markdown_string, format, format='md')`
    -   Configurar adecuadamente las cabeceras de la respuesta para que el navegador inicie una descarga.
        -   **`Content-Type`:**
            -   Para PDF: `application/pdf`
            -   Para DOCX: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
        -   **`Content-Disposition`:**
            -   `attachment; filename="planificacion_{planning_id}.{format}"`
    -   Devolver el archivo convertido como una `StreamingResponse` o `FileResponse` de FastAPI.

**Dependencias:**

-   Asegúrate de que `pandoc` esté instalado en el entorno de ejecución del servidor (ej. `sudo apt-get install pandoc` en Debian/Ubuntu).
-   Añade `pypandoc` a los requisitos del proyecto (ej. `requirements.txt` o `pyproject.toml`).

**Ejemplo de implementación (esqueleto en FastAPI):**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse
import pypandoc
import io

from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/export/plan/{planning_id}")
def export_planning(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    planning_id: int,
    format: str = Query(..., regex="^(pdf|docx)$")
):
    """
    Export a planning log to a specified format (PDF or DOCX).
    """
    planning_log = db.query(models.PlanningLog).filter(
        models.PlanningLog.id == planning_id,
        models.PlanningLog.owner_id == current_user.id
    ).first()

    if not planning_log:
        raise HTTPException(status_code=404, detail="Planning not found or access denied")

    markdown_content = planning_log.plan_response_markdown

    try:
        if format == "pdf":
            # You might need extra args for LaTeX engine if default fails
            output = pypandoc.convert_text(markdown_content, 'pdf', format='md')
            media_type = "application/pdf"
        else: # docx
            output = pypandoc.convert_text(markdown_content, 'docx', format='md')
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        filename = f"planificacion_{planning_id}.{format}"
        
        return StreamingResponse(
            io.BytesIO(output),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        # Log the error properly in a real application
        print(f"Error during document conversion: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate the document")

```

Por favor, revisa y adapta este esqueleto según la estructura específica del proyecto. ¡Gracias!