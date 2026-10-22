/* ==========================================================
   views/mercado/acciones.js — Controladores reactivos
   ========================================================== */
import { render } from '../../core/router.js';
import { state } from '../../core/state.js';
import { cargarHistoricoMarcas } from '../../core/data.js';
import { valorDe, alternarDesplegable, cerrarAlClicFuera, repoblarSelect } from '../../shared/dom.js';
import { inicializarSearchableSelect } from '../../shared/combobox.js';
import { poblarSelectsSegmentacion, valoresUnicos } from '../../shared/segmentacion.js';
import { margenMercadoState } from './state.js';

export async function entrarMargenMercado() {
  if (!margenMercadoState.historicoMarcasData && !margenMercadoState.cargandoHistorico) {
    margenMercadoState.cargandoHistorico = true;
    render();
    try {
      margenMercadoState.historicoMarcasData = await cargarHistoricoMarcas();
    } catch (e) {
      console.error("Error cargando histórico en Análisis Mercado:", e);
    } finally {
      margenMercadoState.cargandoHistorico = false;
    }
  }

  poblarFiltrosMargenMercado();
  sincronizarInputsFechaMM();
  render();
}

function sincronizarInputsFechaMM() {
  const inF1 = document.getElementById('txt-mm-f1');
  const inF2 = document.getElementById('txt-mm-f2');
  if (inF1) inF1.value = margenMercadoState.fechaInicio;
  if (inF2) inF2.value = margenMercadoState.fechaFin;

  const inP = document.getElementById('sel-mm-prod');
  if (inP) inP.value = margenMercadoState.producto;
}

function sincronizarCascadaGeograficaMM(estaciones) {
  const estacionesDepto = estaciones.filter(e => {
    if (margenMercadoState.departamento === 'TODOS') return true;
    const d = (e.departamento || '').trim().toUpperCase();
    return d === margenMercadoState.departamento;
  });

  margenMercadoState.provincia = repoblarSelect(
    'sel-mm-provincia',
    () => valoresUnicos(estacionesDepto, 'provincia'),
    margenMercadoState.provincia
  );

  const estacionesProv = estacionesDepto.filter(e => {
    if (margenMercadoState.provincia === 'TODOS') return true;
    const p = (e.provincia || '').trim().toUpperCase();
    return p === margenMercadoState.provincia;
  });

  margenMercadoState.distrito = repoblarSelect(
    'sel-mm-distrito',
    () => valoresUnicos(estacionesProv, 'distrito'),
    margenMercadoState.distrito
  );
}

export function poblarFiltrosMargenMercado() {
  if (!state.rawData?.estaciones) return;
  const estaciones = state.rawData.estaciones;

  poblarSelectsSegmentacion(estaciones, {
    gpc: 'sel-mm-gpc',
    gop: 'sel-mm-gop',
    jop: 'sel-mm-jop',
    corredor: 'sel-mm-corredor',
    departamento: 'sel-mm-depto'
  });

  sincronizarCascadaGeograficaMM(estaciones);

  [
    'sel-mm-gpc',
    'sel-mm-gop',
    'sel-mm-jop',
    'sel-mm-corredor',
    'sel-mm-depto',
    'sel-mm-provincia',
    'sel-mm-distrito'
  ].forEach(id => {
    inicializarSearchableSelect(id);
  });

  if (margenMercadoState.historicoMarcasData?.datos) {
    const setM = new Set();
    margenMercadoState.historicoMarcasData.datos.forEach(d => {
      let m = (d.m || '').trim().toUpperCase();
      if (m === 'PRIMAX') m = 'COESTI';
      if (m) setM.add(m);
    });
    margenMercadoState.marcasDisponibles = Array.from(setM).sort();

    if (!margenMercadoState.marcasSeleccionadas) {
      margenMercadoState.marcasSeleccionadas = new Set(margenMercadoState.marcasDisponibles);
    }
  }

  construirChecklistMarcasMM();
}

export function refrescarChecklistMarcasMMDOM() {
  const container = document.getElementById('checklist-mm-marcas-items');
  if (container && margenMercadoState.marcasDisponibles) {
    container.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      const marca = chk.value;
      const isChecked = margenMercadoState.marcasSeleccionadas
        ? margenMercadoState.marcasSeleccionadas.has(marca)
        : true;
      chk.checked = isChecked;
    });
  }

  const badgeConteo = document.getElementById('mm-marcas-conteo');
  if (badgeConteo && margenMercadoState.marcasDisponibles && margenMercadoState.marcasSeleccionadas) {
    const total = margenMercadoState.marcasDisponibles.length;
    const sel = margenMercadoState.marcasSeleccionadas.size;
    badgeConteo.textContent = (sel === total) ? 'Todas' : `${sel}/${total}`;
  }
}

function construirChecklistMarcasMM() {
  const container = document.getElementById('checklist-mm-marcas-items');
  if (!container || !margenMercadoState.marcasDisponibles) return;

  container.innerHTML = '';
  margenMercadoState.marcasDisponibles.forEach(marca => {
    const isChecked = margenMercadoState.marcasSeleccionadas 
      ? margenMercadoState.marcasSeleccionadas.has(marca) 
      : true;
    const labelDisplay = (marca === 'PRIMAX' || marca === 'COESTI') 
      ? 'COESTI (PRIMAX)' 
      : (marca === 'WP' ? 'WHITE PRODUCTS' : marca);

    const row = document.createElement('label');
    row.className = 'multiselect-item';
    row.innerHTML = `
      <input type="checkbox" value="${marca}" ${isChecked ? 'checked' : ''} data-change="onToggleMMMarcaCheck">
      <span>${labelDisplay}</span>
    `;
    container.appendChild(row);
  });

  const badgeConteo = document.getElementById('mm-marcas-conteo');
  if (badgeConteo && margenMercadoState.marcasSeleccionadas) {
    const total = margenMercadoState.marcasDisponibles.length;
    const sel = margenMercadoState.marcasSeleccionadas.size;
    badgeConteo.textContent = (sel === total) ? 'Todas' : `${sel}/${total}`;
  }
}

