'use client';

export default function HubSpotIntegration() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <img 
              src="/hubspot-1.svg" 
              alt="HubSpot" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Integración con HubSpot
            </h1>
            <p className="text-gray-600">
              Actualización de deals con información del presupuesto
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-orange-800 mb-2">
              🚧 En Desarrollo
            </h2>
            <p className="text-orange-700">
              Esta funcionalidad está actualmente en desarrollo. Se enfocará en actualizar 
              los deals existentes en HubSpot con la información del presupuesto generado.
            </p>
          </div>

          <div className="text-left space-y-4">
            <h3 className="font-semibold text-gray-900">Funcionalidad principal:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Actualizar deals creados con información del presupuesto</li>
              <li>Sincronizar datos del cliente y productos</li>
              <li>Adjuntar el PDF del presupuesto al deal</li>
              <li>Actualizar el valor total del deal</li>
            </ul>
          </div>

          <div className="mt-8">
            <button 
              onClick={() => window.close()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}