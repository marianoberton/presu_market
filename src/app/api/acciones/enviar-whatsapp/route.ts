import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealId, presuId } = body;

    if (!dealId || !presuId) {
      return NextResponse.json(
        { ok: false, error: 'dealId y presuId son requeridos' },
        { status: 400 }
      );
    }

    // Aquí puedes implementar la lógica para enviar por WhatsApp
    // Por ejemplo, integrar con una API de WhatsApp Business
    console.log(`Enviando presupuesto ${presuId} del deal ${dealId} por WhatsApp`);

    // Simular el envío exitoso
    // En una implementación real, aquí harías la llamada a la API de WhatsApp
    const success = true;

    if (success) {
      return NextResponse.json({
        ok: true,
        success: true,
        message: `Presupuesto ${presuId} enviado exitosamente por WhatsApp`
      });
    } else {
      return NextResponse.json(
        { ok: false, error: 'Error al enviar por WhatsApp' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en /api/acciones/enviar-whatsapp:', error);
    return NextResponse.json(
      { ok: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}