/* ==========================================================
   views/detalle-estacion.js — Contenedor de Detalle de Estación
   ========================================================== */
import { state } from '../state.js';

export function detalleEstacionHTML() {
  return `
    <div id="detalle-estacion-shell" style="display: none; height: 100%; box-sizing: border-box; overflow: hidden; padding: 14px 16px;">
      <div style="background:#fff; border:1px solid var(--k-line); border-radius:8px; padding:16px 20px; box-shadow:0 2px 10px rgba(22,24,47,.05); height: 100%; display: flex; flex-direction: column; box-sizing: border-box;">
        
        <!-- Metadata superior de la estación -->
        <div id="estacion-meta-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 12px; margin-bottom: 14px;">
          <div>
            <h2 id="est-detalle-nombre" style="margin: 0; font-size: 1.2rem; font-weight: 800; color: var(--k-ink);">--</h2>
            <div id="est-detalle-ubicacion" style="margin-top: 3px; font-size: 0.74rem; color: var(--k-muted);">--</div>
          </div>
          <div id="est-detalle-badges" style="display: flex; gap: 8px;">
            <!-- Badges de Corredor, GPC, etc -->
          </div>
        </div>

        <!-- Área dinámica donde se inyectará la sub-vista seleccionada -->
        <div id="estacion-subview-content" style="flex: 1; position: relative; overflow-y: auto;">
          <!-- Aquí se montará: ESTADO ACTUAL, EVOLUCIÓN PRECIOS, DIFERENCIALES o VARIACIÓN -->
        </div>

      </div>
    </div>
  `;
}

export function renderDetalleEstacion() {
  const shell = document.getElementById('detalle-estacion-shell');
  if (!shell) return;

  const contentBox = document.getElementById('estacion-subview-content');
  const lblNombre = document.getElementById('est-detalle-nombre');
  const lblUbicacion = document.getElementById('est-detalle-ubicacion');
  const badgesBox = document.getElementById('est-detalle-badges');

  if (state.cargandoDetalleEstacion) {
    if (contentBox) contentBox.innerHTML = `<div class="empty-state">Descargando datos históricos de la estación...</div>`;
    return;
  }

  const est = state.estacionDataActiva;
  if (!est) {
    if (contentBox) contentBox.innerHTML = `<div class="empty-state">No se pudo cargar la información de la estación.</div>`;
    return;
  }

  // Llenar metadata
  if (lblNombre) lblNombre.innerText = est.estacion || 'ESTACIÓN';
  if (lblUbicacion) {
    lblUbicacion.innerText = `${est.coordenadas?.direccion || 'Sin dirección'} · ${est.departamento || ''}`;
  }
  if (badgesBox) {
    badgesBox.innerHTML = `
      <span class="leg-chip" style="background:#F1F5F9; color:#475569; font-weight:700;">${est.corredor || 'SIN CORREDOR'}</span>
      <span class="leg-chip" style="background:#F1F5F9; color:#475569; font-weight:700;">${est.gpc_group || 'SIN GPC'}</span>
    `;
  }

  // Placeholder temporal mientras construimos las 4 vistas
  if (contentBox) {
    contentBox.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #64748B;">
        <h3 style="margin: 0; color: var(--k-ink);">Sub-vista activa: ${state.subVistaEstacion}</h3>
        <p style="font-size: 0.85rem; margin-top: 6px;">Mecanismo de cambio de vista conectado correctamente.</p>
      </div>
    `;
  }
}