/* ==========================================================
   views/mapa/calculo.js — Motor de agregación departamental
   ========================================================== */

import { cumpleSegmentacion } from '../../shared/segmentacion.js';
import { obtenerCompetidoresUnicos } from '../../shared/competidores.js';
import { mapaState, DEPARTAMENTOS_OPERATIVOS } from './state.js';

function normDepto(nombre) {
  const d = (nombre || '').trim().toUpperCase();
  if (d === 'CUSCO') return 'CUZCO';
  return d;
}

/**
 * Procesa las estaciones de la red aplicando la jerarquía operativa activa
 * y calcula los KPIs consolidados por cada departamento y a nivel nacional.
 * 
 * @param {Array} todasLasEstaciones - state.rawData.estaciones
 * @returns {Object} { porDepartamento, resumenNacional, deptoActivoData }
 */
export function procesarDatosMapa(todasLasEstaciones) {
  const combustible = mapaState.producto || 'Diesel';

  // 1. Filtrado base por Jerarquía Operativa (sin filtrar depto para ver todo el mapa)
  const estacionesBase = (todasLasEstaciones || []).filter(e => {
    const tienePropio = e.actores && e.actores.some(a => a.tipo_actor === 'PROPIO');
    const gpcVal = (e.gpc_group || e.gpc || '').trim().toUpperCase();
    if (!tienePropio || gpcVal === 'INACTIVAS') return false;

    return cumpleSegmentacion(e, {
      gpc: mapaState.gpc,
      gop: mapaState.gop,
      jop: mapaState.jop,
      corredor: mapaState.corredor
    });
  });

  // 2. Agrupación de estaciones propias por departamento
  const deptosMap = new Map();
  DEPARTAMENTOS_OPERATIVOS.forEach(d => {
    deptosMap.set(d, []);
  });

  estacionesBase.forEach(est => {
    const dNorm = normDepto(est.departamento);
    if (deptosMap.has(dNorm)) {
      deptosMap.get(dNorm).push(est);
    }
  });

  // 3. Cálculo de métricas por departamento
  const porDepartamento = {};

  DEPARTAMENTOS_OPERATIVOS.forEach(depto => {
    const estacionesDepto = deptosMap.get(depto) || [];
    
    // Propias con precio en el combustible evaluado
    const propiasConProducto = [];
    let sumaPrecioPropio = 0;
    let sumaCostoPropio = 0;
    let conteoCosto = 0;
    let sumaMargenPropio = 0;
    let conteoMargen = 0;

    estacionesDepto.forEach(est => {
      const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
      const fuelItem = propio?.combustibles?.[combustible];

      if (fuelItem && fuelItem.precio && fuelItem.precio > 0) {
        const p = Number(fuelItem.precio);
        const c = (fuelItem.costo && fuelItem.costo > 0) ? Number(fuelItem.costo) : null;
        const mg = (fuelItem.margen !== undefined && fuelItem.margen !== null) 
          ? Number(fuelItem.margen) 
          : (c !== null ? Number((p - c).toFixed(2)) : null);

        sumaPrecioPropio += p;
        if (c !== null) { sumaCostoPropio += c; conteoCosto++; }
        if (mg !== null) { sumaMargenPropio += mg; conteoMargen++; }

        propiasConProducto.push({
          siteId: est.own_site_id || est.site_id,
          nombre: est.estacion || est.estacion_cabecera || 'E/S Propia',
          distrito: est.distrito || '—',
          provincia: est.provincia || '—',
          corredor: est.corredor || '—',
          gpc: est.gpc_group || est.gpc || '—',
          precio: p,
          costo: c,
          margen: mg
        });
      }
    });

    const totalPropias = propiasConProducto.length;
    const promPrecioPropio = totalPropias > 0 ? (sumaPrecioPropio / totalPropias) : null;
    const promCostoPropio = conteoCosto > 0 ? (sumaCostoPropio / conteoCosto) : null;
    const promMargenPropio = conteoMargen > 0 ? (sumaMargenPropio / conteoMargen) : null;

    // Competencia única por departamento (evita duplicados si compiten con varias propias)
    const competidoresDepto = obtenerCompetidoresUnicos(estacionesDepto, combustible);
    const totalCompetidores = competidoresDepto.length;
    
    let promPrecioComp = null;
    if (totalCompetidores > 0) {
      const sumaComp = competidoresDepto.reduce((acc, c) => acc + c.precio, 0);
      promPrecioComp = sumaComp / totalCompetidores;
    }

    // Delta Mercado: Propio - Competencia
    const deltaMercado = (promPrecioPropio !== null && promPrecioComp !== null) 
      ? Number((promPrecioPropio - promPrecioComp).toFixed(2)) 
      : null;

    // Ordenar estaciones de mayor a menor precio para la lista lateral
    propiasConProducto.sort((a, b) => b.precio - a.precio);

    porDepartamento[depto] = {
      departamento: depto,
      tienePresencia: totalPropias > 0,
      totalPropias,
      promPrecioPropio,
      promCostoPropio,
      promMargenPropio,
      totalCompetidores,
      promPrecioComp,
      deltaMercado,
      estaciones: propiasConProducto
    };
  });

  // 4. Cálculo de Resumen Nacional Consolidado (las 12 plazas juntas)
  let natTotalPropias = 0;
  let natSumaPrecio = 0;
  let natSumaCosto = 0;
  let natConteoCosto = 0;
  let natSumaMargen = 0;
  let natConteoMargen = 0;
  const todasLasPropias = [];

  Object.values(porDepartamento).forEach(d => {
    natTotalPropias += d.totalPropias;
    d.estaciones.forEach(e => {
      todasLasPropias.push(e);
      natSumaPrecio += e.precio;
      if (e.costo !== null) { natSumaCosto += e.costo; natConteoCosto++; }
      if (e.margen !== null) { natSumaMargen += e.margen; natConteoMargen++; }
    });
  });

  // Competidores únicos a escala nacional
  const todosLosCompetidores = obtenerCompetidoresUnicos(estacionesBase, combustible);
  const natTotalComp = todosLosCompetidores.length;
  const natPromPrecioComp = natTotalComp > 0 
    ? (todosLosCompetidores.reduce((acc, c) => acc + c.precio, 0) / natTotalComp) 
    : null;

  const natPromPrecio = natTotalPropias > 0 ? (natSumaPrecio / natTotalPropias) : null;
  const natPromCosto = natConteoCosto > 0 ? (natSumaCosto / natConteoCosto) : null;
  const natPromMargen = natConteoMargen > 0 ? (natSumaMargen / natConteoMargen) : null;
  const natDelta = (natPromPrecio !== null && natPromPrecioComp !== null)
    ? Number((natPromPrecio - natPromPrecioComp).toFixed(2))
    : null;

  todasLasPropias.sort((a, b) => b.precio - a.precio);

  const resumenNacional = {
    departamento: 'RED NACIONAL',
    esNacional: true,
    totalPropias: natTotalPropias,
    promPrecioPropio: natPromPrecio,
    promCostoPropio: natPromCosto,
    promMargenPropio: natPromMargen,
    totalCompetidores: natTotalComp,
    promPrecioComp: natPromPrecioComp,
    deltaMercado: natDelta,
    estaciones: todasLasPropias
  };

  // 5. Determinar el contexto activo (un departamento específico o el consolidado)
  const deptoSelNorm = mapaState.deptoSeleccionado ? normDepto(mapaState.deptoSeleccionado) : null;
  const deptoActivoData = (deptoSelNorm && porDepartamento[deptoSelNorm])
    ? porDepartamento[deptoSelNorm]
    : resumenNacional;

  return {
    porDepartamento,
    resumenNacional,
    deptoActivoData
  };
}