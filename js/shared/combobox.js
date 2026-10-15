/* ==========================================================
   shared/combobox.js — Convertidor de <select> a Searchable Select
   ========================================================== */

/**
 * Convierte un <select> existente en un selector searchable con input de texto.
 * Mantiene el <select> subyacente sincronizado para disparar sus eventos change.
 */
export function inicializarSearchableSelect(selectId, placeholder = 'Buscar...') {
  const sel = document.getElementById(selectId);
  if (!sel || sel.dataset.searchableInit) return;
  sel.dataset.searchableInit = 'true';

  // Contenedor principal
  const wrap = document.createElement('div');
  wrap.className = 'searchable-select-wrap';
  wrap.style.cssText = 'position: relative; width: 100%;';

  // Input de búsqueda / selector visible
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'k-input-searchable';
  searchInput.placeholder = placeholder;
  searchInput.autocomplete = 'off';
  searchInput.value = sel.options[sel.selectedIndex]?.textContent || '';

  // Lista desplegable flotante
  const dropdown = document.createElement('ul');
  dropdown.className = 'searchable-select-dropdown';
  dropdown.style.cssText = `
    display: none; position: absolute; top: calc(100% + 2px); left: 0; right: 0;
    max-height: 180px; overflow-y: auto; background: #1E2235; border: 1px solid rgba(255,255,255,0.15);
    border-radius: 4px; z-index: 1000; list-style: none; padding: 4px 0; margin: 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  `;

  // Renderizar opciones en el menú
  function renderOpciones(filtroTexto = '') {
    dropdown.innerHTML = '';
    const query = filtroTexto.toLowerCase().trim();
    let coincidencias = 0;

    Array.from(sel.options).forEach(opt => {
      const match = opt.textContent.toLowerCase().includes(query);
      if (!match) return;
      coincidencias++;

      const li = document.createElement('li');
      li.style.cssText = `
        padding: 5px 10px; font-size: 0.72rem; color: #E2E8F0; cursor: pointer;
        transition: background 0.15s ease;
      `;
      li.textContent = opt.textContent;
      if (opt.value === sel.value) {
        li.style.background = 'rgba(0, 213, 138, 0.18)';
        li.style.color = '#00D58A';
        li.style.fontWeight = '600';
      }

      li.addEventListener('mouseenter', () => li.style.background = 'rgba(255,255,255,0.08)');
      li.addEventListener('mouseleave', () => {
        li.style.background = (opt.value === sel.value) ? 'rgba(0, 213, 138, 0.18)' : 'transparent';
      });

      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        sel.value = opt.value;
        searchInput.value = opt.textContent;
        dropdown.style.display = 'none';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      });

      dropdown.appendChild(li);
    });

    if (coincidencias === 0) {
      const empty = document.createElement('li');
      empty.style.cssText = 'padding: 6px 10px; font-size: 0.7rem; color: #94A3B8; text-align: center;';
      empty.textContent = 'Sin resultados';
      dropdown.appendChild(empty);
    }
  }

  // Eventos de control
  searchInput.addEventListener('focus', () => {
    renderOpciones('');
    dropdown.style.display = 'block';
    searchInput.select();
  });

  searchInput.addEventListener('input', () => {
    renderOpciones(searchInput.value);
    dropdown.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      dropdown.style.display = 'none';
      searchInput.value = sel.options[sel.selectedIndex]?.textContent || '';
    }
  });

  // Reaccionar a cambios programáticos del <select> original
  sel.addEventListener('change', () => {
    searchInput.value = sel.options[sel.selectedIndex]?.textContent || '';
  });

  // Insertar en el DOM ocultando el <select> original
  sel.parentNode.insertBefore(wrap, sel);
  sel.style.display = 'none';
  wrap.appendChild(searchInput);
  wrap.appendChild(dropdown);
  wrap.appendChild(sel);
}