/*************************************************
 * STOCK BALANCE MODULE
 *************************************************/
(function () {
  let stockBalances = [];
  let page = 1;
  let pageSize = 10;

  async function initStockBalancePage() {
    if (!document.getElementById("stock-body")) return;
    await loadBaseData();
    await loadStockBalances();
  }

  // REGISTER
  window.pageRegistry["stock-balance"] = initStockBalancePage;

  async function loadBaseData() {
    const warehouses = await fetchData(`${API_BASE_URL}/warehouses`);
    const products = await fetchData(`${API_BASE_URL}/products`);

    const wh = document.getElementById("filterWarehouse");
    const pr = document.getElementById("filterProduct");

    if (!wh || !pr) return;

    wh.innerHTML = `<option value="">-- Kho --</option>`;
    pr.innerHTML = `<option value="">-- Sản phẩm --</option>`;

    warehouses.forEach((w) => {
      wh.innerHTML += `<option value="${w.id}">${w.name}</option>`;
    });

    products.forEach((p) => {
      pr.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
  }

  async function loadStockBalances() {
    const warehouseId = document.getElementById("filterWarehouse").value;
    const productId = document.getElementById("filterProduct").value;

    let url = `${API_BASE_URL}/stock-balances?`;
    if (warehouseId) url += `warehouseId=${warehouseId}&`;
    if (productId) url += `productId=${productId}`;

    stockBalances = await fetchData(url);
    page = 1;
    renderStockBalances();
  }

  function renderStockBalances() {
    const keyword =
      document.getElementById("searchInput")?.value.toLowerCase() || "";

    const filtered = stockBalances.filter((x) =>
      x.productName.toLowerCase().includes(keyword),
    );

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const tbody = document.getElementById("stock-body");
    if (!tbody) return;

    tbody.innerHTML = "";
    data.forEach((x) => {
      tbody.innerHTML += `
        <tr>
          <td>${x.warehouseName}</td>
          <td>${x.productName}</td>
          <td>${x.unitName}</td>
          <td style="text-align:right">${x.quantity.toLocaleString()}</td>
        </tr>`;
    });

    renderBasePagination({
      totalItems: filtered.length,
      currentPage: page,
      pageSize,
      containerId: "stock-pagination",
      onPageChange: (p) => {
        page = p;
        renderStockBalances();
      },
    });
  }

  function changePageSize() {
    pageSize = Number(document.getElementById("pageSize").value);
    page = 1;
    renderStockBalances();
  }

  // EXPORT FOR HTML
  window.loadStockBalances = loadStockBalances;
  window.changePageSize = changePageSize;
})();
