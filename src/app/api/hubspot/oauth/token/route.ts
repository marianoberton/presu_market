import { NextRequest, NextResponse } from 'next/server';

interface TokenRequest {
  code: string;
  state?: string;
}

interface HubSpotTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export async function POST(request: NextRequest) {
  try {
    const { code }: TokenRequest = await request.json();

    // Validar que tenemos el código
    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'Código de autorización requerido'
      }, { status: 400 });
    }

    // Obtener credenciales de HubSpot desde variables de entorno
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
    const redirectUri = process.env.HUBSPOT_REDIRECT_URI || 'https://presu-market.vercel.app/oauth-callback';

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Credenciales de HubSpot no configuradas'
      }, { status: 500 });
    }

    // Preparar datos para el intercambio de token
    const tokenData = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: code
    });

    // Intercambiar código por token
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenData.toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Error al obtener token de HubSpot:', errorText);
      
      return NextResponse.json({
        success: false,
        error: `Error al obtener token: ${tokenResponse.status} - ${errorText}`
      }, { status: tokenResponse.status });
    }

    const tokenInfo: HubSpotTokenResponse = await tokenResponse.json();

    // Almacenar token de forma segura
    const tokenWithExpiry = {
      ...tokenInfo,
      expires_at: Date.now() + (tokenInfo.expires_in * 1000)
    };

    // TODO: Implementar identificación de usuario real
    // Por ahora usamos un ID genérico para desarrollo
    const userId = 'default-user';
    
    const { tokenStorage } = await import('@/lib/oauth-storage');
    await tokenStorage.saveToken(userId, tokenWithExpiry);
    
    console.log('Token de acceso almacenado exitosamente');
    console.log('Expires at:', new Date(tokenWithExpiry.expires_at).toISOString());

    // IMPORTANTE: En producción, NO devuelvas el token al cliente
    // Este es solo para propósitos de desarrollo/testing
    return NextResponse.json({
      success: true,
      message: 'Token obtenido exitosamente',
      // En producción, remover esta línea:
      tokenInfo: process.env.NODE_ENV === 'development' ? tokenInfo : undefined
    });

  } catch (error) {
    console.error('Error en OAuth token exchange:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 500 });
  }
}

// TODO: Implementar endpoint GET para verificar estado del token
// TODO: Implementar refresh token logic
// TODO: Implementar almacenamiento seguro de tokens