import { NextRequest, NextResponse } from 'next/server';
import { HubSpotFileUploadResponse, ApiResponse } from '@/lib/types/presupuesto';

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

    // Obtener el archivo del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No se proporcionó ningún archivo',
        status: 400
      }, { status: 400 });
    }

    // Validar que sea un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Solo se permiten archivos PDF',
        status: 400
      }, { status: 400 });
    }

    // Validar tamaño (máximo 100MB para HubSpot)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 100MB permitido.',
        status: 400
      }, { status: 400 });
    }

    // Preparar FormData para HubSpot
    const hubspotFormData = new FormData();
    hubspotFormData.append('file', file);
    hubspotFormData.append('fileName', fileName || file.name);
    hubspotFormData.append('folderPath', '/presupuestos'); // Usar folderPath en lugar de folderId
    hubspotFormData.append('options', JSON.stringify({
      access: 'PUBLIC_NOT_INDEXABLE',
      ttl: 'P3M', // 3 meses de duración
      overwrite: false
    }));

    // Subir a HubSpot Files API
    const response = await fetch('https://api.hubapi.com/files/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: hubspotFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al subir archivo a HubSpot:', errorText);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Error al subir archivo: ${response.status} - ${errorText}`,
        status: response.status
      }, { status: response.status });
    }

    const fileData: HubSpotFileUploadResponse = await response.json();

    return NextResponse.json<ApiResponse<HubSpotFileUploadResponse>>({
      success: true,
      data: fileData
    });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      status: 500
    }, { status: 500 });
  }
}