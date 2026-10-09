/* ==========================================================
   views/matriz/paginacion.js — reparto de estaciones en pestañas.
   ========================================================== */

import { matrizState as state } from './state.js';
import { ROW_H, THEAD_H, getAgrupacion } from './config.js';

export function recalcularCapacidad() {
  const shell = document.getElementById('table-scroll');
  const h = shell ? shell.clientHeight : 600;
  const n = Math.floor((h - THEAD_H - 2) / ROW_H);
  state.filasPorPagina = Math.max(5, n);
}

export function formatearNombreGrupo(valor, agrupacion) {
  const v = (valor || '').trim().toUpperCase();
  const pref = (agrupacion && agrupacion.prefijo) ? agrupacion.prefijo : '';
  if (pref && v.startsWith(pref)) {
    return v.slice(pref.length).trim() || v;
  }
  return v;
}

function clave(v, sinValor) {
  return (v && String(v).trim()) ? String(v).trim().toUpperCase() : sinValor;
}

export function construirTabs(lista, onSelect) {
  const agr = getAgrupacion(state.agrupacionTabs);

  // -------------------------------------------------------------
  // CASO A: MODO JERÁRQUICO (UBICACION: Depto -> Prov -> Dist)
  // -------------------------------------------------------------
  if (agr.esJerarquico) {
    construirTabsJerarquicas(lista, agr, onSelect);
    return;
  }

  // -------------------------------------------------------------
  // CASO B: MODO PLANO (CORREDOR, ZONA, GPC)
  // -------------------------------------------------------------
  const grupos = {};
  lista.forEach(est => {
    const k = clave(est[agr.campo], agr.sinValor);
    if (!grupos[k]) grupos[k] = [];
    grupos[k].push(est);
  });

  state.gruposMap = grupos;
  state.grupos = Object.keys(grupos).sort((a, b) => {
    if (a === agr.sinValor) return 1;
    if (b === agr.sinValor) return -1;
    return a.localeCompare(b);
  });

  if (!state.grupos.includes(state.grupoActivo)) {
    const recordado = state.grupoActivoPorAgrupacion[agr.id];
    state.grupoActivo = state.grupos.includes(recordado) ? recordado : (state.grupos[0] || '');
    state.subPaginaGrupo = 0;
  }
  state.grupoActivoPorAgrupacion[agr.id] = state.grupoActivo;

  actualizarDOMTabs(agr, lista.length, false, onSelect);
}

function construirTabsJerarquicas(lista, agr, onSelect) {
  const grupos = {};

  // NIVEL 1: DEPARTAMENTOS
  if (state.jerarquiaNivel === 'DEPTO') {
    lista.forEach(est => {
      const d = clave(est.departamento, 'SIN DEPARTAMENTO');
      if (!grupos[d]) grupos[d] = [];
      grupos[d].push(est);
    });

    state.gruposMap = grupos;
    state.grupos = Object.keys(grupos).sort((a, b) => a.localeCompare(b));

    if (!state.grupos.includes(state.grupoActivo)) {
      state.grupoActivo = state.deptoActivo || state.grupos[0] || '';
      state.subPaginaGrupo = 0;
    }
    state.deptoActivo = state.grupoActivo;

    actualizarDOMTabs(agr, lista.length, false, onSelect, (itemGrupo) => {
      // Al hacer clic en un Departamento, profundiza a PROVINCIA
      state.deptoActivo = itemGrupo;
      state.jerarquiaNivel = 'PROVINCIA';
      state.provinciaActiva = 'TODAS';
      state.grupoActivo = 'TODAS';
      state.subPaginaGrupo = 0;
      onSelect();
    });
    return;
  }

  // Filtrar estaciones pertenecientes al Departamento seleccionado
  const listaEnDepto = lista.filter(e => clave(e.departamento, 'SIN DEPARTAMENTO') === state.deptoActivo);

  // NIVEL 2: PROVINCIAS
  if (state.jerarquiaNivel === 'PROVINCIA') {
    grupos['TODAS'] = listaEnDepto;
    listaEnDepto.forEach(est => {
      const p = clave(est.provincia, 'SIN PROVINCIA');
      if (!grupos[p]) grupos[p] = [];
      grupos[p].push(est);
    });

    state.gruposMap = grupos;
    const provs = Object.keys(grupos).filter(k => k !== 'TODAS').sort((a, b) => a.localeCompare(b));
    state.grupos = ['TODAS', ...provs];

    if (!state.grupos.includes(state.grupoActivo)) {
      state.grupoActivo = state.provinciaActiva || 'TODAS';
      state.subPaginaGrupo = 0;
    }

    actualizarDOMTabs(agr, listaEnDepto.length, true, onSelect, (itemGrupo) => {
      if (itemGrupo === 'TODAS') {
        state.provinciaActiva = 'TODAS';
        state.grupoActivo = 'TODAS';
        state.subPaginaGrupo = 0;
        onSelect();
      } else {
        // Al hacer clic en una provincia concreta, profundiza a DISTRITO
        state.provinciaActiva = itemGrupo;
        state.jerarquiaNivel = 'DISTRITO';
        state.distritoActivo = 'TODOS';
        state.grupoActivo = 'TODOS';
        state.subPaginaGrupo = 0;
        onSelect();
      }
    });
    return;
  }

  // NIVEL 3: DISTRITOS
  if (state.jerarquiaNivel === 'DISTRITO') {
    const listaEnProv = listaEnDepto.filter(e => clave(e.provincia, 'SIN PROVINCIA') === state.provinciaActiva);
    grupos['TODOS'] = listaEnProv;

    listaEnProv.forEach(est => {
      const dt = clave(est.distrito, 'SIN DISTRITO');
      if (!grupos[dt]) grupos[dt] = [];
      grupos[dt].push(est);
    });

    state.gruposMap = grupos;
    const dists = Object.keys(grupos).filter(k => k !== 'TODOS').sort((a, b) => a.localeCompare(b));
    state.grupos = ['TODOS', ...dists];

    if (!state.grupos.includes(state.grupoActivo)) {
      state.grupoActivo = state.distritoActivo || 'TODOS';
      state.subPaginaGrupo = 0;
    }

    actualizarDOMTabs(agr, listaEnProv.length, true, onSelect, (itemGrupo) => {
      state.distritoActivo = itemGrupo;
      state.grupoActivo = itemGrupo;
      state.subPaginaGrupo = 0;
      onSelect();
    });
  }
}

