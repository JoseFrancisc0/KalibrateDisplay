/* ==========================================================
   views/competencia/acciones.js
   ========================================================== */
import { render, refrescarViewBar } from '../../core/router.js';
import { valorDe, repoblarSelect, activar } from '../../shared/dom.js';
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
            }
        } catch (e) {
            console.error("Error cargando cambios_semanales_competencia.json:", e);
        }
        cs.cargando = false;
    }
    poblarFiltrosGeograficosCS();
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

    // Departamentos
    cs.departamentosDisponibles = valoresUnicosFiltrados(datos, 'departamento');
    repoblarSelect('sel-cs-depto', cs.departamentosDisponibles, cs.departamento);

    // Provincias dentro del departamento seleccionado
    const datosDepto = datos.filter(d => cs.departamento === 'TODOS' || (d.departamento || '').trim().toUpperCase() === cs.departamento);
    cs.provinciasDisponibles = valoresUnicosFiltrados(datosDepto, 'provincia');
    cs.provincia = repoblarSelect('sel-cs-provincia', cs.provinciasDisponibles, cs.provincia);

    // Distritos dentro de departamento y provincia
    const datosProv = datosDepto.filter(d => cs.provincia === 'TODOS' || (d.provincia || '').trim().toUpperCase() === cs.provincia);
    cs.distritosDisponibles = valoresUnicosFiltrados(datosProv, 'distrito');
    cs.distrito = repoblarSelect('sel-cs-distrito', cs.distritosDisponibles, cs.distrito);
}

export function poblarFiltrosGeograficosCS() {
    sincronizarCascadaGeograficaCS();
    const selProd = document.getElementById('sel-cs-prod');
    if (selProd) selProd.value = competenciaSemanalState.producto;
}

export const acciones = {
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
    setPeriodoSemanal(el) {
        const periodo = el.dataset.arg;
        competenciaSemanalState.periodoActivo = periodo;
        activar('btn-cs-actual', periodo === 'ACTUAL');
        activar('btn-cs-pasada', periodo === 'PASADA');
        render();
    }
};