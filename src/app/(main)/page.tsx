import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calculator, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido al Panel de Control</h1>
        <p className="text-gray-500 mt-2">Selecciona una herramienta para comenzar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/presupuestador" className="block group">
          <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-blue-500 cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <Calculator className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <CardTitle className="text-xl">Generador de Presupuestos</CardTitle>
              <CardDescription>
                Crea presupuestos profesionales, calcula costos y genera PDFs para tus clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm text-blue-600 font-medium group-hover:underline">Ir al generador &rarr;</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/encuestas" className="block group">
          <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-green-500 cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                <ClipboardList className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <CardTitle className="text-xl">Encuestas de Satisfacción</CardTitle>
              <CardDescription>
                Gestiona y envía encuestas de satisfacción a clientes con deals ganados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm text-green-600 font-medium group-hover:underline">Ir a encuestas &rarr;</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
