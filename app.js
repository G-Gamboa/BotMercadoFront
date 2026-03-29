const API_BASE = "https://botmercadoapi-production.up.railway.app";

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const state = {
  inventarioLugar: "",
  categorias: [],
};

const els = {
  alertBox: document.getElementById("alertBox"),
  loadingBox: document.getElementById("loadingBox"),

  inventarioTableBody: document.getElementById("inventarioTableBody"),
  inventarioCount: document.getElementById("inventarioCount"),

  categoriasList: document.getElementById("categoriasList"),
  listaComprasBox: document.getElementById("listaComprasBox"),

  compraForm: document.getElementById("compraForm"),
  compraLugar: document.getElementById("compraLugar"),
  compraCategoria: document.getElementById("compraCategoria"),
  compraProducto: document.getElementById("compraProducto"),
  compraCantidad: document.getElementById("compraCantidad"),

  compraLoteLugar: document.getElementById("compraLoteLugar"),
  compraLoteCategoria: document.getElementById("compraLoteCategoria"),
  compraLoteTexto: document.getElementById("compraLoteTexto"),
  compraLoteBtn: document.getElementById("compraLoteBtn"),

  consumoForm: document.getElementById("consumoForm"),
  consumoProducto: document.getElementById("consumoProducto"),
  consumoCantidad: document.getElementById("consumoCantidad"),

  consumoLoteTexto: document.getElementById("consumoLoteTexto"),
  consumoLoteBtn: document.getElementById("consumoLoteBtn"),

  categoriaForm: document.getElementById("categoriaForm"),
  categoriaNombre: document.getElementById("categoriaNombre"),

  refreshInventarioBtn: document.getElementById("refreshInventarioBtn"),
  refreshCategoriasBtn: document.getElementById("refreshCategoriasBtn"),
  refreshListaBtn: document.getElementById("refreshListaBtn"),
};

function showAlert(message, type = "success") {
  els.alertBox.className = "";
  els.alertBox.classList.remove("hidden");

  if (type === "error") {
    els.alertBox.classList.add("mb-4", "rounded-2xl", "px-4", "py-3", "text-sm", "font-medium", "bg-red-50", "text-red-700", "border", "border-red-200");
  } else {
    els.alertBox.classList.add("mb-4", "rounded-2xl", "px-4", "py-3", "text-sm", "font-medium", "bg-emerald-50", "text-emerald-700", "border", "border-emerald-200");
  }

  els.alertBox.textContent = message;

  setTimeout(() => {
    els.alertBox.classList.add("hidden");
  }, 3500);
}

function setLoading(show) {
  els.loadingBox.classList.toggle("hidden", !show);
}

async function apiFetch(path, options = {}) {
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.detail || "Error en la solicitud");
    }

    return data;
  } finally {
    setLoading(false);
  }
}

function setActiveTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active-tab", btn.dataset.tab === tabName);
  });

  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.add("hidden");
  });

  document.getElementById(`tab-${tabName}`).classList.remove("hidden");
}

function setActiveFilter(lugar) {
  state.inventarioLugar = lugar;

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active-filter", btn.dataset.lugar === lugar);
  });
}

function parseLoteText(text) {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split("-");
      if (parts.length < 2) throw new Error(`Formato inválido: ${line}`);

      const producto = parts[0].trim();
      const cantidad = Number(parts.slice(1).join("-").trim());

      if (!producto || Number.isNaN(cantidad) || cantidad <= 0) {
        throw new Error(`Dato inválido: ${line}`);
      }

      return { producto, cantidad };
    });
}

function renderCategoriaOptions() {
  const options = state.categorias
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join("");

  els.compraCategoria.innerHTML = options;
  els.compraLoteCategoria.innerHTML = options;
}

async function loadCategorias() {
  const data = await apiFetch("/api/categorias");
  state.categorias = data.items || [];
  renderCategoriaOptions();
  renderCategoriasList();
}

function renderCategoriasList() {
  const items = state.categorias;

  if (!items.length) {
    els.categoriasList.innerHTML = `<div class="category-item text-slate-500">No hay categorías registradas.</div>`;
    return;
  }

  els.categoriasList.innerHTML = items
    .map(cat => `
      <div class="category-item flex items-center justify-between gap-3">
        <div>
          <p class="font-bold text-rosebrand-700">${cat}</p>
        </div>
        <button class="delete-btn" onclick="deleteCategoria('${encodeURIComponent(cat)}', '${cat}')">
          Eliminar
        </button>
      </div>
    `)
    .join("");
}

