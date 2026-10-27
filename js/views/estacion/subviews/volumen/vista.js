/* ==========================================================
   views/estacion/subviews/volumen/vista.js
   ========================================================== */
import { volumenSubViewState } from './state.js';
import { renderGraficosVolumen } from './graficos.js';

export function renderVolumenSubView(container, estacionData) {
  const historico = estacionData.volumen_historico || [];
  const esEvolutivo = volumenSubViewState.tabInterna === 'EVOLUTIVO';

  // Métricas acumuladas del mes en curso (Octubre)
  const registrosOctubre = historico.filter(r => r.fecha >= '2026-10-01');
  const volTotalOct = registrosOctubre.reduce((acc, r) => acc + (r.volumen || 0), 0);
  const vtsTotalOct = registrosOctubre.reduce((acc, r) => acc + (r.ventas || 0), 0);
  const mgTotalOct = registrosOctubre.reduce((acc, r) => acc + (r.margen_minorista || 0), 0);
  const mgUnitProm = volTotalOct > 0 ? (mgTotalOct / volTotalOct) : 0;

  container.innerHTML = `
  <div style="display: flex; flex-direction: column; width: 100%; height: 100%; padding: 14px 18px; box-sizing: border-box; overflow-y: auto;">
    
    <!-- 1. KPI STRIP OPERATIVO SUPERIOR -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; flex: 0 0 auto;">
      <div style="background: #fff; border: 1px solid var(--k-line); border-radius: 6px; padding: 10px 14px;">
        <span style="font-size: 0.62rem; font-weight: 700; color: var(--k-muted); text-transform: uppercase;">Volumen Acumulado (Mes)</span>
        <div style="font-size: 1.25rem; font-weight: 800; color: #00D58A; margin-top: 2px;">
          ${volTotalOct.toLocaleString('es-PE', { maximumFractionDigits: 0 })} <span style="font-size: 0.75rem; color: var(--k-ink);">gal</span>
        </div>
      </div>
      <div style="background: #fff; border: 1px solid var(--k-line); border-radius: 6px; padding: 10px 14px;">
        <span style="font-size: 0.62rem; font-weight: 700; color: var(--k-muted); text-transform: uppercase;">Facturación Calle (Mes)</span>
        <div style="font-size: 1.25rem; font-weight: 800; color: var(--k-ink); margin-top: 2px;">
          S/ ${vtsTotalOct.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
        </div>
      </div>
      <div style="background: #fff; border: 1px solid var(--k-line); border-radius: 6px; padding: 10px 14px;">
        <span style="font-size: 0.62rem; font-weight: 700; color: var(--k-muted); text-transform: uppercase;">Masa de Margen Minorista</span>
        <div style="font-size: 1.25rem; font-weight: 800; color: #0284C7; margin-top: 2px;">
          S/ ${mgTotalOct.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
        </div>
      </div>
      <div style="background: #fff; border: 1px solid var(--k-line); border-radius: 6px; padding: 10px 14px;">
        <span style="font-size: 0.62rem; font-weight: 700; color: var(--k-muted); text-transform: uppercase;">Margen Unitario Efectivo</span>
        <div style="font-size: 1.25rem; font-weight: 800; color: var(--k-ink); margin-top: 2px;">
          S/ ${mgUnitProm.toFixed(2)} <span style="font-size: 0.70rem; color: var(--k-muted);">/ gal</span>
        </div>
      </div>
    </div>

    <!-- 2. CONTENEDOR DE GRÁFICOS INTERACTIVOS -->
    <div style="flex: 1 1 0; min-height: 0; width: 100%;">
      ${!esEvolutivo ? `
        <!-- VISTA A: FOTO COMERCIAL (Mix Donut 40% + Barras Semanales 60%) -->
        <div style="display: flex; gap: 12px; height: 100%; width: 100%;">
          <div style="flex: 0 0 38%; height: 100%; background: #fff; border: 1px solid var(--k-line); border-radius: 8px; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column;">
            <div style="font-family:'Poppins',sans-serif; font-size: 0.82rem; font-weight: 800; color: var(--k-ink); margin-bottom: 2px;">
              Mix de Ventas por Producto
            </div>
            <div style="font-size: 0.65rem; color: var(--k-muted); margin-bottom: 8px;">Participación sobre el volumen total del mes.</div>
            <div style="flex: 1; position: relative; min-height: 220px;">
              <canvas id="chart-volumen-mix-donut"></canvas>
            </div>
          </div>

          <div style="flex: 1 1 62%; height: 100%; background: #fff; border: 1px solid var(--k-line); border-radius: 8px; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <div style="font-family:'Poppins',sans-serif; font-size: 0.82rem; font-weight: 800; color: var(--k-ink);">
                Comportamiento por Día de la Semana
              </div>
              <span class="count-badge" style="font-size: 0.65rem; font-weight: 700;">
                ${volumenSubViewState.metricaSemanal === 'VOLUMEN' ? 'VOLUMEN TOTAL (GAL)' : 'VENTAS TOTALES (S/)'}
              </span>
            </div>
            <div style="font-size: 0.65rem; color: var(--k-muted); margin-bottom: 8px;">Semana en curso vs semana anterior (Lunes a Domingo).</div>
            <div style="flex: 1; position: relative; min-height: 220px;">
              <canvas id="chart-volumen-semanal-barras"></canvas>
            </div>
          </div>
        </div>
      ` : `
        <!-- VISTA B: EVOLUTIVOS (Benchmark M vs M-1 arriba + Cruce Ventas vs Volumen abajo) -->
        <div style="display: flex; flex-direction: column; gap: 12px; height: 100%; width: 100%;">
          <div style="flex: 1 1 50%; min-height: 210px; background: #fff; border: 1px solid var(--k-line); border-radius: 8px; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column;">
            <div style="font-family:'Poppins',sans-serif; font-size: 0.82rem; font-weight: 800; color: var(--k-ink);">
              Benchmark de Volumen: Octubre vs Septiembre (Día 1 al 26)
            </div>
            <div style="font-size: 0.65rem; color: var(--k-muted); margin-bottom: 6px;">Comparativa homóloga del ritmo diario para: <b>${volumenSubViewState.productoEvolutivo.toUpperCase()}</b></div>
            <div style="flex: 1; position: relative;">
              <canvas id="chart-volumen-benchmark-meses"></canvas>
            </div>
          </div>

          <div style="flex: 1 1 50%; min-height: 210px; background: #fff; border: 1px solid var(--k-line); border-radius: 8px; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column;">
            <div style="font-family:'Poppins',sans-serif; font-size: 0.82rem; font-weight: 800; color: var(--k-ink);">
              Sensibilidad Comercial: Volumen Despachado vs Precio Ponderado
            </div>
            <div style="font-size: 0.65rem; color: var(--k-muted); margin-bottom: 6px;">Cruce dual diario de demanda física frente a precio facturado.</div>
            <div style="flex: 1; position: relative;">
              <canvas id="chart-volumen-cruce-dual"></canvas>
            </div>
          </div>
        </div>
      `}
    </div>

  </div>
  `;

  // Renderizar gráficos con Chart.js
  renderGraficosVolumen(historico);
}