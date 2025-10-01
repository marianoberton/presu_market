'use client';

import { ProductoData, CALIDAD_OPTIONS, COLOR_OPTIONS, DEFAULT_PRODUCT_VALUES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { calcularSubtotalProducto, formatearMoneda, generarIdProducto, calcularPrecioUnitario } from '@/lib/calculations';
import { MedidasProduccion } from './medidas-produccion';

interface ProductosFormProps {
  productos: ProductoData[];
  onChange: (productos: ProductoData[]) => void;
}

export function ProductosForm({ productos, onChange }: ProductosFormProps) {
  const agregarProducto = () => {
    const nuevoProducto: ProductoData = {
      id: generarIdProducto(),
      descripcion: '',
      largo: 0,
      ancho: 0,
      alto: 0,
      calidad: DEFAULT_PRODUCT_VALUES.calidad,
      color: DEFAULT_PRODUCT_VALUES.color,
      cantidad: 1,
      precio: DEFAULT_PRODUCT_VALUES.precio,
      remarcacion: DEFAULT_PRODUCT_VALUES.remarcacion,
      precioUnitario: 0,
      subtotal: 0
    };
    onChange([...productos, nuevoProducto]);
  };

  const eliminarProducto = (id: string) => {
    onChange(productos.filter(p => p.id !== id));
  };

  const actualizarProducto = (id: string, campo: keyof ProductoData, valor: string | number) => {
    const productosActualizados = productos.map(producto => {
      if (producto.id === id) {
        const productoActualizado = { ...producto, [campo]: valor };
        
        // Recalcular precio unitario automáticamente cuando cambien las dimensiones, precio o remarcación
        if (campo === 'largo' || campo === 'ancho' || campo === 'alto' || campo === 'precio' || campo === 'remarcacion') {
          productoActualizado.precioUnitario = calcularPrecioUnitario(
            productoActualizado.largo,
            productoActualizado.ancho,
            productoActualizado.alto,
            productoActualizado.precio,
            productoActualizado.remarcacion
          );
        }
        
        // Recalcular subtotal automáticamente
        productoActualizado.subtotal = calcularSubtotalProducto(productoActualizado.cantidad, productoActualizado.precioUnitario);
        return productoActualizado;
      }
      return producto;
    });
    onChange(productosActualizados);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Productos</CardTitle>
          <Button onClick={agregarProducto} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {productos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay productos agregados</p>
            <p className="text-sm">Haga clic en "Agregar Producto" para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {productos.map((producto, index) => (
              <div key={producto.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Producto {index + 1}</h4>
                  <Button
                    onClick={() => eliminarProducto(producto.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Descripción - Ocupa 2 columnas en desktop */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción *
                    </label>
                    <Input
                      value={producto.descripcion}
                      onChange={(e) => actualizarProducto(producto.id, 'descripcion', e.target.value)}
                      placeholder="Descripción del producto"
                      className="w-full"
                    />
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={producto.cantidad}
                      onChange={(e) => actualizarProducto(producto.id, 'cantidad', parseInt(e.target.value) || 1)}
                      className="w-full"
                    />
                  </div>

                  {/* Precio Unitario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario (Calculado Automáticamente)
                    </label>
                    <Input
                      type="text"
                      value={formatearMoneda(producto.precioUnitario)}
                      readOnly
                      className="w-full bg-gray-100 cursor-not-allowed"
                      placeholder="Se calcula automáticamente"
                    />
                  </div>
                </div>

                {/* Segunda fila - Dimensiones */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Largo (cm)
                    </label>
                    <Input
                      type="text"
                      value={producto.largo === 0 ? '' : producto.largo.toString()}
                      onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === '' || /^\d*\.?\d*$/.test(valor)) {
                          const numeroValor = valor === '' ? 0 : parseFloat(valor);
                          actualizarProducto(producto.id, 'largo', isNaN(numeroValor) ? 0 : numeroValor);
                        }
                      }}
                      placeholder="0.0"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ancho (cm)
                    </label>
                    <Input
                      type="text"
                      value={producto.ancho === 0 ? '' : producto.ancho.toString()}
                      onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === '' || /^\d*\.?\d*$/.test(valor)) {
                          const numeroValor = valor === '' ? 0 : parseFloat(valor);
                          actualizarProducto(producto.id, 'ancho', isNaN(numeroValor) ? 0 : numeroValor);
                        }
                      }}
                      placeholder="0.0"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alto (cm)
                    </label>
                    <Input
                      type="text"
                      value={producto.alto === 0 ? '' : producto.alto.toString()}
                      onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === '' || /^\d*\.?\d*$/.test(valor)) {
                          const numeroValor = valor === '' ? 0 : parseFloat(valor);
                          actualizarProducto(producto.id, 'alto', isNaN(numeroValor) ? 0 : numeroValor);
                        }
                      }}
                      placeholder="0.0"
                      className="w-full"
                    />
                  </div>

                  {/* Calidad en Libras */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calidad en Libras
                    </label>
                    <Select
                      value={producto.calidad}
                      onValueChange={(value) => actualizarProducto(producto.id, 'calidad', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar calidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {CALIDAD_OPTIONS.map((opcion) => (
                          <SelectItem key={opcion} value={opcion}>
                            {opcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Color del Papel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color del Papel
                    </label>
                    <Select
                      value={producto.color}
                      onValueChange={(value) => actualizarProducto(producto.id, 'color', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar color" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((opcion) => (
                          <SelectItem key={opcion} value={opcion}>
                            {opcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subtotal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtotal
                    </label>
                    <div className="px-3 py-2 bg-gray-100 border rounded-md text-right font-medium">
                      {formatearMoneda(producto.subtotal)}
                    </div>
                  </div>
                </div>

                {/* Medidas de Producción */}
                <div className="mt-4">
                  <MedidasProduccion 
                    largo={producto.largo}
                    ancho={producto.ancho}
                    alto={producto.alto}
                    precio={producto.precio}
                    remarcacion={producto.remarcacion}
                    onPrecioChange={(precio) => actualizarProducto(producto.id, 'precio', precio)}
                    onRemarcacionChange={(remarcacion) => actualizarProducto(producto.id, 'remarcacion', remarcacion)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}