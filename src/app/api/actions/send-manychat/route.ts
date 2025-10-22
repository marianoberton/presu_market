import { NextRequest, NextResponse } from 'next/server';
import { SendManyChatRequest, ActionResponse } from '@/lib/types/actions';

const MANYCHAT_WEBHOOK_URL = process.env.MANYCHAT_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  try {
    // Validar que el webhook de ManyChat esté configurado
    if (!MANYCHAT_WEBHOOK_URL) {
      return NextResponse.json({
        ok: false,
        error: 'MANYCHAT_WEBHOOK_URL no configurado'
      } as ActionResponse);
    }

    // Parsear el cuerpo de la petición
    let body: SendManyChatRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({
        ok: false,
        error: 'JSON inválido en el cuerpo de la petición'
      } as ActionResponse);
    }

    const { dealId, clienteTelefono: telefono, pdfUrl } = body;

    // Validar campos requeridos
    if (!dealId || !telefono || !pdfUrl) {
      return NextResponse.json({
        ok: false,
        error: 'dealId, telefono y pdfUrl son requeridos'
      } as ActionResponse);
    }

    // Validar formato de teléfono (básico)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(telefono)) {
      return NextResponse.json({
        ok: false,
        error: 'Formato de teléfono inválido'
      } as ActionResponse);
    }

    // Preparar payload para ManyChat
    const manyChatPayload = {
      phone: telefono.replace(/[\s\-\(\)]/g, ''), // Limpiar formato del teléfono
      pdf_url: pdfUrl,
      deal_id: dealId,
      timestamp: new Date().toISOString()
    };

    // Enviar a ManyChat
    const manyChatResponse = await fetch(MANYCHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(manyChatPayload),
    });

    if (!manyChatResponse.ok) {
      const errorText = await manyChatResponse.text();
      console.error('Error de ManyChat:', errorText);
      
      return NextResponse.json({
        ok: false,
        error: `Error en ManyChat: ${manyChatResponse.status} - ${errorText}`
      } as ActionResponse);
    }

    // Respuesta exitosa
    return NextResponse.json({
      ok: true
    } as ActionResponse);

  } catch (error) {
    console.error('Error en send-manychat:', error);
    return NextResponse.json({
      ok: false,
      error: 'Error interno del servidor'
    } as ActionResponse, { status: 500 });
  }
}

// TODO: Agregar logs de auditoría para tracking de envíos
// TODO: Implementar retry logic para fallos temporales de ManyChat
// TODO: Validar que el PDF sea accesible antes de enviar