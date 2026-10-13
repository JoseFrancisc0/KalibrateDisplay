/* ==========================================================
   views/competencia_semanal/vista.js
   ========================================================== */
import { getBrandLogo } from '../../config/marcas.js';
import { competenciaSemanalState } from './state.js';

const DIAS_SEMANA = [
    { key: 'lunes', label: 'LUNES' },
    { key: 'martes', label: 'MARTES' },
    { key: 'miercoles', label: 'MIÉRCOLES' },
    { key: 'jueves', label: 'JUEVES' },
    { key: 'viernes', label: 'VIERNES' },
    { key: 'sabado', label: 'SÁBADO' },
    { key: 'domingo', label: 'DOMINGO' }
];

export function competenciaSemanalHTML() {
    return `
    <div class="cs-shell" id="competencia-semanal-shell" style="display:none;">
        <div class="cs-header">
            <div>
                <h2>Dinámica Semanal de Precios y Frecuencia de Cambios</h2>
                <p id="cs-subtitulo">Evaluando actividad de estaciones competidoras</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="cs-meta-pill" id="cs-periodo-tag" style="background: var(--k-indigo); color: #fff;">SEMANA EN CURSO</div>
                <div class="cs-meta-pill" id="cs-rango-semana">Semana: —</div>
            </div>
        </div>

        <div class="cs-table-wrap">
            <table class="cs-table">
                <thead>
                    <tr>
                        <th style="width: 32%;">Estación Competidora</th>
                        ${DIAS_SEMANA.map(d => `<th class="col-num" style="width: 9.7%;">${d.label}</th>`).join('')}
                    </tr>
                </thead>
                <tbody id="cs-table-body">
                    <tr><td colspan="8" class="cs-empty">Cargando datos semanales...</td></tr>
                </tbody>
                <tfoot id="cs-table-foot"></tfoot>
            </table>
        </div>
    </div>
    `;
}

