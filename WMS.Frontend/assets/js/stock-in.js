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
    document.getElementById("btnEdit").disabled = v.status !== "DRAFT";
    document.getElementById("btnCancelApprove").disabled =
      v.status !== "APPROVED";
    document.getElementById("btnView").disabled = false;
  }

  /* ================= ADD ================= */
  function openAddStockIn() {
    document.getElementById("voucherDate").valueAsDate = new Date();
    document.getElementById("note").value = "";
    document.getElementById("detail-body").innerHTML = "";
    loadBaseData();
    addDetailRow();
    document.getElementById("stockInModal").classList.remove("hidden");
  }
  // EDIT
  function openEditStockIn() {
    if (!selectedStockIn) {
      showToast("Vui lòng chọn phiếu cần sửa", "warning");
      return;
    }

    if (selectedStockIn.status !== "DRAFT") {
      showToast("Chỉ được sửa phiếu ở trạng thái DRAFT", "warning");
      return;
    }

    // fill header
    document.getElementById("voucherDate").value =
      selectedStockIn.voucherDate.substring(0, 10);
    document.getElementById("toWarehouse").value =
      selectedStockIn.toWarehouseId ?? "";
    document.getElementById("note").value = selectedStockIn.note ?? "";

    // load chi tiết từ BE
    loadStockInDetails(selectedStockIn.id);

    document.getElementById("stockInModal").classList.remove("hidden");
  }
  // LOAD CHI TIẾT PHIẾU
  async function loadStockInDetails(id) {
    const res = await fetchData(`${API_BASE_URL}/stock-vouchers/${id}`);

    const tbody = document.getElementById("detail-body");
    tbody.innerHTML = "";

    res.details.forEach((d) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>
        <select class="product">
          ${products
            .map(
              (p) =>
                `<option value="${p.id}" ${
                  p.id === d.productId ? "selected" : ""
                }>${p.name}</option>`,
            )
            .join("")}
        </select>
      </td>
      <td><input type="number" class="qty" value="${d.quantity}" /></td>
      <td><input type="number" class="price" value="${d.price}" /></td>
      <td><button onclick="this.closest('tr').remove()">✖</button></td>
    `;
      tbody.appendChild(tr);
    });
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
      voucherDate: document.getElementById("voucherDate").value,
      toWarehouseId: Number(document.getElementById("toWarehouse").value),
      note: document.getElementById("note").value,
      details,
    };

    if (selectedStockIn) {
      await fetchData(`${API_BASE_URL}/stock-vouchers/${selectedStockIn.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showToast("Cập nhật phiếu nhập thành công");
    } else {
      await fetchData(`${API_BASE_URL}/stock-vouchers`, {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          voucherType: "IN",
        }),
      });
      showToast("Tạo phiếu nhập thành công");
    }

    closeStockIn();
    loadStockIns();
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

  // XEM CHI TIẾT PHIẾU NHẬP
  async function openViewStockIn() {
    if (!selectedStockIn) return;

    const data = await fetchData(
      `${API_BASE_URL}/stock-vouchers/${selectedStockIn.id}`,
    );
    fillStockInModal(data, true);
  }

  // NẠP DỮ LIỆU LÊN MODAL
  function fillStockInModal(data, readonly) {
    document.getElementById("voucherDate").value = data.voucherDate.substring(
      0,
      10,
    );
    document.getElementById("toWarehouse").value = data.toWarehouseId;
    document.getElementById("note").value = data.note || "";

    const tbody = document.getElementById("detail-body");
    tbody.innerHTML = "";

    data.details.forEach((d) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>
        <select class="product" ${readonly ? "disabled" : ""}>
          ${products
            .map(
              (p) =>
                `<option value="${p.id}" ${
                  p.id === d.productId ? "selected" : ""
                }>${p.name}</option>`,
            )
            .join("")}
        </select>
      </td>
      <td><input type="number" class="qty" value="${d.quantity}" ${readonly ? "disabled" : ""} /></td>
      <td><input type="number" class="price" value="${d.price}" ${readonly ? "disabled" : ""} /></td>
      <td>
        ${
          readonly
            ? ""
            : `<button class="btn-remove-row" onclick="this.closest('tr').remove()">✖</button>`
        }
      </td>
    `;
      tbody.appendChild(tr);
    });

    document
      .querySelectorAll("#stockInModal input, #stockInModal select")
      .forEach((el) => {
        if (readonly) el.setAttribute("disabled", true);
        else el.removeAttribute("disabled");
      });

    document.querySelectorAll("#stockInModal .btn-save").forEach((btn) => {
      if (readonly) btn.setAttribute("disabled", true);
      else btn.removeAttribute("disabled");
    });

    document.getElementById("stockInModal").classList.remove("hidden");
  }

  // HỦY DUYỆT NHẬP
  async function cancelApproveStockIn() {
    if (!selectedStockIn) return;

    if (!confirm("Bạn chắc chắn muốn hủy duyệt phiếu này?")) return;

    await fetchData(
      `${API_BASE_URL}/stock-vouchers/${selectedStockIn.id}/cancel-approve`,
      { method: "POST" },
    );

    loadStockIns();
    showToast("Đã hủy duyệt phiếu nhập");
  }
  /* ================= EXPORT FOR HTML ================= */
  window.openAddStockIn = openAddStockIn;
  window.openViewStockIn = openViewStockIn;
  window.openEditStockIn = openEditStockIn;
  window.addDetailRow = addDetailRow;
  window.saveStockIn = saveStockIn;
  window.approveStockIn = approveStockIn;
  window.cancelApproveStockIn = cancelApproveStockIn;
  window.searchStockIn = searchStockIn;
  window.closeStockIn = closeStockIn;
})();
