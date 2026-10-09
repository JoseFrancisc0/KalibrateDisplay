/* ==========================================================
   main.js — punto de entrada: arma la pantalla, conecta
   eventos y carga los datos.

   Mapa del código:
     config/   constantes (productos, logos, rutas de datos)
     core/     estado global, acceso a datos, eventos y router
     shared/   utilidades reutilizadas por varias vistas
     layout/   piezas fijas: nav superior, rail, barra de vistas
     views/    una carpeta por vista + registro (views/index.js)
   ========================================================== */

import { state } from './core/state.js';
import { cargarMatriz } from './core/data.js';
import { iniciarEventos, registrarAcciones } from './core/events.js';
import {
  configurarRouter, render, setVista, viewBarHTML,
  vistaActual, alRedimensionar
} from './core/router.js';

import { navHTML, actualizarNav } from './layout/nav.js';
import { railHTML } from './layout/rail.js';

import { VISTAS, NIVEL_ESTACION } from './views/index.js';
import { estacionesListadas } from './views/matriz/index.js';

/* ---------- 1. Eventos (antes que cualquier otro listener de document) ---------- */

iniciarEventos();

/* ---------- 2. Router ---------- */

configurarRouter({
  vistas: VISTAS,
  estacion: NIVEL_ESTACION,
  // El KPI de la barra superior refleja las estaciones del buscador de la Matriz
  alRenderGeneral: () => actualizarNav(estacionesListadas().length, state.rawData.actualizado_al),
});

/* ---------- 3. Armazón ---------- */

function montar(selector, html) {
  const nodo = document.querySelector(selector);
  if (nodo) nodo.innerHTML = html;
}

montar('#cmp-nav',    navHTML());
montar('#cmp-rail',   railHTML(VISTAS, NIVEL_ESTACION));
montar('#cmp-main',   viewBarHTML() + VISTAS.map(v => v.mainHTML()).join('') + NIVEL_ESTACION.mainHTML());
montar('#cmp-tabbar', VISTAS.map(v => v.tabbarHTML ? v.tabbarHTML() : '').join(''));

/* ---------- 4. Acciones y listeners de cada vista ---------- */

registrarAcciones({ setVista: (el) => setVista(el.dataset.arg) });
[...VISTAS, NIVEL_ESTACION].forEach(v => {
  if (v.acciones) registrarAcciones(v.acciones);
  if (v.iniciarListeners) v.iniciarListeners();
});

/* ---------- 5. Redimensionado / pantalla completa ---------- */

let ultAncho = window.innerWidth;
let ultAlto  = window.innerHeight;
let rt;

window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    const difAncho = Math.abs(window.innerWidth - ultAncho);
    const difAlto = Math.abs(window.innerHeight - ultAlto);

    if (difAncho < 25 && difAlto < 25) {
      return;
    }

    ultAncho = window.innerWidth;
    ultAlto  = window.innerHeight;

    alRedimensionar();
  }, 120);
});

document.addEventListener('fullscreenchange', alRedimensionar);

/* ---------- 6. Arranque ---------- */

async function iniciar() {
  try {
    state.rawData = await cargarMatriz();

    const inicial = vistaActual();
    if (inicial.alEntrar) inicial.alEntrar();
    if (inicial.alRedimensionar) inicial.alRedimensionar();
    render();
  } catch (err) {
    console.error("Error cargando JSON:", err);
  }
}

window.onload = iniciar;
