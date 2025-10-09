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
      cantidad: 0,
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
        
        // Lógica especial para polímero y sacabocado
        if (campo === 'tipo' && (valor === 'polimero' || valor === 'sacabocado')) {
          // No fijar cantidad en 1 - permitir cantidad variable
          // No establecer automáticamente aCotizar ni precio - permitir control manual
          productoActualizado.colores = productoActualizado.colores || 1; // Default 1 color
        } else if (campo === 'tipo' && valor !== 'polimero' && valor !== 'sacabocado') {
          productoActualizado.aCotizar = false; // Desmarcar "A COTIZAR"
        }
        
        // Solo recalcular precio unitario y subtotal si NO estamos actualizando el campo aCotizar
        if (campo !== 'aCotizar') {
          // Para productos polímero y sacabocado, el precio manual ES el precio unitario
          if (productoActualizado.tipo === 'polimero' || productoActualizado.tipo === 'sacabocado') {
            if (campo === 'precio') {
              productoActualizado.precioUnitario = Number(valor);
            }
          } else {
            // Recalcular precio unitario automáticamente cuando cambien las dimensiones, precio o remarcación
            // Pero no para productos "A COTIZAR"
            if (!productoActualizado.aCotizar && (campo === 'largo' || campo === 'ancho' || campo === 'alto' || campo === 'precio' || campo === 'remarcacion' || campo === 'tipo')) {
              // Recalcular precio unitario automáticamente
              productoActualizado.precioUnitario = calcularPrecioUnitario(
                productoActualizado.largo,
                productoActualizado.ancho,
                productoActualizado.alto,
                productoActualizado.precio,
                productoActualizado.remarcacion,
                productoActualizado.tipo
              );
            }
          }
          
          // Recalcular subtotal automáticamente (solo si no es "A COTIZAR")
          if (!productoActualizado.aCotizar) {
            productoActualizado.subtotal = calcularSubtotalProducto(productoActualizado.cantidad, productoActualizado.precioUnitario);
          } else {
            productoActualizado.subtotal = 0; // Subtotal 0 para productos "A COTIZAR"
          }
        } else {
          // Si estamos actualizando aCotizar, solo ajustamos el subtotal
          if (productoActualizado.aCotizar) {
            productoActualizado.subtotal = 0; // Subtotal 0 para productos "A COTIZAR"
          } else {
            // Si se desmarca aCotizar, recalcular subtotal
            if (productoActualizado.tipo === 'polimero' || productoActualizado.tipo === 'sacabocado') {
              productoActualizado.subtotal = productoActualizado.precio * productoActualizado.cantidad;
            } else {
              productoActualizado.subtotal = calcularSubtotalProducto(productoActualizado.cantidad, productoActualizado.precioUnitario);
            }
          }
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
                          actualizarProducto(producto.id, 'cantidad', parseInt(valor) || 0);
                        }
                      }}
                      className="w-full"
                      placeholder="0"
                    />
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

                {/* Segunda fila - Precio y configuración para polímero y sacabocado */}
                {(producto.tipo === 'polimero' || producto.tipo === 'sacabocado') && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    {/* Precio Manual */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Manual ($)
                      </label>
                      <Input
                        type="text"
                        value={producto.precio === 0 ? '' : producto.precio.toString()}
                        onChange={(e) => {
                          const valor = parseFloat(e.target.value) || 0;
                          actualizarProducto(producto.id, 'precio', valor);
                        }}
                        placeholder="0.00"
                        className="w-full"
                        disabled={producto.aCotizar}
                      />
                    </div>

                    {/* Checkbox A Cotizar */}
                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id={`cotizar-${producto.id}`}
                        checked={producto.aCotizar || false}
                        onChange={(e) => {
                          actualizarProducto(producto.id, 'aCotizar', e.target.checked);
                          // NO ponemos el precio en 0 automáticamente - dejamos que el usuario mantenga su precio manual
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`cotizar-${producto.id}`} className="text-sm font-medium text-gray-700">
                        A Cotizar
                      </label>
                    </div>

                    {/* Precio Unitario (mostrar resultado) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Unitario
                      </label>
                      <Input
                        type="text"
                        value={producto.aCotizar ? 'A COTIZAR' : formatearMoneda(producto.precio)}
                        readOnly
                        className="w-full bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {/* Segunda fila - Precio $/m² y Remarcación para otros productos */}
                {producto.tipo !== 'polimero' && producto.tipo !== 'sacabocado' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    {/* Precio $/m² */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio $/m²
                      </label>
                      <Input
                        type="text"
                        value={producto.precio === 0 ? '' : producto.precio.toString()}
                        onChange={(e) => {
                          const valor = parseFloat(e.target.value) || 0;
                          actualizarProducto(producto.id, 'precio', valor);
                        }}
                        placeholder="0.00"
                        className="w-full"
                      />
                    </div>

                    {/* Remarcación */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarcación
                      </label>
                      <Input
                        type="text"
                        value={producto.remarcacion === 0 ? '' : producto.remarcacion.toString()}
                        onChange={(e) => {
                          const valor = e.target.value;
                          if (valor === '' || /^\d*\.?\d*$/.test(valor)) {
                            const numeroValor = valor === '' ? 0 : parseFloat(valor);
                            actualizarProducto(producto.id, 'remarcacion', isNaN(numeroValor) ? 0 : numeroValor);
                          }
                        }}
                        placeholder="1"
                        className="w-full"
                      />
                    </div>

                    {/* Precio Unitario Calculado - Solo mostrar cuando todos los campos estén completos */}
                    {(() => {
                      const tieneTodasLasDimensiones = producto.largo > 0 && producto.ancho > 0 && 
                        (['plancha', 'polimero', 'sacabocado'].includes(producto.tipo) || producto.alto > 0);
                      const tieneCalidad = producto.calidad && producto.calidad.trim() !== '';
                      const tienePrecio = producto.precio > 0;
                      
                      return tieneTodasLasDimensiones && tieneCalidad && tienePrecio;
                    })() && (
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
                    )}
                  </div>
                )}

                {/* Tercera fila - Dimensiones (Solo para productos que no son polímero ni sacabocado) */}
                {producto.tipo !== 'polimero' && producto.tipo !== 'sacabocado' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Largo (mm)
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
                        Ancho (mm)
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

                    {/* Alto - Solo para productos que no sean plancha, polímero o sacabocado */}
                    {!['plancha', 'polimero', 'sacabocado'].includes(producto.tipo) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alto (mm)
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
                  </div>
                )}

                {/* Cuarta fila - Subtotal */}
                {producto.tipo !== 'polimero' && producto.tipo !== 'sacabocado' && (
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
                        {formatearMoneda(producto.subtotal)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtotal para productos polímero y sacabocado */}
                {(producto.tipo === 'polimero' || producto.tipo === 'sacabocado') && (
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
                        {producto.aCotizar ? 'A COTIZAR' : formatearMoneda(producto.precio * producto.cantidad)}
                      </div>
                      {producto.aCotizar && (
                        <p className="text-xs text-gray-500 mt-1">
                          No se incluye en el total del presupuesto
                        </p>
                      )}
                    </div>
                  </div>
                )}

                  {/* Medidas de Producción - Solo para productos que no son polímero ni sacabocado */}
                  {producto.tipo !== 'polimero' && producto.tipo !== 'sacabocado' && (
                    <div className="mt-4">
                      <MedidasProduccion 
                        largo={producto.largo}
                        ancho={producto.ancho}
                        alto={producto.alto}
                        tipo={producto.tipo}
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