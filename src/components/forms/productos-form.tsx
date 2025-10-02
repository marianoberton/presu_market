'use client';

import { ProductoData, CALIDAD_OPTIONS, COLOR_OPTIONS, DEFAULT_PRODUCT_VALUES, TIPO_PRODUCTO_OPTIONS, DESCRIPCION_OPTIONS } from '@/lib/types';
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
      tipo: DEFAULT_PRODUCT_VALUES.tipo,
      largo: 0,
      ancho: 0,
      alto: 0,
      calidad: DEFAULT_PRODUCT_VALUES.calidad,
      color: DEFAULT_PRODUCT_VALUES.color,
      cantidad: 1,
      precio: DEFAULT_PRODUCT_VALUES.precio,
      remarcacion: DEFAULT_PRODUCT_VALUES.remarcacion,
      precioUnitario: 0,
      subtotal: 0,
      colores: 1,
      aCotizar: false
    };
    onChange([...productos, nuevoProducto]);
  };

  const eliminarProducto = (id: string) => {
    onChange(productos.filter(p => p.id !== id));
  };

  const actualizarProducto = (id: string, campo: keyof ProductoData, valor: string | number | boolean) => {
    const productosActualizados = productos.map(producto => {
      if (producto.id === id) {
        const productoActualizado = { ...producto, [campo]: valor };
        
        // Lógica especial para polímero
        if (campo === 'tipo' && valor === 'polimero') {
          productoActualizado.cantidad = 1; // Cantidad fija en 1
          productoActualizado.aCotizar = true; // Marcar como "A COTIZAR"
          productoActualizado.precio = 0; // Precio en 0 porque es a cotizar
          productoActualizado.colores = productoActualizado.colores || 1; // Default 1 color
        } else if (campo === 'tipo' && valor !== 'polimero') {
          productoActualizado.aCotizar = false; // Desmarcar "A COTIZAR"
        }
        
        // Recalcular precio unitario automáticamente cuando cambien las dimensiones, precio o remarcación
        // Pero no para productos "A COTIZAR"
        if (!productoActualizado.aCotizar && (campo === 'largo' || campo === 'ancho' || campo === 'alto' || campo === 'precio' || campo === 'remarcacion' || campo === 'tipo')) {
          productoActualizado.precioUnitario = calcularPrecioUnitario(
            productoActualizado.largo,
            productoActualizado.ancho,
            productoActualizado.alto,
            productoActualizado.precio,
            productoActualizado.remarcacion,
            productoActualizado.tipo
          );
        }
        
        // Recalcular subtotal automáticamente (solo si no es "A COTIZAR")
        if (!productoActualizado.aCotizar) {
          productoActualizado.subtotal = calcularSubtotalProducto(productoActualizado.cantidad, productoActualizado.precioUnitario);
        } else {
          productoActualizado.subtotal = 0; // Subtotal 0 para productos "A COTIZAR"
        }
        
        return productoActualizado;
      }
      return producto;
    });
    onChange(productosActualizados);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Items</CardTitle>
      </CardHeader>
      <CardContent>
        {productos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay items agregados</p>
            <p className="text-sm">Haga clic en &quot;Agregar Item&quot; para comenzar</p>
            <div className="mt-4">
              <Button onClick={agregarProducto} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Item
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {productos.map((producto, index) => (
              <div key={producto.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
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
                    <div className="relative">
                      <Input
                        list={`descripcion-options-${producto.id}`}
                        value={producto.descripcion}
                        onChange={(e) => actualizarProducto(producto.id, 'descripcion', e.target.value)}
                        placeholder="Seleccione o escriba una descripción personalizada"
                        className="w-full"
                      />
                      <datalist id={`descripcion-options-${producto.id}`}>
                        {DESCRIPCION_OPTIONS.map((opcion, index) => (
                          <option key={index} value={opcion} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Tipo de Producto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Producto
                    </label>
                    <Select
                      value={producto.tipo}
                      onValueChange={(value) => actualizarProducto(producto.id, 'tipo', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPO_PRODUCTO_OPTIONS.map((opcion) => (
                          <SelectItem key={opcion.value} value={opcion.value}>
                            {opcion.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={producto.cantidad}
                      onChange={(e) => {
                        const valor = e.target.value;
                        // Permitir solo números positivos
                        if (valor === '' || /^\d+$/.test(valor)) {
                          actualizarProducto(producto.id, 'cantidad', parseInt(valor) || 1);
                        }
                      }}
                      className="w-full"
                      placeholder="1"
                      disabled={producto.tipo === 'polimero'} // Deshabilitado para polímero
                    />
                    {producto.tipo === 'polimero' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Cantidad fija en 1 para polímero (matricería)
                      </p>
                    )}
                  </div>

                  {/* Campo específico para polímero: Cantidad de colores */}
                  {producto.tipo === 'polimero' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad de Colores
                      </label>
                      <Select
                        value={producto.colores?.toString() || '1'}
                        onValueChange={(value) => actualizarProducto(producto.id, 'colores', parseInt(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar colores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Color</SelectItem>
                          <SelectItem value="2">2 Colores</SelectItem>
                          <SelectItem value="3">3 Colores</SelectItem>
                          <SelectItem value="4">4+ Colores</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Segunda fila - Precio Unitario */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  {/* Precio Unitario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {producto.tipo === 'polimero' ? 'Precio (A Cotizar)' : 'Precio Unitario (Calculado Automáticamente)'}
                    </label>
                    <Input
                      type="text"
                      value={producto.tipo === 'polimero' ? 'A COTIZAR' : formatearMoneda(producto.precioUnitario)}
                      readOnly
                      className="w-full bg-gray-100 cursor-not-allowed"
                      placeholder={producto.tipo === 'polimero' ? 'A cotizar' : 'Se calcula automáticamente'}
                    />
                    {producto.tipo === 'polimero' && (
                      <p className="text-xs text-gray-500 mt-1">
                        El precio del polímero se cotiza según la complejidad del diseño
                      </p>
                    )}
                  </div>
                </div>

                {/* Tercera fila - Dimensiones (Solo para productos que no son polímero) */}
                {producto.tipo !== 'polimero' && (
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

                    {/* Alto - Solo para cajas */}
                    {producto.tipo === 'caja' && (
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
                    )}

                    {/* Calidad en Libras */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calidad en Libras
                      </label>
                      <div className="relative">
                        <Input
                          list={`calidad-options-${producto.id}`}
                          value={producto.calidad}
                          onChange={(e) => actualizarProducto(producto.id, 'calidad', e.target.value)}
                          placeholder="Seleccione o escriba una calidad personalizada"
                          className="w-full"
                        />
                        <datalist id={`calidad-options-${producto.id}`}>
                          {CALIDAD_OPTIONS.map((opcion, index) => (
                            <option key={index} value={opcion} />
                          ))}
                        </datalist>
                      </div>
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
                        {(producto.tipo as 'caja' | 'plancha' | 'polimero') === 'polimero' ? 'A COTIZAR' : formatearMoneda(producto.subtotal)}
                      </div>
                      {(producto.tipo as 'caja' | 'plancha' | 'polimero') === 'polimero' && (
                        <p className="text-xs text-gray-500 mt-1">
                          No se incluye en el total del presupuesto
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Subtotal para productos polímero (mostrar por separado) */}
                {(producto.tipo as 'caja' | 'plancha' | 'polimero') === 'polimero' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div></div> {/* Espaciador */}
                    <div></div> {/* Espaciador */}
                    <div></div> {/* Espaciador */}
                    {/* Subtotal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtotal
                      </label>
                      <div className="px-3 py-2 bg-gray-100 border rounded-md text-right font-medium">
                        A COTIZAR
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        No se incluye en el total del presupuesto
                      </p>
                    </div>
                  </div>
                )}

                {/* Medidas de Producción - Solo para productos que no son polímero */}
                {producto.tipo !== 'polimero' && (
                  <div className="mt-4">
                    <MedidasProduccion 
                      largo={producto.largo}
                      ancho={producto.ancho}
                      alto={producto.alto}
                      tipo={producto.tipo}
                      precio={producto.precio}
                      remarcacion={producto.remarcacion}
                      onPrecioChange={(precio) => actualizarProducto(producto.id, 'precio', precio)}
                      onRemarcacionChange={(remarcacion) => actualizarProducto(producto.id, 'remarcacion', remarcacion)}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {/* Botón para agregar más items al final de la lista */}
            <div className="flex justify-center pt-4">
              <Button onClick={agregarProducto} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Item
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}