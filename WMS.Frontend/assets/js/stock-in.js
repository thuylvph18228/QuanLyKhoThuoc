/*************************************************
 * STOCK IN MODULE
 *************************************************/
(function () {
  let stockIns = [];
  let selectedStockIn = null;
  let page = 1;
  let pageSize = 5;
  let products = [];
  let warehouses = [];

  /* ================= INIT ================= */
  async function initStockInPage() {
    if (!document.getElementById("stockin-body")) return;
    await loadBaseData();
    await loadStockIns();
  }

  // 👉 ĐĂNG KÝ VỚI ROUTER
  window.pageRegistry["stock-in"] = initStockInPage;

  /* ================= LOAD BASE ================= */
  async function loadBaseData() {
    products = await fetchData(`${API_BASE_URL}/products`);
    warehouses = await fetchData(`${API_BASE_URL}/warehouses`);

    const whSelect = document.getElementById("toWarehouse");
    if (!whSelect) return;

    whSelect.innerHTML = `<option value="">-- Chọn kho --</option>`;
    warehouses.forEach((w) => {
      const opt = document.createElement("option");
      opt.value = w.id;
      opt.textContent = w.name;
      whSelect.appendChild(opt);
    });
  }

  /* ================= LOAD ================= */
  async function loadStockIns() {
    stockIns = await fetchData(`${API_BASE_URL}/stock-vouchers?type=IN`);
    renderStockIns();
  }

  /* ================= RENDER ================= */
  function renderStockIns() {
    const keyword =
      document.getElementById("searchInput")?.value.toLowerCase() || "";

    const filtered = stockIns.filter((x) =>
      x.voucherCode.toLowerCase().includes(keyword),
    );

    const start = (page - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize);

    const tbody = document.getElementById("stockin-body");
    if (!tbody) return;

    tbody.innerHTML = "";
    selectedStockIn = null;
    document.getElementById("btnApprove").disabled = true;

    pageData.forEach((v) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${v.voucherCode}</td>
        <td>${v.voucherDate.substring(0, 10)}</td>
        <td>${v.toWarehouseName}</td>
        <td>${v.status}</td>
      `;

      tr.onclick = () => selectStockIn(tr, v);
      tbody.appendChild(tr);
    });

    renderBasePagination({
      totalItems: filtered.length,
      currentPage: page,
      pageSize,
      containerId: "stockin-pagination",
      onPageChange: (p) => {
        page = p;
        renderStockIns();
      },
    });
  }

  /* ================= SELECT ================= */
  function selectStockIn(row, v) {
    document
      .querySelectorAll("#stockin-body tr")
      .forEach((tr) => tr.classList.remove("selected"));

    row.classList.add("selected");
    selectedStockIn = v;
    document.getElementById("btnApprove").disabled = v.status !== "DRAFT";
  }

  /* ================= ADD ================= */
  function openAddStockIn() {
    document.getElementById("voucherDate").valueAsDate = new Date();
    document.getElementById("note").value = "";
    document.getElementById("detail-body").innerHTML = "";
    addDetailRow();
    document.getElementById("stockInModal").classList.remove("hidden");
  }

  /* ================= DETAILS ================= */
  function addDetailRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <select class="product">
          <option value="">-- SP --</option>
          ${products
            .map((p) => `<option value="${p.id}">${p.name}</option>`)
            .join("")}
        </select>
      </td>
      <td><input type="number" class="qty" value="1" /></td>
      <td><input type="number" class="price" value="0" /></td>
      <td><button onclick="this.closest('tr').remove()">✖</button></td>
    `;

    document.getElementById("detail-body").appendChild(tr);
  }

  /* ================= SAVE ================= */
  async function saveStockIn() {
    const details = [...document.querySelectorAll("#detail-body tr")].map(
      (tr) => ({
        productId: Number(tr.querySelector(".product").value),
        quantity: Number(tr.querySelector(".qty").value),
        price: Number(tr.querySelector(".price").value),
      }),
    );

    const payload = {
      voucherType: "IN",
      voucherDate: document.getElementById("voucherDate").value,
      toWarehouseId: Number(document.getElementById("toWarehouse").value),
      note: document.getElementById("note").value,
      details,
    };

    await fetchData(`${API_BASE_URL}/stock-vouchers`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    closeStockIn();
    loadStockIns();
    showToast("Tạo phiếu nhập thành công");
  }

  /* ================= APPROVE ================= */
  async function approveStockIn() {
    if (!selectedStockIn) return;

    await fetchData(
      `${API_BASE_URL}/stock-vouchers/${selectedStockIn.id}/approve`,
      { method: "POST" },
    );

    loadStockIns();
    showToast("Đã duyệt phiếu nhập");
  }

  /* ================= OTHER ================= */
  function closeStockIn() {
    document.getElementById("stockInModal").classList.add("hidden");
  }

  function searchStockIn() {
    page = 1;
    renderStockIns();
  }

  /* ================= EXPORT FOR HTML ================= */
  window.openAddStockIn = openAddStockIn;
  window.saveStockIn = saveStockIn;
  window.approveStockIn = approveStockIn;
  window.searchStockIn = searchStockIn;
})();
