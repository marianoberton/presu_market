'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function HubSpotIntegrationContent() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');

  const handleOAuthConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_HUBSPOT_REDIRECT_URI || 'https://presu-market.vercel.app/oauth-callback');
    const scopes = encodeURIComponent('crm.objects.deals.read crm.objects.deals.write');
    
    if (!clientId) {
      setMessage('❌ Error: Client ID no configurado');
      return;
    }
    
    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}`;
    
    window.location.href = authUrl;
  };

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');

    if (success === 'true') {
      setMessage('✅ Integración completada exitosamente');
    } else if (error) {
      setMessage('❌ Error en la integración. Verifica la configuración.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🔗 Integración con HubSpot
            </h1>
            <p className="text-gray-600">
              Configuración básica para actualizar propiedades de deals
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">
                📋 Estado de la Integración
              </h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <span>Token de HubSpot configurado</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <span>Pipeline y stages configurados</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <span>Propiedades personalizadas listas</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔧 Funcionalidad Actual
              </h3>
              <p className="text-gray-700 mb-4">
                Al generar un presupuesto, el sistema actualiza automáticamente las propiedades 
                del deal en HubSpot con toda la información del presupuesto generado.
              </p>
              
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  🔐 Autorización OAuth
                </h4>
                <p className="text-gray-600 mb-4">
                  Para usar las funciones avanzadas de HubSpot, autoriza la aplicación:
                </p>
                <button
                  onClick={handleOAuthConnect}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Conectar con HubSpot
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HubSpotIntegrationPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <HubSpotIntegrationContent />
    </Suspense>
  );
}