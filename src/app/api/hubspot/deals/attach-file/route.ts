import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types/presupuesto';

interface AttachFileRequest {
  dealId: string;
  fileId: string;
  fileName: string;
  noteBody?: string;
}

interface HubSpotNoteResponse {
  id: string;
  properties: {
    hs_note_body: string;
    hs_timestamp: string;
    hs_attachment_ids: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const token = process.env.HUBSPOT_TOKEN;

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token de HubSpot no configurado',
        status: 500
      }, { status: 500 });
    }

    const { dealId, fileId, fileName, noteBody }: AttachFileRequest = await request.json();

    if (!dealId || !fileId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'dealId y fileId son requeridos',
        status: 400
      }, { status: 400 });
    }

    // Paso 1: Crear una nota con el archivo adjunto
    const noteData = {
      properties: {
        hs_timestamp: Date.now().toString(),
        hs_note_body: noteBody || `Presupuesto generado: ${fileName}`,
        hs_attachment_ids: fileId
      },
      associations: [
        {
          to: {
            id: dealId
          },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 214 // Note to Deal association
            }
          ]
        }
      ]
    };

    // Crear la nota con el archivo adjunto y asociarla al deal
    const noteResponse = await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(noteData)
    });

    if (!noteResponse.ok) {
      const errorText = await noteResponse.text();
      console.error('Error al crear nota con archivo adjunto:', errorText);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Error al crear nota: ${noteResponse.status} - ${errorText}`,
        status: noteResponse.status
      }, { status: noteResponse.status });
    }

    const noteResult: HubSpotNoteResponse = await noteResponse.json();

    return NextResponse.json<ApiResponse<{
      noteId: string;
      dealId: string;
      fileId: string;
      message: string;
    }>>({
      success: true,
      data: {
        noteId: noteResult.id,
        dealId,
        fileId,
        message: `Archivo ${fileName} adjuntado exitosamente al Deal ${dealId}`
      }
    });

  } catch (error) {
    console.error('Error al adjuntar archivo al deal:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      status: 500
    }, { status: 500 });
  }
}