/* ==========================================================
   view-bar.js — Barra horizontal de cambio de vista y contexto.
   ========================================================== */

export function viewBarHTML() {
  return `
    <div class="view-bar">
      <div class="view-lead">Vistas</div>
      <div class="view-tabs">
        <button id="tab-view-matriz" class="view-tab active" onclick="setVista('MATRIZ')">Matriz Competitiva</button>
        <button id="tab-view-analisis" class="view-tab" onclick="setVista('ANALISIS')">Análisis Ponderado</button>
      </div>
      <div class="view-spacer"></div>
      <div class="view-mode" id="view-mode">Métrica activa: Precios</div>
    </div>
  `;
}