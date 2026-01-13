'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, Check, RefreshCcw, Loader2 } from 'lucide-react';

interface WonDeal {
  id: string;
  name: string;
  client: string;
  amount: number;
  date: string;
}

export default function EncuestasPage() {
  const [deals, setDeals] = useState<WonDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoTrigger, setAutoTrigger] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch('/api/hubspot/deals?stage=won');
        const data = await res.json();
        
        if (data.success && data.data?.results) {
          const mappedDeals = data.data.results.map((d: any) => ({
            id: d.id,
            name: d.properties.dealname,
            client: d.properties.mp_cliente_nombre || d.properties.mp_cliente_empresa || 'Cliente Desconocido',
            amount: d.properties.amount ? parseFloat(d.properties.amount) : 0,
            date: d.properties.closedate ? new Date(d.properties.closedate).toLocaleDateString('es-AR') : '-'
          }));
          setDeals(mappedDeals);
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const handleSendSurvey = async (id: string) => {
    setSendingId(id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSentIds(prev => [...prev, id]);
    setSendingId(null);
    alert(`Encuesta enviada exitosamente al cliente del deal ${id}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Encuestas de Satisfacción</h1>
          <p className="text-gray-500">Gestiona y envía encuestas a clientes con deals ganados.</p>
        </div>
        
        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Envío Automático</span>
              <span className="text-xs text-gray-500">Al mover deal a "Ganado"</span>
            </div>
            <div 
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${autoTrigger ? 'bg-blue-600' : 'bg-gray-200'}`}
              onClick={() => setAutoTrigger(!autoTrigger)}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoTrigger ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Deals List */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deals Ganados Recientes</CardTitle>
              <CardDescription>Selecciona un deal para enviar la encuesta manualmente.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{deal.name}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-2">
                          <span>{deal.client}</span>
                          <span>•</span>
                          <span>${deal.amount.toLocaleString()}</span>
                          <span>•</span>
                          <span>{deal.date}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleSendSurvey(deal.id)}
                        disabled={sendingId === deal.id || sentIds.includes(deal.id)}
                        className={sentIds.includes(deal.id) ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {sendingId === deal.id ? (
                          <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                        ) : sentIds.includes(deal.id) ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {sendingId === deal.id ? 'Enviando...' : sentIds.includes(deal.id) ? 'Enviada' : 'Enviar'}
                      </Button>
                    </div>
                  ))}
                  {deals.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No se encontraron deals ganados.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Survey Mockup */}
        <div className="space-y-6">
          <Card className="bg-slate-50 border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-center text-blue-600">Vista Previa de la Encuesta</CardTitle>
              <CardDescription className="text-center">Así es como el cliente verá la encuesta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto border">
                <div className="text-center space-y-4 mb-6">
                  <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Star className="h-6 w-6 fill-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">¡Tu opinión nos importa!</h2>
                  <p className="text-gray-600 text-sm">
                    Hola <strong>Usuario</strong>, gracias por confiar en Market Paper. 
                    ¿Cómo calificarías tu experiencia con nuestro proceso de presupuesto?
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Calificación General</Label>
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="p-1 hover:scale-110 transition-transform focus:outline-none">
                          <Star className={`h-8 w-8 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">¿Qué podríamos mejorar?</Label>
                    <Textarea 
                      id="feedback" 
                      placeholder="Escribe tus comentarios aquí..." 
                      className="resize-none"
                    />
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Enviar Respuesta
                  </Button>
                </div>
                
                <div className="mt-6 text-center text-xs text-gray-400">
                  Powered by Market Paper
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
