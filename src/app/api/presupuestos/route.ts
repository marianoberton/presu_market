import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('dealId');

    if (!dealId) {
      return NextResponse.json(
        { ok: false, error: 'dealId es requerido' },
        { status: 400 }
      );
    }

    // Aquí puedes implementar la lógica para obtener presupuestos
    // Por ahora devolvemos datos de ejemplo
    const presupuestos = [
      {
        id: `presu-${dealId}-001`,
        fecha: new Date().toISOString().split('T')[0],
        total: '$1,250.00',
        estado: 'Pendiente',
        dealId: dealId
      },
      {
        id: `presu-${dealId}-002`,
        fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        total: '$890.00',
        estado: 'Enviado',
        dealId: dealId
      }
    ];

    return NextResponse.json({
      ok: true,
      items: presupuestos
    });

  } catch (error) {
    console.error('Error en /api/presupuestos:', error);
    return NextResponse.json(
      { ok: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}