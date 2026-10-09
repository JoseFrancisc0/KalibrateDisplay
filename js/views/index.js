/* ==========================================================
   views/index.js — REGISTRO DE VISTAS.

   El orden de este arreglo define el orden de las pestañas,
   de los paneles del rail y de los contenedores del <main>.

   Para agregar una vista nueva:
     1. Crear views/<vista>/ con index.js (contrato en core/router.js),
        state.js, rail.js, acciones.js y su render.
     2. Importarla y agregarla aquí.
     3. (Opcional) su CSS en css/views/ y enlazarlo en index.html.
   ========================================================== */

import { matriz } from './matriz/index.js';
import { analisis } from './analisis/index.js';
import { alineacion } from './alineacion/index.js';
import { variacion } from './variacion/index.js';
import { estacion } from './estacion/index.js';
import { margenMercado } from './margen/index.js';

export const VISTAS = [matriz, analisis, alineacion, variacion, margenMercado];

// Nivel de detalle (no es una pestaña: se abre desde la Matriz)
export const NIVEL_ESTACION = estacion;
