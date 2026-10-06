/* ==========================================================
   views/variacion/calculo.js — variación de precio por marca
   entre f1 y f2 (promedio ponderado por nº de estaciones).
   Sin DOM. Además actualiza la lista de marcas disponibles
   para el checklist del rail.

   Alcance de estaciones competidoras (variacionState.alcance):
     'AREA' → todas las competidoras del área de influencia
     'LM'   → solo las competidoras Local Market (main marker)
              del producto; requiere el campo `lm` en
              historico_marcas.json. COESTI siempre entra completo.
   ========================================================== */
import { variacionState } from './state.js';

export const MARCA_PROPIA = 'COESTI';

/** ¿El histórico cargado trae la marca Local Market (`lm`) por registro? */
export function historicoTieneLM() {
  const datos = variacionState.historicoMarcasData?.datos;
  return !!(datos && datos.some(item => 'lm' in item));
}

function redondear2(v) {
  return Math.round(v * 100) / 100;
}

/** Precio ponderado de una marca en la última fecha ≤ f1 y ≤ f2. */
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
    pesoF2: dataF2.pesoTotal
  };
}

export function procesarVariacionHistorica() {
  if (!variacionState.historicoMarcasData || !variacionState.historicoMarcasData.datos) return [];

  const prodSel = variacionState.producto || 'Diesel';
  const f1 = variacionState.fechaInicio;
  const f2 = variacionState.fechaFin;

  const corrSel = variacionState.corredor || 'TODOS';
  const deptoSel = variacionState.departamento || 'TODOS';
  const gpcSel = variacionState.gpcGroup || 'TODOS';
  const soloLM = variacionState.alcance === 'LM';

  const observaciones = variacionState.historicoMarcasData.datos.filter(item => {
    if (item.p !== prodSel) return false;

    const c = (item.c || '').trim().toUpperCase();
    const d = (item.d || '').trim().toUpperCase();
    const g = (item.g || '').trim().toUpperCase();

    const matchCorr = (corrSel === 'TODOS' || c === corrSel);
    const matchDepto = (deptoSel === 'TODOS' || d === deptoSel);
    const matchGpc = (gpcSel === 'TODOS' || g === gpcSel);

    return matchCorr && matchDepto && matchGpc;
  });

  const observacionesNormalizadas = observaciones
    .map(item => {
      let m = (item.m || '').trim().toUpperCase();
      if (m === 'PRIMAX') m = MARCA_PROPIA;
      return { ...item, m_std: m };
    })
    // Modo Local Market: COESTI completo + solo competidoras marcadas como LM
    .filter(item => !soloLM || item.m_std === MARCA_PROPIA || item.lm === true);

  const marcasSet = new Set(observacionesNormalizadas.map(o => o.m_std));
  variacionState.marcasDisponibles = Array.from(marcasSet).sort();

  if (!variacionState.marcasSeleccionadas) {
    variacionState.marcasSeleccionadas = new Set(variacionState.marcasDisponibles);
  }

  // Se acumulan TODAS las marcas: COESTI sirve de referencia para el
  // diferencial aunque esté desmarcada en el filtro de marcas.
  const marcaFechaMap = {};

  observacionesNormalizadas.forEach(item => {
    if (!marcaFechaMap[item.m_std]) marcaFechaMap[item.m_std] = {};
    if (!marcaFechaMap[item.m_std][item.f]) {
      marcaFechaMap[item.m_std][item.f] = { suma: 0, pesoTotal: 0 };
    }
    const entry = marcaFechaMap[item.m_std][item.f];
    entry.suma += (item.pr * item.n);
    entry.pesoTotal += item.n;
  });

  const referencia = marcaFechaMap[MARCA_PROPIA]
    ? preciosEnRango(marcaFechaMap[MARCA_PROPIA], f1, f2)
    : null;

  const resultados = [];

  Object.keys(marcaFechaMap).forEach(marca => {
    if (!variacionState.marcasSeleccionadas.has(marca)) return;

    const precios = preciosEnRango(marcaFechaMap[marca], f1, f2);
    if (!precios) return;

    const { p1, p2, pesoF2 } = precios;
    const delta = p2 - p1;

    // Diferencial vs COESTI sobre los precios mostrados (2 decimales),
    // para que la resta cuadre con lo que se ve en pantalla.
    const conDiff = marca !== MARCA_PROPIA && referencia;

    resultados.push({
      marca,
      precioF1: p1,
      precioF2: p2,
      delta: Number(delta.toFixed(3)),
      conteoEess: pesoF2,
      diffF1: conDiff ? redondear2(redondear2(p1) - redondear2(referencia.p1)) : null,
      diffF2: conDiff ? redondear2(redondear2(p2) - redondear2(referencia.p2)) : null
    });
  });

  // Orden estricto de menor a mayor variación neta
  resultados.sort((a, b) => a.delta - b.delta);

  return resultados;
}