function actualizarDOMTabs(agr, totalLista, tieneBreadcrumb, onSelect, customHandler = null) {
  const cont = document.getElementById('tabs');
  if (!cont) return;
  cont.innerHTML = '';

  state.grupos.forEach(grupo => {
    const count = (state.gruposMap[grupo] || []).length;
    const btn = document.createElement('button');
    btn.className = 'tab' + (grupo === state.grupoActivo ? ' active' : '');
    btn.innerHTML = `
      <span>${formatearNombreGrupo(grupo, agr)}</span>
      <span class="tab-badge">${count}</span>
    `;
    btn.title = `${grupo} (${count} estación${count === 1 ? '' : 'es'})`;

    btn.onclick = () => {
      if (customHandler) {
        customHandler(grupo);
      } else {
        if (state.grupoActivo === grupo) return;
        state.grupoActivo = grupo;
        state.grupoActivoPorAgrupacion[agr.id] = grupo;
        state.subPaginaGrupo = 0;
        onSelect();
      }
    };
    cont.appendChild(btn);
  });

  // Actualizar indicadores del footer
  const tabCountEl = document.getElementById('tab-count');
  if (tabCountEl) {
    if (agr.esJerarquico && state.jerarquiaNivel !== 'DEPTO') {
      const etiquetaNivel = state.jerarquiaNivel === 'PROVINCIA' 
        ? `${state.deptoActivo} (Provincias)` 
        : `${state.provinciaActiva} (Distritos)`;
      tabCountEl.innerText = `${totalLista} EESS · ${etiquetaNivel}`;
    } else {
      tabCountEl.innerText = `${totalLista} · ${state.grupos.length} ${agr.plural}`;
    }
  }

  const labelEl = document.getElementById('tabbar-group-label');
  if (labelEl) {
    labelEl.innerText = agr.label;
  }

  // Botón de retroceso de miga de pan en el bloque izquierdo
  const breadcrumbWrap = document.getElementById('tabbar-breadcrumb-wrap');
  if (breadcrumbWrap) {
    if (agr.esJerarquico && state.jerarquiaNivel !== 'DEPTO') {
      breadcrumbWrap.style.display = 'flex';
      const btnBack = document.getElementById('btn-back-jerarquia');
      if (btnBack) {
        btnBack.innerText = state.jerarquiaNivel === 'DISTRITO' 
          ? `‹ ${state.deptoActivo}` 
          : `‹ DEPARTAMENTOS`;
      }
    } else {
      breadcrumbWrap.style.display = 'none';
    }
  }

  document.querySelectorAll('#dropup-agrupacion .dropup-item').forEach(el => {
    el.classList.toggle('active', el.dataset.agr === agr.id);
  });
}

export function obtenerEstacionesVisibles() {
  const ests = state.gruposMap[state.grupoActivo] || [];
  const totalSubpaginas = Math.ceil(ests.length / state.filasPorPagina) || 1;
  if (state.subPaginaGrupo >= totalSubpaginas) state.subPaginaGrupo = totalSubpaginas - 1;
  if (state.subPaginaGrupo < 0) state.subPaginaGrupo = 0;

  const inicio = state.subPaginaGrupo * state.filasPorPagina;
  const fin = inicio + state.filasPorPagina;

  return {
    estaciones: ests.slice(inicio, fin),
    totalEstacionesGrupo: ests.length,
    subPaginaActual: state.subPaginaGrupo + 1,
    totalSubpaginas: totalSubpaginas,
    tieneAnterior: state.subPaginaGrupo > 0,
    tieneSiguiente: state.subPaginaGrupo < totalSubpaginas - 1
  };
}
