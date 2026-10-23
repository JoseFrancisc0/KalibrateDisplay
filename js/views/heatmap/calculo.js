/* ==========================================================
   views/heatmap/calculo.js — Motor de cálculo de deltas
   ========================================================== */

import { COMBUSTIBLES } from '../../config/productos.js';
import { esCompetenciaExterna } from '../../shared/marcas.js';
import { cumpleSegmentacion } from '../../shared/segmentacion.js';
import { heatmapState } from './state.js';

/**
 * Procesa las estaciones de la plaza seleccionada y computa la matriz de deltas
 */
export function procesarDatosHeatmap(estaciones) {
  const deptoSel = heatmapState.departamento || 'TODOS';
  const provSel = heatmapState.provincia || 'TODOS';
  const distSel = heatmapState.distrito || 'TODOS';

  // 1. Filtrado de estaciones propias que cumplen con la segmentación activa
  const propiasFiltradas = (estaciones || []).filter(e => {
    const tienePropio = e.actores && e.actores.some(a => a.tipo_actor === 'PROPIO');
    const gpcVal = (e.gpc_group || e.gpc || '').trim().toUpperCase();
    if (!tienePropio || gpcVal === 'INACTIVAS') return false;

    const d = (e.departamento || '').trim().toUpperCase();
    const pv = (e.provincia || '').trim().toUpperCase();
    const dt = (e.distrito || '').trim().toUpperCase();

    if (deptoSel !== 'TODOS' && d !== deptoSel) return false;
    if (provSel !== 'TODOS' && pv !== provSel) return false;
    if (distSel !== 'TODOS' && dt !== distSel) return false;

    return cumpleSegmentacion(e, {
      gpc: heatmapState.gpc,
      gop: heatmapState.gop,
      jop: heatmapState.jop,
      corredor: heatmapState.corredor
    });
  });

  // 2. Construcción de filas por estación
  const filas = [];
  const acumuladorFooter = {};
  COMBUSTIBLES.forEach(p => {
    acumuladorFooter[p] = { sumaDelta: 0, conteoDelta: 0, sumaPropio: 0, sumaComp: 0 };
  });

  propiasFiltradas.forEach(est => {
    const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
    if (!propio || !propio.combustibles) return;

    const rivales = (est.actores || []).filter(esCompetenciaExterna);

    const filaItem = {
      siteId: est.own_site_id || est.site_id,
      nombre: est.estacion || est.estacion_cabecera || 'E/S Propia',
      distrito: est.distrito || '—',
      provincia: est.provincia || '—',
      corredor: est.corredor || '—',
      productos: {},
      deltaMedio: null
    };

    let sumaDeltasEstacion = 0;
    let conteoDeltasEstacion = 0;

    COMBUSTIBLES.forEach(prod => {
      const fuelPropio = propio.combustibles[prod];

      // Caso B: La estación propia no vende este producto
      if (!fuelPropio || !fuelPropio.precio || fuelPropio.precio <= 0) {
        filaItem.productos[prod] = { estado: 'NO_VENDE', delta: null };
        return;
      }

      const pPropio = Number(fuelPropio.precio);

      // Rivales en su zona que comercializan el mismo producto
      const rivalesConProd = rivales.filter(c => {
        const p = c.combustibles?.[prod]?.precio;
        return p && p > 0;
      });

      // Caso C: Vende el producto, pero ningún rival en su zona lo comercializa
      if (rivalesConProd.length === 0) {
        filaItem.productos[prod] = {
          estado: 'SIN_RIVAL',
          delta: null,
          precioPropio: pPropio
        };
        return;
      }

      // Caso A: Comercializa y tiene competencia local
      const sumaPreciosRival = rivalesConProd.reduce((acc, c) => acc + Number(c.combustibles[prod].precio), 0);
      const promRival = sumaPreciosRival / rivalesConProd.length;
      const delta = Number((pPropio - promRival).toFixed(2));

      // Rival más cercano
      rivalesConProd.sort((a, b) => (a.distancia_km ?? 99) - (b.distancia_km ?? 99));
      const masCercano = rivalesConProd[0];

      filaItem.productos[prod] = {
        estado: 'ACTIVO',
        delta,
        precioPropio: pPropio,
        promRival: Number(promRival.toFixed(2)),
        totalRivales: rivalesConProd.length,
        rivalMasCercano: {
          nombre: masCercano.nombre_linea,
          marca: masCercano.marca,
          precio: Number(masCercano.combustibles[prod].precio),
          distanciaKm: masCercano.distancia_km !== undefined ? Number(masCercano.distancia_km) : null
        }
      };

      sumaDeltasEstacion += delta;
      conteoDeltasEstacion++;

      // Acumular para el footer general
      acumuladorFooter[prod].sumaDelta += delta;
      acumuladorFooter[prod].conteoDelta++;
      acumuladorFooter[prod].sumaPropio += pPropio;
      acumuladorFooter[prod].sumaComp += promRival;
    });

    if (conteoDeltasEstacion > 0) {
      filaItem.deltaMedio = Number((sumaDeltasEstacion / conteoDeltasEstacion).toFixed(2));
    }

    filas.push(filaItem);
  });

  // 3. Ordenamiento dinámico
  const { columnaOrden, ordenAscendente } = heatmapState;
  filas.sort((a, b) => {
    let valA, valB;

    if (columnaOrden === 'nombre') {
      valA = a.nombre.toLowerCase();
      valB = b.nombre.toLowerCase();
      return ordenAscendente ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else if (columnaOrden === 'deltaMedio') {
      valA = a.deltaMedio !== null ? a.deltaMedio : (ordenAscendente ? 999 : -999);
      valB = b.deltaMedio !== null ? b.deltaMedio : (ordenAscendente ? 999 : -999);
    } else {
      // Ordenamiento por producto
      const itemA = a.productos[columnaOrden];
      const itemB = b.productos[columnaOrden];
      valA = (itemA && itemA.delta !== null) ? itemA.delta : (ordenAscendente ? 999 : -999);
      valB = (itemB && itemB.delta !== null) ? itemB.delta : (ordenAscendente ? 999 : -999);
    }

    return ordenAscendente ? valA - valB : valB - valA;
  });

  // 4. Cálculo del Footer (Resumen Depto)
  const resumenFooter = {};
  COMBUSTIBLES.forEach(prod => {
    const acc = acumuladorFooter[prod];
    resumenFooter[prod] = {
      promDelta: acc.conteoDelta > 0 ? Number((acc.sumaDelta / acc.conteoDelta).toFixed(2)) : null,
      promPropio: acc.conteoDelta > 0 ? Number((acc.sumaPropio / acc.conteoDelta).toFixed(2)) : null,
      promComp: acc.conteoDelta > 0 ? Number((acc.sumaComp / acc.conteoDelta).toFixed(2)) : null,
      conteoEESS: acc.conteoDelta
    };
  });

  return { filas, resumenFooter, totalEstaciones: filas.length };
}