export function renderCompetenciaSemanal() {
    const shell = document.getElementById('competencia-semanal-shell');
    if (!shell) return;

    const tbody = document.getElementById('cs-table-body');
    const tfoot = document.getElementById('cs-table-foot');
    const subtitulo = document.getElementById('cs-subtitulo');
    const rangoBadge = document.getElementById('cs-rango-semana');
    const periodoTag = document.getElementById('cs-periodo-tag');

    const cs = competenciaSemanalState;

    if (cs.cargando) {
        tbody.innerHTML = `<tr><td colspan="8" class="cs-empty">Descargando datos semanales...</td></tr>`;
        return;
    }

    if (!cs.datosCrudos || cs.datosCrudos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="cs-empty">No hay registros de competencia disponibles.</td></tr>`;
        tfoot.innerHTML = '';
        return;
    }

    // Actualizar etiquetas de período y rango dinámico
    const periodoActual = cs.periodoActivo || 'ACTUAL';
    if (periodoTag) {
        periodoTag.innerText = periodoActual === 'ACTUAL' ? 'SEMANA EN CURSO' : 'SEMANA PASADA';
    }

    if (cs.rangos && cs.rangos[periodoActual] && rangoBadge) {
        const r = cs.rangos[periodoActual];
        rangoBadge.innerText = `Semana: ${r.desde} ➔ ${r.hasta}`;
    }

    // 1. Filtrar observaciones por período activo (ACTUAL o PASADA), producto y jerarquía geográfica
    const prodSel = cs.producto;
    const deptoSel = cs.departamento;
    const provSel = cs.provincia;
    const distSel = cs.distrito;

    const filtrados = cs.datosCrudos.filter(item => {
        if (item.periodo && item.periodo !== periodoActual) return false;
        if (item.producto !== prodSel) return false;

        const d = (item.departamento || '').trim().toUpperCase();
        const pv = (item.provincia || '').trim().toUpperCase();
        const dt = (item.distrito || '').trim().toUpperCase();

        return (deptoSel === 'TODOS' || d === deptoSel) &&
               (provSel === 'TODOS' || pv === provSel) &&
               (distSel === 'TODOS' || dt === distSel);
    });

    if (subtitulo) {
        const ubicacionTexto = deptoSel === 'TODOS' 
            ? 'Red Nacional' 
            : `${deptoSel}${provSel !== 'TODOS' ? ' · ' + provSel : ''}${distSel !== 'TODOS' ? ' · ' + distSel : ''}`;
        subtitulo.innerText = `Producto: ${prodSel.toUpperCase()} · ${ubicacionTexto}`;
    }

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="cs-empty">No se encontraron competidores para los filtros seleccionados.</td></tr>`;
        tfoot.innerHTML = '';
        return;
    }

    // 2. Pivotar datos por estación: { site_id -> { competidor, marca, dias: { lunes: {...}, ... } } }
    const matrizEstaciones = {};
    filtrados.forEach(item => {
        const sid = item.site_id;
        if (!matrizEstaciones[sid]) {
            matrizEstaciones[sid] = {
                site_id: sid,
                competidor: item.competidor,
                marca: item.marca,
                dias: {}
            };
        }
        matrizEstaciones[sid].dias[item.dia] = {
            precio: item.precio,
            subidas: item.subidas || 0,
            bajadas: item.bajadas || 0
        };
    });

    const listaEstaciones = Object.values(matrizEstaciones).sort((a, b) => a.competidor.localeCompare(b.competidor));

    // 3. Renderizar Filas de Competidores
    tbody.innerHTML = listaEstaciones.map(est => {
        const logoUrl = getBrandLogo(est.marca);
        return `
        <tr>
            <td>
                <div class="cs-site-cell">
                    <div class="cs-logo-box"><img src="${logoUrl}" alt="${est.marca}"></div>
                    <div class="cs-site-info">
                        <b>${est.competidor}</b>
                        <small>${est.marca}</small>
                    </div>
                </div>
            </td>
            ${DIAS_SEMANA.map(dia => {
                const info = est.dias[dia.key];
                if (!info || info.precio === null || info.precio <= 0) {
                    return `<td class="col-num cs-celda-vacia">—</td>`;
                }

                let tagsCambios = '';
                if (info.subidas > 0) {
                    tagsCambios += `<span class="tag-cambio tag-subida">▲ ${info.subidas}</span>`;
                }
                if (info.bajadas > 0) {
                    tagsCambios += `<span class="tag-cambio tag-bajada">▼ ${info.bajadas}</span>`;
                }

                return `
                <td class="col-num">
                    <div class="cs-dia-cell">
                        <span class="cs-precio">S/ ${info.precio.toFixed(2)}</span>${tagsCambios ? `<div class="cs-cambios-row">${tagsCambios}</div>` : ''}
                    </div>
                </td>
                `;
            }).join('')}
        </tr>
        `;
    }).join('');

    // 4. Calcular Fila de Promedios Diarios al Pie
    const promediosPorDia = DIAS_SEMANA.map(dia => {
        let suma = 0;
        let conteo = 0;
        listaEstaciones.forEach(est => {
            const p = est.dias[dia.key]?.precio;
            if (p && p > 0) {
                suma += p;
                conteo++;
            }
        });
        return conteo > 0 ? (suma / conteo) : null;
    });

    tfoot.innerHTML = `
    <tr class="cs-foot-row">
        <td>
            <div class="cs-promedio-label">
                <b>PRECIO PROMEDIO DIARIO</b>
                <small>${listaEstaciones.length} estaciones evaluadas</small>
            </div>
        </td>
        ${promediosPorDia.map(prom => `
            <td class="col-num">
                ${prom !== null ? `<span class="cs-promedio-val">S/ ${prom.toFixed(2)}</span>` : '—'}
            </td>
        `).join('')}
    </tr>
    `;
}