/* ==========================================================
   views/estacion/rail_base.js — Ficha técnica común de la estación en el rail.
   ========================================================== */
import { estacionState } from './state.js';

export function fichaEstacionHTML() {
  const est = estacionState.dataActiva;
  if (!est) {
    return `
      <div class="rail-label">Estación Seleccionada</div>
      <div style="font-size:0.75rem; color:#A08FA6;">Cargando estación...</div>
    `;
  }

  const direccion = est.coordenadas?.direccion || '—';
  const distrito = est.distrito || '—';
  const provincia = est.provincia || '—';
  const depto = est.departamento || '—';
  const zona = est.zona || '—';
  const corredor = est.corredor || '—';
  const gpc = est.gpc_group || '—';
  const nombre = est.estacion || 'ESTACIÓN';

  return `
    <div class="rail-label">Estación Seleccionada</div>

    <!-- NOMBRE ENMARCADO -->
    <div class="estacion-rail-card">
      <div class="estacion-rail-title">${nombre}</div>
    </div>

    <!-- LISTA DESCRIPTIVA -->
    <div class="estacion-rail-list">
      <div class="estacion-rail-field">
        <span class="estacion-rail-label">Dirección</span>
        <span class="estacion-rail-val">${direccion}</span>
      </div>
      <div class="estacion-rail-field">
        <span class="estacion-rail-label">Distrito / Provincia</span>
        <span class="estacion-rail-val">${distrito} · ${provincia}</span>
      </div>
      <div class="estacion-rail-field">
        <span class="estacion-rail-label">Departamento</span>
        <span class="estacion-rail-val">${depto}</span>
      </div>
      <div class="estacion-rail-field">
        <span class="estacion-rail-label">Zona</span>
        <span class="estacion-rail-val">${zona}</span>
      </div>
      <div class="estacion-rail-field">
        <span class="estacion-rail-label">Corredor</span>
        <span class="estacion-rail-val">${corredor}</span>
      </div>
      <div class="estacion-rail-field">
        <span class="estacion-rail-label">GPC Group</span>
        <span class="estacion-rail-val">${gpc}</span>
      </div>
    </div>
  `;
}