async function deleteCategoria(encodedName, prettyName) {
  if (!confirm(`¿Eliminar la categoría ${prettyName}?`)) return;

  try {
    await apiFetch(`/api/categorias/${encodedName}`, {
      method: "DELETE",
    });
    showAlert("Categoría eliminada.");
    await loadCategorias();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

window.deleteCategoria = deleteCategoria;

async function loadInventario() {
  const q = state.inventarioLugar ? `?lugar=${state.inventarioLugar}` : "";
  const data = await apiFetch(`/api/inventario${q}`);
  const items = data.items || [];

  els.inventarioCount.textContent = `${items.length} productos`;

  if (!items.length) {
    els.inventarioTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-5 text-slate-500">Sin existencias.</td>
      </tr>
    `;
    return;
  }

  els.inventarioTableBody.innerHTML = items
    .map(item => `
      <tr class="border-b border-rosebrand-50">
        <td class="py-3 pr-4 font-semibold">${item.producto_label}</td>
        <td class="py-3 pr-4">${item.categoria}</td>
        <td class="py-3 pr-4">${item.cantidad_label}</td>
        <td class="py-3">${item.lugar}</td>
      </tr>
    `)
    .join("");
}

async function loadListaCompras() {
  const data = await apiFetch("/api/compras-lista");
  const items = data.items || [];

  if (!items.length) {
    els.listaComprasBox.innerHTML = `<div class="buy-item text-slate-500">Todo en stock.</div>`;
    return;
  }

  els.listaComprasBox.innerHTML = items
    .map(item => `
      <div class="buy-item">
        <p class="font-bold text-rosebrand-700">${capitalizeWords(item.producto)}</p>
        <p class="text-sm text-slate-500 mt-1">${item.categoria}</p>
      </div>
    `)
    .join("");
}

function capitalizeWords(text) {
  return text
    .split(" ")
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

async function submitCompra(e) {
  e.preventDefault();

  try {
    await apiFetch("/api/compras", {
      method: "POST",
      body: JSON.stringify({
        producto: els.compraProducto.value,
        categoria: els.compraCategoria.value,
        cantidad: Number(els.compraCantidad.value),
        lugar: els.compraLugar.value,
      }),
    });

    els.compraForm.reset();
    showAlert("Compra registrada.");
    await loadInventario();
    await loadListaCompras();
    await loadConsumoProductos();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

async function submitCompraLote() {
  try {
    const items = parseLoteText(els.compraLoteTexto.value);

    const result = await apiFetch("/api/compras/lote", {
      method: "POST",
      body: JSON.stringify({
        categoria: els.compraLoteCategoria.value,
        lugar: els.compraLoteLugar.value,
        items,
      }),
    });

    els.compraLoteTexto.value = "";
    showAlert(`Lote registrado: ${result.ok || 0}`);
    await loadInventario();
    await loadListaCompras();
    await loadConsumoProductos();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

async function submitConsumo(e) {
  e.preventDefault();

  try {
    await apiFetch("/api/consumos", {
      method: "POST",
      body: JSON.stringify({
        producto: els.consumoProducto.value,
        cantidad: Number(els.consumoCantidad.value),
      }),
    });

    els.consumoForm.reset();
    showAlert("Consumo registrado.");
    await loadInventario();
    await loadListaCompras();
    await loadConsumoProductos();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

async function submitConsumoLote() {
  try {
    const items = parseLoteText(els.consumoLoteTexto.value);

    const result = await apiFetch("/api/consumos/lote", {
      method: "POST",
      body: JSON.stringify({ items }),
    });

    els.consumoLoteTexto.value = "";
    let message = `Lote procesado: ${result.ok || 0}`;
    if (result.errores?.length) {
      message += ` | Errores: ${result.errores.length}`;
    }

    showAlert(message);
    await loadInventario();
    await loadListaCompras();
        await loadConsumoProductos();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

async function submitCategoria(e) {
  e.preventDefault();

  try {
    await apiFetch("/api/categorias", {
      method: "POST",
      body: JSON.stringify({
        nombre: els.categoriaNombre.value,
      }),
    });

    els.categoriaForm.reset();
    showAlert("Categoría añadida.");
    await loadCategorias();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

function bindEvents() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      setActiveFilter(btn.dataset.lugar);
      await loadInventario();
    });
  });

  els.compraForm.addEventListener("submit", submitCompra);
  els.compraLoteBtn.addEventListener("click", submitCompraLote);
  els.consumoForm.addEventListener("submit", submitConsumo);
  els.consumoLoteBtn.addEventListener("click", submitConsumoLote);
  els.categoriaForm.addEventListener("submit", submitCategoria);

  els.refreshInventarioBtn.addEventListener("click", loadInventario);
  els.refreshCategoriasBtn.addEventListener("click", loadCategorias);
  els.refreshListaBtn.addEventListener("click", loadListaCompras);
}

async function init() {
  bindEvents();
  setActiveTab("inventario");
  setActiveFilter("");
  await Promise.all([
    loadCategorias(),
    loadInventario(),
    loadListaCompras(),
    loadConsumoProductos(),
  ]);
}

async function loadConsumoProductos() {
  const data = await apiFetch("/api/inventario");
  const items = data.items || [];

  if (!items.length) {
    els.consumoProducto.innerHTML = `<option value="">Sin productos disponibles</option>`;
    return;
  }

  els.consumoProducto.innerHTML = items
    .map(item => `<option value="${item.producto}">${item.producto_label} (${item.cantidad_label})</option>`)
    .join("");
}

init().catch(err => {
  showAlert(err.message || "Error al iniciar la app", "error");
});