export function iniciarListenersMargenMercado() {
  cerrarAlClicFuera('section-mm-marcas', 'dropdown-mm-marcas-content');
}

export const acciones = {
  toggleDrawerMM() {
    margenMercadoState.drawerAbierto = !margenMercadoState.drawerAbierto;
    const panel = document.getElementById('drawer-panel-mm');
    const badge = document.getElementById('badge-mm-filtros');
    if (panel) panel.style.display = margenMercadoState.drawerAbierto ? 'block' : 'none';
    if (badge) badge.textContent = margenMercadoState.drawerAbierto ? '▲ Ocultar' : '▼ Configurar';
  },

  togglePillMetricaMM(el) {
    const metrica = el.dataset.arg;
    if (!metrica) return;

    if (margenMercadoState.metricasActivas.has(metrica)) {
      if (margenMercadoState.metricasActivas.size > 1) {
        margenMercadoState.metricasActivas.delete(metrica);
      }
    } else {
      margenMercadoState.metricasActivas.add(metrica);
    }

    document.querySelectorAll('.mm-metric-pill').forEach(btn => {
      const arg = btn.dataset.arg;
      const activo = margenMercadoState.metricasActivas.has(arg);
      btn.classList.toggle('active', activo);
      btn.style.borderColor = activo ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.18)';
      btn.style.background = activo ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.06)';
      btn.style.color = activo ? 'var(--k-plum, #16182F)' : '#D6CBD9';
    });

    render();
  },

  cambiarF1MM(el) {
    if (!el.value) return;
    margenMercadoState.fechaInicio = el.value;
    render();
  },

  cambiarF2MM(el) {
    if (!el.value) return;
    margenMercadoState.fechaFin = el.value;
    render();
  },

  cambiarProductoMM(el) {
    const v = el?.value || valorDe('sel-mm-prod');
    if (v) margenMercadoState.producto = v;
    render();
  },

  cambiarGPCMM() {
    const v = valorDe('sel-mm-gpc');
    if (v !== undefined) margenMercadoState.gpc = v;
    render();
  },

  cambiarGOPMM() {
    const v = valorDe('sel-mm-gop');
    if (v !== undefined) margenMercadoState.gop = v;
    render();
  },

  cambiarJOPMM() {
    const v = valorDe('sel-mm-jop');
    if (v !== undefined) margenMercadoState.jop = v;
    render();
  },

  cambiarCorredorMM(el) {
    const v = el?.value || valorDe('sel-mm-corredor');
    if (v !== undefined) margenMercadoState.corredor = v;
    render();
  },

  cambiarDeptoMM(el) {
    const v = el?.value || valorDe('sel-mm-depto');
    if (v !== undefined) {
      margenMercadoState.departamento = v;
      sincronizarCascadaGeograficaMM(state.rawData.estaciones);
    }
    render();
  },

  cambiarProvinciaMM(el) {
    const v = el?.value || valorDe('sel-mm-provincia');
    if (v !== undefined) {
      margenMercadoState.provincia = v;
      sincronizarCascadaGeograficaMM(state.rawData.estaciones);
    }
    render();
  },

  cambiarDistritoMM(el) {
    const v = el?.value || valorDe('sel-mm-distrito');
    if (v !== undefined) margenMercadoState.distrito = v;
    render();
  },

  limpiarFiltrosMM() {
    const ids = [
      'sel-mm-gpc', 'sel-mm-gop', 'sel-mm-jop',
      'sel-mm-corredor', 'sel-mm-depto',
      'sel-mm-provincia', 'sel-mm-distrito'
    ];

    margenMercadoState.gpc = 'TODOS';
    margenMercadoState.gop = 'TODOS';
    margenMercadoState.jop = 'TODOS';
    margenMercadoState.corredor = 'TODOS';
    margenMercadoState.departamento = 'TODOS';
    margenMercadoState.provincia = 'TODOS';
    margenMercadoState.distrito = 'TODOS';

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = 'TODOS';
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    sincronizarCascadaGeografica(state.rawData.estaciones);
    render();
  },

  toggleDropdownMMMarcas(el) {
    alternarDesplegable(el, 'dropdown-mm-marcas-content');
  },

  marcarTodasMMMarcas(el) {
    if (el.dataset.arg === 'true') {
      margenMercadoState.marcasSeleccionadas = new Set(margenMercadoState.marcasDisponibles);
    } else {
      margenMercadoState.marcasSeleccionadas = new Set(['COESTI']);
    }
    construirChecklistMarcasMM();
    render();
  },

  onToggleMMMarcaCheck(el) {
    const marca = el.value;
    if (!margenMercadoState.marcasSeleccionadas) {
      margenMercadoState.marcasSeleccionadas = new Set(margenMercadoState.marcasDisponibles);
    }
    if (el.checked) {
      margenMercadoState.marcasSeleccionadas.add(marca);
    } else {
      margenMercadoState.marcasSeleccionadas.delete(marca);
    }
    const badgeConteo = document.getElementById('mm-marcas-conteo');
    if (badgeConteo) {
      const total = margenMercadoState.marcasDisponibles.length;
      const sel = margenMercadoState.marcasSeleccionadas.size;
      badgeConteo.textContent = (sel === total) ? 'Todas' : `${sel}/${total}`;
    }
    render();
  }
};