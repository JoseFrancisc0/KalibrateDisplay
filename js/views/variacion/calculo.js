/* ==========================================================
   views/variacion/calculo.js — variación de precio y margen
   (promedio ponderado por nº de estaciones).
   ========================================================== */
import { variacionState } from './state.js';

export const MARCA_PROPIA = 'COESTI';

function redondear2(v) {
  return Math.round(v * 100) / 100;
}

/** Precio ponderado y costo de una marca en la última fecha <= f1 y <= f2. */
function preciosEnRango(mapaFechas, f1, f2) {
  const fechas = Object.keys(mapaFechas).sort();
  if (fechas.length === 0) return null;

  const fechasF1 = fechas.filter(f => f <= f1);
  const fechasF2 = fechas.filter(f => f <= f2);

  if (fechasF1.length === 0 || fechasF2.length === 0) return null;

  const dataF1 = mapaFechas[fechasF1[fechasF1.length - 1]];
  const dataF2 = mapaFechas[fechasF2[fechasF2.length - 1]];

  return {
    p1: dataF1.pesoTotal > 0 ? (dataF1.suma / dataF1.pesoTotal) : 0,
    p2: dataF2.pesoTotal > 0 ? (dataF2.suma / dataF2.pesoTotal) : 0,
    costoF2: (dataF2.pesoCosto > 0) ? (dataF2.sumaCosto / dataF2.pesoCosto) : null,
    pesoF2: dataF2.pesoTotal
  };
}

export function procesarVariacionHistorica() {
  if (!variacionState.historicoMarcasData || !variacionState.historicoMarcasData.datos) return [];

  const prodSel = variacionState.producto || 'Diesel';
  const f1 = variacionState.fechaInicio;
  const f2 = variacionState.fechaFin;

  const gpcSel = variacionState.gpc || 'TODOS';
  const gopSel = variacionState.gop || 'TODOS';
  const jopSel = variacionState.jop || 'TODOS';
  const corrSel = variacionState.corredor || 'TODOS';
  const deptoSel = variacionState.departamento || 'TODOS';
  const provSel = variacionState.provincia || 'TODOS';
  const distSel = variacionState.distrito || 'TODOS';

  const observaciones = variacionState.historicoMarcasData.datos.filter(item => {
    if (item.p !== prodSel) return false;

    const gpc = (item.g || item.gpc || '').trim().toUpperCase();
    const gop = (item.gop || '').trim().toUpperCase();
    const jop = (item.jop || '').trim().toUpperCase();
    const c = (item.c || '').trim().toUpperCase();
    const d = (item.d || '').trim().toUpperCase();
    const pv = (item.pv || '').trim().toUpperCase();
    const dt = (item.dt || '').trim().toUpperCase();

    return (gpcSel === 'TODOS' || gpc === gpcSel) &&
           (gopSel === 'TODOS' || gop === gopSel) &&
           (jopSel === 'TODOS' || jop === jopSel) &&
           (corrSel === 'TODOS' || c === corrSel) &&
           (deptoSel === 'TODOS' || d === deptoSel) &&
           (provSel === 'TODOS' || pv === provSel) &&
           (distSel === 'TODOS' || dt === distSel);
  });

  const observacionesNormalizadas = observaciones.map(item => {
    let m = (item.m || '').trim().toUpperCase();
    if (m === 'PRIMAX') m = MARCA_PROPIA;
    return { ...item, m_std: m };
  });

  const marcasSet = new Set(observacionesNormalizadas.map(o => o.m_std));
  variacionState.marcasDisponibles = Array.from(marcasSet).sort();

  if (!variacionState.marcasSeleccionadas) {
    variacionState.marcasSeleccionadas = new Set(variacionState.marcasDisponibles);
  }

  // Agrupador por marca y fecha (acumula precio y costo COESTI)
  const marcaFechaMap = {};
  const costoCoestiFechaMap = {};

  observacionesNormalizadas.forEach(item => {
    if (!marcaFechaMap[item.m_std]) marcaFechaMap[item.m_std] = {};
    if (!marcaFechaMap[item.m_std][item.f]) {
      marcaFechaMap[item.m_std][item.f] = { suma: 0, pesoTotal: 0, sumaCosto: 0, pesoCosto: 0 };
    }
    const entry = marcaFechaMap[item.m_std][item.f];
    entry.suma += (item.pr * item.n);
    entry.pesoTotal += item.n;

    if (item.cs !== undefined && item.cs !== null && item.cs > 0) {
      entry.sumaCosto += (item.cs * item.n);
      entry.pesoCosto += item.n;

      if (!costoCoestiFechaMap[item.f]) costoCoestiFechaMap[item.f] = { suma: 0, pesoTotal: 0 };
      costoCoestiFechaMap[item.f].suma += (item.cs * item.n);
      costoCoestiFechaMap[item.f].pesoTotal += item.n;
    }
  });

  // Costo representativo COESTI a la fecha de corte (f2)
  const fechasCosto = Object.keys(costoCoestiFechaMap).sort().filter(f => f <= f2);
  let costoMacroF2 = null;
  if (fechasCosto.length > 0) {
    const ult = costoCoestiFechaMap[fechasCosto[fechasCosto.length - 1]];
    costoMacroF2 = ult.pesoTotal > 0 ? (ult.suma / ult.pesoTotal) : null;
  }

  const referencia = marcaFechaMap[MARCA_PROPIA]
    ? preciosEnRango(marcaFechaMap[MARCA_PROPIA], f1, f2)
    : null;

  const resultados = [];
  const marcas = Object.keys(marcaFechaMap);

  marcas.forEach(marca => {
    if (!variacionState.marcasSeleccionadas.has(marca)) return;

    const precios = preciosEnRango(marcaFechaMap[marca], f1, f2);
    if (!precios) return;

    const { p1, p2, costoF2, pesoF2 } = precios;
    const delta = p2 - p1;

    const conDiff = marca !== MARCA_PROPIA && referencia;

    // Margen actual sobre costo propio vigente
    const costoRef = costoF2 || costoMacroF2;
    const margenActual = (costoRef && p2 > 0) ? redondear2(p2 - costoRef) : null;

    resultados.push({
      marca,
      precioF1: p1,
      precioF2: p2,
      delta: Number(delta.toFixed(3)),
      conteoEess: pesoF2,
      diffF1: conDiff ? redondear2(redondear2(p1) - redondear2(referencia.p1)) : null,
      diffF2: conDiff ? redondear2(redondear2(p2) - redondear2(referencia.p2)) : null,
      margenActual
    });
  });

  resultados.sort((a, b) => a.precioF2 - b.precioF2);
  return resultados;
}