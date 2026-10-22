/* ==========================================================
   shared/competidores.js — Normalizador e Indexador Global
   de Red Competidora a partir de estaciones filtradas.
   ========================================================== */

import { normalizarMarca, esCompetenciaExterna } from './marcas.js';

export function obtenerCompetidoresUnicos(estacionesFiltradas, combustible) {
  const competidoresMap = new Map();

  estacionesFiltradas.forEach(est => {
    const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
    const nombrePropio = est.estacion || est.estacion_cabecera || 'E/S Propia';
    const ownSiteId = est.own_site_id || est.site_id;

    const comps = (est.actores || []).filter(esCompetenciaExterna);

    comps.forEach(c => {
      const fuelInfo = c.combustibles?.[combustible];
      const precio = fuelInfo?.precio;

      // Descartar si no tiene precio válido en este combustible
      if (!precio || precio <= 0) return;

      const siteId = c.site_id;
      if (!siteId) return;

      const rivalidadInfo = {
        ownSiteId,
        nombrePropio,
        distanciaKm: c.distancia_km !== undefined ? Number(c.distancia_km) : null,
        esMainMarker: !!fuelInfo?.main_marker
      };

      if (!competidoresMap.has(siteId)) {
        competidoresMap.set(siteId, {
          siteId,
          nombre: c.nombre_linea || c.competidor || 'Competidor',
          marca: normalizarMarca(c.marca),
          precio: Number(precio),
          departamento: est.departamento || '—',
          provincia: est.provincia || '—',
          distrito: est.distrito || '—',
          corredor: est.corredor || '—',
          gpcGroup: est.gpc_group || est.gpc || '—',
          gop: est.gop || '—',
          jop: est.jop || '—',
          rivalidades: [rivalidadInfo]
        });
      } else {
        // El competidor ya fue registrado: agregar la nueva estación propia a su lista de rivalidades
        const compExistente = competidoresMap.get(siteId);
        compExistente.rivalidades.push(rivalidadInfo);
      }
    });
  });

  // Ordenar rivalidades internas por distancia ascendente para cada competidor
  const resultado = Array.from(competidoresMap.values()).map(comp => {
    comp.rivalidades.sort((a, b) => {
      const distA = a.distanciaKm ?? 999;
      const distB = b.distanciaKm ?? 999;
      return distA - distB;
    });

    // Helper con el rival más cercano
    comp.rivalMasCercano = comp.rivalidades[0];
    return comp;
  });

  return resultado;
}