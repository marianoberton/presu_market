'use client';

import { useState, useEffect } from 'react';
import { HubSpotDeal, HubSpotDealsResponse, ApiResponse } from '@/lib/types/presupuesto';
import { Check } from 'lucide-react';

interface DealSelectorProps {
  onDealSelected: (deal: HubSpotDeal | null) => void;
  selectedDeal?: HubSpotDeal | null;
  disabled?: boolean;
}

export default function DealSelector({ onDealSelected, selectedDeal, disabled = false }: DealSelectorProps) {
  const [deals, setDeals] = useState<HubSpotDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assocLoading, setAssocLoading] = useState(false);
  const [assocError, setAssocError] = useState<string | null>(null);
  const [assocCounts, setAssocCounts] = useState<{ contacts: number; companies: number } | null>(null);
  const [assocContactIds, setAssocContactIds] = useState<string[]>([]);
  const [contactMissingMp, setContactMissingMp] = useState<{ id: string; props: any } | null>(null);
  // Eliminamos conteo redundante de IDs asociados para simplificar la UI

  const [showContactModal, setShowContactModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [contactForm, setContactForm] = useState({ firstname: '', lastname: '', email: '', phone: '', mp_live_chat_url: '' });
  const [companyForm, setCompanyForm] = useState({ name: '', province: '', city: '', address: '' });
  const [creating, setCreating] = useState(false);
  // Modal para asegurar mp_* en contacto existente antes de asociar empresa
  const [ensurePropsModal, setEnsurePropsModal] = useState(false);
  const [ensureContactId, setEnsureContactId] = useState<string | null>(null);
  const [pendingCompanyId, setPendingCompanyId] = useState<string | null>(null);
  const [ensureForm, setEnsureForm] = useState({ mp_live_chat_url: '' });

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hubspot/deals');
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload = isJson ? await response.json() : await response.text();
      if (!isJson) {
        const preview = typeof payload === 'string' ? payload.slice(0, 180) : '';
        throw new Error(`Respuesta no JSON (${response.status}). Vista previa: ${preview}`);
      }
      const result: ApiResponse<HubSpotDealsResponse> = payload;

      if (!result.success) {
        throw new Error(result.error || 'Error al cargar deals');
      }

      setDeals(result.data?.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al cargar deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDealChange = (dealId: string) => {
    if (dealId === '') {
      onDealSelected(null);
      setAssocCounts(null);
      setAssocContactIds([]);
      setAssocError(null);
      return;
    }

    const deal = deals.find(d => d.id === dealId);
    onDealSelected(deal || null);
  };

  const formatDealName = (deal: HubSpotDeal) => {
    const name = deal.properties.dealname || 'Sin nombre';
    const cliente = deal.properties.mp_cliente_nombre || deal.properties.mp_cliente_empresa;
    const amount = deal.properties.amount ? ` - $${deal.properties.amount}` : '';
    
    return cliente ? `${name} (${cliente})${amount}` : `${name}${amount}`;
  };

  useEffect(() => {
    const loadAssociations = async () => {
      if (!selectedDeal?.id) {
        setAssocCounts(null);
        setAssocContactIds([]);
        setAssocError(null);
        return;
      }
      setAssocLoading(true);
      setAssocError(null);
      try {
        const url = `/api/hubspot/test-associations?dealId=${selectedDeal.id}&fallback=true`;
        const res = await fetch(url);
        const contentType = res.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const raw = isJson ? await res.json() : await res.text();
        if (!isJson) {
          const preview = typeof raw === 'string' ? raw.slice(0, 180) : '';
          throw new Error(`Respuesta no JSON (${res.status}). Vista previa: ${preview}`);
        }
        if (!res.ok) throw new Error(raw?.error || 'Error al cargar asociaciones');
        const payload = raw?.data ?? raw;

        const contacts = Array.isArray(payload?.contacts) ? payload.contacts : [];
        const companiesFromDeal = Array.isArray(payload?.companiesFromDeal) ? payload.companiesFromDeal : [];
        const companiesFromContacts = Array.isArray(payload?.companiesFromContacts) ? payload.companiesFromContacts : [];
        const uniqueCompanyIds = Array.from(
          new Set([
            ...companiesFromDeal.map((c: any) => String(c.id)).filter(Boolean),
            ...companiesFromContacts.map((c: any) => String(c.id)).filter(Boolean),
          ])
        );
        setAssocCounts({
          contacts: contacts.length,
          companies: uniqueCompanyIds.length,
        });
        setAssocContactIds(contacts.map((c: any) => String(c.id)).filter(Boolean));
        // Detectar contacto con mp_* faltantes
        const missing = contacts.find((c: any) => {
          const p = c?.properties || {};
          return !p?.mp_live_chat_url;
        });
        if (missing?.id) {
          setContactMissingMp({ id: String(missing.id), props: missing.properties || {} });
        } else {
          setContactMissingMp(null);
        }
      } catch (err: any) {
        setAssocError(err?.message ?? 'Error desconocido al cargar asociaciones');
        setAssocCounts(null);
        setAssocContactIds([]);
        setContactMissingMp(null);
      } finally {
        setAssocLoading(false);
      }
    };

    loadAssociations();
  }, [selectedDeal?.id]);

  const createContactAndAssociate = async () => {
    if (!selectedDeal?.id) return;
    setCreating(true);
    try {
      const createRes = await fetch('/api/hubspot/contacts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created?.error || 'No se pudo crear el contacto');

      const assocRes = await fetch('/api/hubspot/associations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromType: 'deals', fromId: selectedDeal.id, toType: 'contacts', toId: String(created.id) }),
      });
      const assocData = await assocRes.json();
      if (!assocRes.ok) throw new Error(assocData?.error || 'No se pudo asociar el contacto al deal');

      setShowContactModal(false);
          setContactForm({ firstname: '', lastname: '', email: '', phone: '', mp_live_chat_url: '' });
      // Reload associations
      const url = `/api/hubspot/test-associations?dealId=${selectedDeal.id}&fallback=true`;
      const res = await fetch(url);
      const raw = await res.json();
      const payload = raw?.data ?? raw;
      const contacts = Array.isArray(payload?.contacts) ? payload.contacts : [];
      const companiesFromDeal = Array.isArray(payload?.companiesFromDeal) ? payload.companiesFromDeal : [];
      const companiesFromContacts = Array.isArray(payload?.companiesFromContacts) ? payload.companiesFromContacts : [];
      const uniqueCompanyIds = Array.from(
        new Set([
          ...companiesFromDeal.map((c: any) => String(c.id)).filter(Boolean),
          ...companiesFromContacts.map((c: any) => String(c.id)).filter(Boolean),
        ])
      );
      setAssocCounts({ contacts: contacts.length, companies: uniqueCompanyIds.length });
      setAssocContactIds(contacts.map((c: any) => String(c.id)).filter(Boolean));
    } catch (err: any) {
      alert(err?.message ?? 'Error al crear y asociar el contacto');
    } finally {
      setCreating(false);
    }
  };

  const createCompanyAndAssociate = async () => {
    if (!selectedDeal?.id) return;
    setCreating(true);
    try {
      const createRes = await fetch('/api/hubspot/companies/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created?.error || 'No se pudo crear la empresa');

      // Asociar empresa al deal
      const assocDealRes = await fetch('/api/hubspot/associations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromType: 'deals', fromId: selectedDeal.id, toType: 'companies', toId: String(created.id) }),
      });
      const assocDealData = await assocDealRes.json();
      if (!assocDealRes.ok) throw new Error(assocDealData?.error || 'No se pudo asociar la empresa al deal');

      // Si existe un contacto asociado, asociar empresa al contacto como primaria
      const contactId = assocContactIds[0];
      if (contactId) {
        // Leer propiedades del contacto y forzar actualización de mp_* si faltan
        const readUrl = `/api/hubspot/contacts/read?id=${encodeURIComponent(String(contactId))}`;
        const readRes = await fetch(readUrl);
        const readData = await readRes.json();
        if (!readRes.ok) throw new Error(readData?.error || 'No se pudo leer el contacto');
        const props = readData?.properties || {};
        const missingLink = !props?.mp_live_chat_url;
        if (missingLink) {
          // Abrir modal obligatorio para completar mp_* antes de asociar empresa al contacto
          setEnsureContactId(String(contactId));
          setPendingCompanyId(String(created.id));
          setEnsureForm({ mp_live_chat_url: props?.mp_live_chat_url || '' });
          setEnsurePropsModal(true);
        } else {
          const assocContactRes = await fetch('/api/hubspot/associations/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromType: 'contacts', fromId: String(contactId), toType: 'companies', toId: String(created.id) }),
          });
          // No abortar si falla esta asociación; sólo informar
          if (!assocContactRes.ok) {
            const msg = (await assocContactRes.json())?.error || 'Fallo al asociar empresa al contacto';
            console.warn(msg);
          }
        }
      }

      setShowCompanyModal(false);
      setCompanyForm({ name: '', province: '', city: '', address: '' });
      // Reload associations
      const url = `/api/hubspot/test-associations?dealId=${selectedDeal.id}&fallback=true`;
      const res = await fetch(url);
      const raw = await res.json();
      const payload = raw?.data ?? raw;
      const contacts = Array.isArray(payload?.contacts) ? payload.contacts : [];
      const companiesFromDeal = Array.isArray(payload?.companiesFromDeal) ? payload.companiesFromDeal : [];
      const companiesFromContacts = Array.isArray(payload?.companiesFromContacts) ? payload.companiesFromContacts : [];
      const uniqueCompanyIds = Array.from(
        new Set([
          ...companiesFromDeal.map((c: any) => String(c.id)).filter(Boolean),
          ...companiesFromContacts.map((c: any) => String(c.id)).filter(Boolean),
        ])
      );
      setAssocCounts({ contacts: contacts.length, companies: uniqueCompanyIds.length });
      setAssocContactIds(contacts.map((c: any) => String(c.id)).filter(Boolean));
    } catch (err: any) {
      alert(err?.message ?? 'Error al crear y asociar la empresa');
    } finally {
      setCreating(false);
    }
  };

  const updateContactPropsAndAssociate = async () => {
    if (!ensureContactId) return;
    if (!ensureForm.mp_live_chat_url) {
      alert('Pegá el link de ManyChat (mp_live_chat_url)');
      return;
    }
    setCreating(true);
    try {
      const patchRes = await fetch('/api/hubspot/contacts/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ensureContactId, properties: ensureForm }),
      });
      const patchData = await patchRes.json();
      if (!patchRes.ok) {
        const details = typeof patchData?.details === 'string' ? patchData.details : JSON.stringify(patchData?.details, null, 2);
        alert(`${patchData?.error || 'No se pudo actualizar el contacto'}\n\n${details || ''}`);
        return;
      }

      // Si hay una empresa pendiente, asociar ahora; si no, solo cerrar y refrescar
      if (pendingCompanyId) {
        const assocRes = await fetch('/api/hubspot/associations/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromType: 'contacts', fromId: String(ensureContactId), toType: 'companies', toId: String(pendingCompanyId) }),
        });
        const assocData = await assocRes.json();
        if (!assocRes.ok) throw new Error(assocData?.error || 'No se pudo asociar la empresa al contacto');
      }

      setEnsurePropsModal(false);
      setEnsureContactId(null);
      setPendingCompanyId(null);
      setEnsureForm({ mp_live_chat_url: '' });

      // Reload associations
      if (selectedDeal?.id) {
        const url = `/api/hubspot/test-associations?dealId=${selectedDeal.id}&fallback=true`;
        const res = await fetch(url);
        const raw = await res.json();
        const payload = raw?.data ?? raw;
        const contacts = Array.isArray(payload?.contacts) ? payload.contacts : [];
        const companiesFromDeal = Array.isArray(payload?.companiesFromDeal) ? payload.companiesFromDeal : [];
        const companiesFromContacts = Array.isArray(payload?.companiesFromContacts) ? payload.companiesFromContacts : [];
        const uniqueCompanyIds = Array.from(
          new Set([
            ...companiesFromDeal.map((c: any) => String(c.id)).filter(Boolean),
            ...companiesFromContacts.map((c: any) => String(c.id)).filter(Boolean),
          ])
        );
        setAssocCounts({ contacts: contacts.length, companies: uniqueCompanyIds.length });
        setAssocContactIds(contacts.map((c: any) => String(c.id)).filter(Boolean));
        const missing = contacts.find((c: any) => {
          const p = c?.properties || {};
          return !p?.mp_live_chat_url;
        });
        if (missing?.id) {
          setContactMissingMp({ id: String(missing.id), props: missing.properties || {} });
        } else {
          setContactMissingMp(null);
        }
      }
    } catch (err: any) {
      alert(err?.message ?? 'Error al actualizar el contacto y asociar la empresa');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Deal de HubSpot
        </label>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-500">Cargando deals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Deal de HubSpot
        </label>
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadDeals}
              className="text-sm text-red-600 hover:text-red-800 underline"
              disabled={loading}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="deal-selector" className="block text-sm font-medium text-gray-700">
        Deal de HubSpot
        <span className="text-gray-500 text-xs ml-1">
          ({deals.length} deals disponibles)
        </span>
      </label>
      
      <div className="flex items-center gap-3">
        <select
          id="deal-selector"
          value={selectedDeal?.id || ''}
          onChange={(e) => handleDealChange(e.target.value)}
          disabled={disabled || deals.length === 0}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed h-10"
        >
          <option value="">Seleccionar deal...</option>
          {deals.map((deal) => (
            <option key={deal.id} value={deal.id}>
              {formatDealName(deal)}
            </option>
          ))}
        </select>
        
        <div className="w-6 h-10 flex items-center justify-center flex-shrink-0">
          {selectedDeal && (
            <Check className="h-5 w-5 text-green-600" />
          )}
        </div>
      </div>

      {selectedDeal && (
        <div className="mt-2 space-y-2">
          {assocLoading ? (
            <p className="text-xs text-gray-500">Cargando asociaciones...</p>
          ) : assocError ? (
            <p className="text-xs text-red-600">{assocError}</p>
          ) : assocCounts ? (
            <div className="text-xs text-gray-700 flex items-center gap-4">
              <span>Contactos: {assocCounts.contacts}</span>
              <span>Empresas: {assocCounts.companies}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Sin datos de asociaciones</p>
          )}

          {contactMissingMp && (
            <div className="mt-2 p-2 border border-amber-300 bg-amber-50 rounded">
              <p className="text-xs text-amber-800">El contacto asociado no tiene link de ManyChat. Pegá el link para completar.</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="px-2 py-1 text-xs rounded bg-amber-600 text-white"
                  onClick={() => {
                    setEnsureContactId(contactMissingMp.id);
                    setPendingCompanyId(null);
                    const p = contactMissingMp.props || {};
                    setEnsureForm({ mp_live_chat_url: p?.mp_live_chat_url || '' });
                    setEnsurePropsModal(true);
                  }}
                >Completar link de ManyChat</button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {assocCounts && assocCounts.contacts === 0 && (
              <button
                type="button"
                className="px-2 py-1 text-xs rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => setShowContactModal(true)}
              >
                Crear contacto
              </button>
            )}
            {assocCounts && assocCounts.companies === 0 && (
              <button
                type="button"
                className="px-2 py-1 text-xs rounded border border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => setShowCompanyModal(true)}
              >
                Crear empresa
              </button>
            )}
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-md shadow-lg p-4 w-full max-w-md">
            <h3 className="text-sm font-medium mb-3">Crear contacto y asociar al deal</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input className="border px-2 py-1 rounded" placeholder="Nombre" value={contactForm.firstname} onChange={e => setContactForm({ ...contactForm, firstname: e.target.value })} />
              <input className="border px-2 py-1 rounded" placeholder="Apellido" value={contactForm.lastname} onChange={e => setContactForm({ ...contactForm, lastname: e.target.value })} />
              <input className="border px-2 py-1 rounded col-span-2" placeholder="Email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
              <input className="border px-2 py-1 rounded col-span-2" placeholder="Teléfono" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} />
              <input className="border px-2 py-1 rounded col-span-2" placeholder="Link de ManyChat (mp_live_chat_url)" value={contactForm.mp_live_chat_url} onChange={e => setContactForm({ ...contactForm, mp_live_chat_url: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 text-xs rounded border" onClick={() => setShowContactModal(false)} disabled={creating}>Cancelar</button>
              <button className="px-3 py-1 text-xs rounded bg-blue-600 text-white" onClick={createContactAndAssociate} disabled={creating || !contactForm.email || !contactForm.mp_live_chat_url}>Crear y asociar</button>
            </div>
          </div>
        </div>
      )}

      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-md shadow-lg p-4 w-full max-w-md">
            <h3 className="text-sm font-medium mb-3">Crear empresa y asociar</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input className="border px-2 py-1 rounded col-span-2" placeholder="Nombre de empresa" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} />
              <input className="border px-2 py-1 rounded" placeholder="Provincia" value={companyForm.province} onChange={e => setCompanyForm({ ...companyForm, province: e.target.value })} />
              <input className="border px-2 py-1 rounded" placeholder="Ciudad" value={companyForm.city} onChange={e => setCompanyForm({ ...companyForm, city: e.target.value })} />
              <input className="border px-2 py-1 rounded col-span-2" placeholder="Dirección" value={companyForm.address} onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })} />
            </div>
            <div className="text-xs text-gray-500 mb-2">Se asociará al deal y, si hay contacto, también al contacto (primaria).</div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 text-xs rounded border" onClick={() => setShowCompanyModal(false)} disabled={creating}>Cancelar</button>
              <button className="px-3 py-1 text-xs rounded bg-green-600 text-white" onClick={createCompanyAndAssociate} disabled={creating || !companyForm.name}>Crear y asociar</button>
            </div>
          </div>
        </div>
      )}

      {ensurePropsModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-md shadow-lg p-4 w-full max-w-md">
            <h3 className="text-sm font-medium mb-3">Completar link de ManyChat</h3>
            <p className="text-xs text-gray-600 mb-2">Pegá el link de ManyChat; se completan automáticamente el Page ID y el User ID.</p>
            <div className="grid grid-cols-1 gap-2 mb-3">
              <input className="border px-2 py-1 rounded" placeholder="https://app.manychat.com/fbXXXXXXXXXXXXXXX/chat/XXXXXX" value={ensureForm.mp_live_chat_url} onChange={e => setEnsureForm({ ...ensureForm, mp_live_chat_url: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 text-xs rounded bg-blue-600 text-white" onClick={updateContactPropsAndAssociate} disabled={creating || !ensureForm.mp_live_chat_url}>Actualizar y asociar</button>
            </div>
          </div>
        </div>
      )}

      {deals.length === 0 && !loading && (
        <p className="text-sm text-gray-500 italic">
          No hay deals en etapa inicial disponibles
        </p>
      )}
    </div>
  );
}