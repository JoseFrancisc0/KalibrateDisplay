/* ==========================================================
   views/competencia/index.js — Contrato del Router
   ========================================================== */
import { competenciaSemanalState } from './state.js';
import { railCompetenciaSemanalHTML } from './rail.js';
import { competenciaSemanalHTML, renderCompetenciaSemanal } from './vista.js';
import { acciones, entrarCompetenciaSemanal, iniciarListenersCompetenciaSemanal } from './acciones.js';

export const competenciaSemanal = {
    id: 'COMPETENCIA_SEMANAL',
    label: 'COMPETENCIA SEMANAL',
    tabId: 'tab-view-competencia-semanal',
    shellSelector: '#competencia-semanal-shell',
    display: 'flex',
    railId: 'rail-panel-competencia-semanal',
    usaTabbar: false,
    railHTML: railCompetenciaSemanalHTML,
    mainHTML: competenciaSemanalHTML,
    alEntrar: entrarCompetenciaSemanal,
    render: renderCompetenciaSemanal,
    etiquetaModo: () => `PRODUCTO: ${(competenciaSemanalState.producto || 'DIESEL').toUpperCase()}`,
    acciones,
    iniciarListeners: iniciarListenersCompetenciaSemanal
};