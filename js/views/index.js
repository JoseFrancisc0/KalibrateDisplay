/* ==========================================================
   views/index.js — REGISTRO DE VISTAS.
   ========================================================== */

import { matriz } from './matriz/index.js';
import { analisis } from './analisis/index.js';
import { alineacion } from './alineacion/index.js';
import { variacion } from './variacion/index.js';
import { estacion } from './estacion/index.js';
import { margenMercado } from './mercado/index.js';
import { competenciaSemanal } from './competencia/index.js';
import { mapa } from './mapa/index.js';
import { heatmap } from './heatmap/index.js';

export const CAPAS = [
  {
    id: 'CAPA_CONTROL',
    label: 'CONTROL ROOM & ESTADO',
    vistas: [
      // Aquí entrará 'cockpit' como primera vista
      matriz,     // 'PRECIOS'
      analisis,   // 'ANÁLISIS'
      alineacion  // 'ALINEACIÓN'
    ]
  },
  {
    id: 'CAPA_TENDENCIAS',
    label: 'TENDENCIAS & TIEMPO',
    vistas: [
      competenciaSemanal, // 'COMPETENCIA SEMANAL'
      margenMercado,      // 'MERCADO'
      variacion           // 'VARIACIÓN'
    ]
  },
  {
    id: 'CAPA_TERRITORIO',
    label: 'RED & TERRITORIO',
    vistas: [
      mapa,    // 'COBERTURA'
      heatmap  // 'HEATMAP'
    ]
  }
];

export const VISTAS = CAPAS.flatMap(c => c.vistas);
export const NIVEL_ESTACION = estacion;
