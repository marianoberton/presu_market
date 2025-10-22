/**
 * Módulo para manejar el almacenamiento seguro de tokens OAuth de HubSpot
 * 
 * IMPORTANTE: En producción, los tokens deben almacenarse en:
 * - Base de datos encriptada
 * - Servicio de gestión de secretos (AWS Secrets Manager, Azure Key Vault, etc.)
 * - Variables de entorno seguras
 * 
 * NUNCA almacenar tokens en:
 * - LocalStorage del navegador
 * - Cookies no seguras
 * - Archivos de código fuente
 */

export interface TokenInfo {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  expires_at: number; // timestamp calculado
}

export interface TokenStorage {
  saveToken(userId: string, tokenInfo: TokenInfo): Promise<void>;
  getToken(userId: string): Promise<TokenInfo | null>;
  refreshToken(userId: string): Promise<TokenInfo | null>;
  revokeToken(userId: string): Promise<void>;
}

/**
 * Implementación básica usando variables de entorno
 * SOLO para desarrollo/testing - NO usar en producción
 */
export class EnvTokenStorage implements TokenStorage {
  async saveToken(userId: string, tokenInfo: TokenInfo): Promise<void> {
    // En desarrollo, solo logueamos
    console.log(`[DEV] Token guardado para usuario ${userId}`);
    console.log(`[DEV] Expira en: ${new Date(tokenInfo.expires_at).toISOString()}`);
    
    // TODO: Implementar almacenamiento real en base de datos
    // Ejemplo con Prisma:
    // await prisma.hubspotToken.upsert({
    //   where: { userId },
    //   update: { ...tokenInfo },
    //   create: { userId, ...tokenInfo }
    // });
  }

  async getToken(userId: string): Promise<TokenInfo | null> {
    // En desarrollo, retornamos null (usar token estático de .env)
    console.log(`[DEV] Obteniendo token para usuario ${userId}`);
    
    // TODO: Implementar recuperación real desde base de datos
    // return await prisma.hubspotToken.findUnique({ where: { userId } });
    
    return null;
  }

  async refreshToken(userId: string): Promise<TokenInfo | null> {
    const currentToken = await this.getToken(userId);
    
    if (!currentToken?.refresh_token) {
      return null;
    }

    try {
      const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.HUBSPOT_CLIENT_ID!,
          client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
          refresh_token: currentToken.refresh_token
        }).toString()
      });

      if (!response.ok) {
        throw new Error(`Error refreshing token: ${response.status}`);
      }

      const newTokenInfo = await response.json();
      const tokenWithExpiry = {
        ...newTokenInfo,
        expires_at: Date.now() + (newTokenInfo.expires_in * 1000)
      };

      await this.saveToken(userId, tokenWithExpiry);
      return tokenWithExpiry;

    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  async revokeToken(userId: string): Promise<void> {
    const token = await this.getToken(userId);
    
    if (!token) {
      return;
    }

    try {
      // Revocar token en HubSpot
      await fetch(`https://api.hubapi.com/oauth/v1/refresh-tokens/${token.refresh_token}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.access_token}`
        }
      });

      // TODO: Eliminar de base de datos
      // await prisma.hubspotToken.delete({ where: { userId } });
      
      console.log(`[DEV] Token revocado para usuario ${userId}`);

    } catch (error) {
      console.error('Error revoking token:', error);
    }
  }
}

// Instancia singleton para usar en toda la aplicación
export const tokenStorage = new EnvTokenStorage();

/**
 * Utility para verificar si un token está expirado
 */
export function isTokenExpired(tokenInfo: TokenInfo): boolean {
  return Date.now() >= tokenInfo.expires_at;
}

/**
 * Utility para obtener un token válido (refresh automático si es necesario)
 */
export async function getValidToken(userId: string): Promise<string | null> {
  const tokenInfo = await tokenStorage.getToken(userId);
  
  if (!tokenInfo) {
    return null;
  }

  // Si el token está expirado, intentar renovarlo
  if (isTokenExpired(tokenInfo)) {
    const refreshedToken = await tokenStorage.refreshToken(userId);
    return refreshedToken?.access_token || null;
  }

  return tokenInfo.access_token;
}