/* ==========================================================
   views/competencia/acciones.js
   ========================================================== */
import { render, refrescarViewBar } from '../../core/router.js';
import { valorDe, repoblarSelect, activar, alternarDesplegable, cerrarAlClicFuera } from '../../shared/dom.js';
import { CAMBIOS_SEMANALES_URL } from '../../config/datos.js';
import { competenciaSemanalState } from './state.js';

export async function entrarCompetenciaSemanal() {
    const cs = competenciaSemanalState;
    if (!cs.datosCrudos && !cs.cargando) {
        cs.cargando = true;
        render();
        try {
            const resp = await fetch(CAMBIOS_SEMANALES_URL);
            if (resp.ok) {
                const json = await resp.json();
                cs.datosCrudos = json.datos || [];
                cs.rangos = json.rangos || null;
            } else {
                console.error(`Error ${resp.status} al cargar cambios semanales.`);
            }
        } catch (e) {
            console.error("Error descargando cambios_semanales_competencia.json:", e);
        }
        cs.cargando = false;
    }
    poblarFiltrosGeograficosCS();
    actualizarMarcasDisponiblesCS();
}

function valoresUnicosFiltrados(lista, campo) {
    const set = new Set();
    lista.forEach(item => {
        const v = item[campo];
        if (v && v.trim()) set.add(v.trim().toUpperCase());
    });
    return Array.from(set).sort();
}

function sincronizarCascadaGeograficaCS() {
    const cs = competenciaSemanalState;
    const datos = cs.datosCrudos || [];

    cs.departamentosDisponibles = valoresUnicosFiltrados(datos, 'departamento');
    repoblarSelect('sel-cs-depto', cs.departamentosDisponibles, cs.departamento);

    const datosDepto = datos.filter(d => cs.departamento === 'TODOS' || (d.departamento || '').trim().toUpperCase() === cs.departamento);
    cs.provinciasDisponibles = valoresUnicosFiltrados(datosDepto, 'provincia');
    cs.provincia = repoblarSelect('sel-cs-provincia', cs.provinciasDisponibles, cs.provincia);

    const datosProv = datosDepto.filter(d => cs.provincia === 'TODOS' || (d.provincia || '').trim().toUpperCase() === cs.provincia);
    cs.distritosDisponibles = valoresUnicosFiltrados(datosProv, 'distrito');
    cs.distrito = repoblarSelect('sel-cs-distrito', cs.distritosDisponibles, cs.distrito);
}

export function poblarFiltrosGeograficosCS() {
    sincronizarCascadaGeograficaCS();
    const selProd = document.getElementById('sel-cs-prod');
    if (selProd) selProd.value = competenciaSemanalState.producto;
}

export function actualizarMarcasDisponiblesCS() {
    const cs = competenciaSemanalState;
    const datos = cs.datosCrudos || [];
    const setM = new Set();

    datos.forEach(d => {
        const m = (d.marca || '').trim().toUpperCase();
        if (m && m !== 'SIN MARCA') {
            setM.add(m);
        }
    });

    cs.marcasDisponibles = Array.from(setM).sort();
    if (!cs.marcasSeleccionadas) {
        cs.marcasSeleccionadas = new Set(cs.marcasDisponibles);
    }
    construirChecklistMarcasCSDOM();
}

function construirChecklistMarcasCSDOM() {
    const cs = competenciaSemanalState;
    const container = document.getElementById('checklist-cs-marcas-items');
    if (!container || !cs.marcasDisponibles) return;

    container.innerHTML = '';
    cs.marcasDisponibles.forEach(marca => {
        const isChecked = cs.marcasSeleccionadas ? cs.marcasSeleccionadas.has(marca) : true;
        const row = document.createElement('label');
        row.className = 'multiselect-item';
        row.innerHTML = `
            <input type="checkbox" value="${marca}" ${isChecked ? 'checked' : ''} data-change="onToggleCSMarcaCheck">
            <span>${marca}</span>
        `;
        container.appendChild(row);
    });
}

export function iniciarListenersCompetenciaSemanal() {
    cerrarAlClicFuera('section-cs-marcas', 'dropdown-cs-marcas-content');
}

export const acciones = {
    setModoVistaCS(el) {
        const modo = el.dataset.arg;
        competenciaSemanalState.modoVista = modo;
        activar('btn-cs-modo-est', modo === 'ESTACIONES');
        activar('btn-cs-modo-marcas', modo === 'MARCAS');
        render();
    },
    setPeriodoSemanal(el) {
        const periodo = el.dataset.arg;
        competenciaSemanalState.periodoActivo = periodo;
        activar('btn-cs-actual', periodo === 'ACTUAL');
        activar('btn-cs-pasada', periodo === 'PASADA');
        render();
    },
    cambiarProductoCS(el) {
        const v = el?.value || valorDe('sel-cs-prod');
        if (v) {
            competenciaSemanalState.producto = v;
            refrescarViewBar();
            render();
        }
    },
    cambiarDeptoCS(el) {
        competenciaSemanalState.departamento = el.value;
        sincronizarCascadaGeograficaCS();
        render();
    },
    cambiarProvinciaCS(el) {
        competenciaSemanalState.provincia = el.value;
        sincronizarCascadaGeograficaCS();
        render();
    },
    cambiarDistritoCS(el) {
        competenciaSemanalState.distrito = el.value;
        render();
    },
    toggleDropdownCSMarcas() {
        alternarDesplegable('dropdown-cs-marcas-content');
    },
    marcarTodasCSMarcas(el) {
        const cs = competenciaSemanalState;
        if (el.dataset.arg === 'true') {
            cs.marcasSeleccionadas = new Set(cs.marcasDisponibles);
        } else {
            cs.marcasSeleccionadas = new Set();
        }
        construirChecklistMarcasCSDOM();
        render();
    },
    onToggleCSMarcaCheck(el) {
        const cs = competenciaSemanalState;
        const marca = el.value;
        if (!cs.marcasSeleccionadas) {
            cs.marcasSeleccionadas = new Set(cs.marcasDisponibles);
        }
        if (el.checked) {
            cs.marcasSeleccionadas.add(marca);
        } else {
            cs.marcasSeleccionadas.delete(marca);
        }
        render();
    },
    toggleMarcaExpandidaCS(el) {
        const marca = el.dataset.arg;
        const cs = competenciaSemanalState;
        if (cs.marcasExpandidas.has(marca)) {
            cs.marcasExpandidas.delete(marca);
        } else {
            cs.marcasExpandidas.add(marca);
        }
        render();
    }
};