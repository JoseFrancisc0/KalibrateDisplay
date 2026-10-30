/* ==========================================================
   core/state.js — estado GLOBAL del visor.
   Cada vista guarda su propio estado en views/<vista>/state.js
   ========================================================== */

export const state = {
  rawData: null,                // matriz_precios.json
  capaActiva: 'CAPA_CONTROL',   // 'CAPA_CONTROL' | 'CAPA_TENDENCIAS' | 'CAPA_TERRITORIO'
  vistaActiva: 'COCKPIT',        // id de la vista general activa (ver views/index.js)
  modoNivel: 'GENERAL',         // 'GENERAL' | 'ESTACION'
};
