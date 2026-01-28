/*=============stock-out.js============== */
(function () {
  let stockOuts = [];
  let selected = null;
  let page = 1;
  let pageSize = 5;
  let products = [];
  let warehouses = [];
  let stockByWarehouse = [];

  async function initStockOutPage() {
    if (!document.getElementById("stockout-body")) return;
    await loadStockOuts();
  }

  window.pageRegistry["stock-out"] = initStockOutPage;

  /* ================= LOAD BASE ================= */
  async function loadBaseData() {
    products = await fetchData(`${API_BASE_URL}/products`);
    warehouses = await fetchData(`${API_BASE_URL}/warehouses`);

    const whSelect = document.getElementById("fromWarehouse");
    if (!whSelect) return;

    whSelect.innerHTML = `<option value="">-- Chọn kho --</option>`;
    warehouses.forEach((w) => {
      const opt = document.createElement("option");
      opt.value = w.id;
      opt.textContent = w.name;
      whSelect.appendChild(opt);
    });
  }

  async function loadStockOuts() {
    stockOuts = await fetchData(`${API_BASE_URL}/stock-vouchers/out`);
    render();
  }

  function render() {
    const tbody = document.getElementById("stockout-body");
    tbody.innerHTML = "";
    selected = null;
    document.getElementById("btnApproveOut").disabled = true;

    stockOuts.forEach((v) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${v.voucherCode}</td>
        <td>${v.voucherDate.substring(0, 10)}</td>
        <td>${v.fromWarehouseName}</td>
        <td>${v.status}</td>
      `;
      tr.onclick = () => select(tr, v);
      tbody.appendChild(tr);
    });
  }

  function select(tr, v) {
    document
      .querySelectorAll("#stockout-body tr")
      .forEach((x) => x.classList.remove("selected"));
    tr.classList.add("selected");
    selected = v;
    document.getElementById("btnApproveOut").disabled = v.status !== "DRAFT";
    document.getElementById("btnEdit").disabled = v.status !== "DRAFT";
    document.getElementById("btnCancelApprove").disabled =
      v.status !== "APPROVED";
    document.getElementById("btnView").disabled = false;
  }

  async function approveStockOut() {
    if (!selected) return;
    await fetchData(
      `${API_BASE_URL}/stock-vouchers/${selected.id}/approve-out`,
      { method: "POST" },
    );
    showToast("Đã duyệt phiếu xuất");
    loadStockOuts();
  }

  /* ================= ADD ================= */
  function openAddStockOut() {
    document.getElementById("voucherDate").valueAsDate = new Date();
    document.getElementById("note").value = "";
    document.getElementById("detail-body").innerHTML = "";
    loadBaseData().then(() => {
      document
        .getElementById("fromWarehouse")
        .addEventListener("change", onWarehouseChange);
    });
    document.getElementById("stockOutModal").classList.remove("hidden");
  }

  /* ================= SAVE ================= */
  async function saveStockOut() {
    const details = [...document.querySelectorAll("#detail-body tr")].map(
      (tr) => ({
        productId: Number(tr.querySelector(".product").value),
        quantity: Number(tr.querySelector(".qty").value),
        price: Number(tr.querySelector(".price").value),
      }),
    );

    const payload = {
      voucherDate: document.getElementById("voucherDate").value,
      fromWarehouseId: Number(document.getElementById("fromWarehouse").value),
      note: document.getElementById("note").value,
      details,
    };

    if (selected) {
      await fetchData(`${API_BASE_URL}/stock-vouchers/${selected.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showToast("Cập nhật phiếu nhập thành công");
    } else {
      await fetchData(`${API_BASE_URL}/stock-vouchers`, {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          voucherType: "OUT",
        }),
      });
      showToast("Tạo phiếu nhập thành công");
    }

    closeStockOut();
    loadStockOuts();
  }

  /* ================= DETAILS ================= */
  function addDetailRow() {
    if (!stockByWarehouse.length) {
      showToast("Vui lòng chọn kho có tồn", "error");
      return;
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
    <td>
      <select class="product" onchange="onProductChange(this)">
        <option value="">-- SP --</option>
        ${stockByWarehouse
          .map(
            (p) =>
              `<option value="${p.productId}">
                ${p.productName} (Tồn: ${p.quantity})
              </option>`,
          )
          .join("")}
      </select>
    </td>
    <td>
      <input type="number" class="qty" value="1" min="1"
        oninput="validateQty(this)" />
    </td>
    <td>
      <input type="number" class="price" value="0" readonly />
    </td>
    <td>
      <button onclick="this.closest('tr').remove()">✖</button>
    </td>
  `;

    document.getElementById("detail-body").appendChild(tr);
  }

  // EDIT
  function openEditStockOut() {
    if (!selected) {
      showToast("Vui lòng chọn phiếu cần sửa", "warning");
      return;
    }

    if (selected.status !== "DRAFT") {
      showToast("Chỉ được sửa phiếu ở trạng thái DRAFT", "warning");
      return;
    }

    // fill header
    document.getElementById("voucherDate").value =
      selected.voucherDate.substring(0, 10);
    document.getElementById("fromWarehouse").value =
      selected.fromWarehouseId ?? "";
    document.getElementById("note").value = selected.note ?? "";
    // load chi tiết từ BE
    loadStockOutDetails(selected.id);

    document.getElementById("stockOutModal").classList.remove("hidden");
  }

  // LOAD CHI TIẾT PHIẾU
  async function loadStockOutDetails(id) {
    loadBaseData();
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
  // XEM CHI TIẾT PHIẾU NHẬP
  async function openViewStockOut() {
    if (!selected) return;

    const data = await fetchData(
      `${API_BASE_URL}/stock-vouchers/${selected.id}`,
    );
    fillStockOutModal(data, true);
  }

  // NẠP DỮ LIỆU LÊN MODAL
  function fillStockOutModal(data, readonly) {
    loadBaseData();
    document.getElementById("voucherDate").value = data.voucherDate.substring(
      0,
      10,
    );
    document.getElementById("fromWarehouse").value = data.fromWarehouseId;
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
      .querySelectorAll("#stockOutModal input, #stockOutModal select")
      .forEach((el) => {
        if (readonly) el.setAttribute("disabled", true);
        else el.removeAttribute("disabled");
      });

    document.querySelectorAll("#stockOutModal .btn-save").forEach((btn) => {
      if (readonly) btn.setAttribute("disabled", true);
      else btn.removeAttribute("disabled");
    });

    document.getElementById("stockOutModal").classList.remove("hidden");
  }
  /* ================= OTHER ================= */
  function closeStockOut() {
    document.getElementById("stockOutModal").classList.add("hidden");
  }
  // Đổi kho
  async function onWarehouseChange() {
    const warehouseId = document.getElementById("fromWarehouse").value;

    if (!warehouseId) return;

    // gọi API tồn kho theo kho
    stockByWarehouse = await fetchData(
      `${API_BASE_URL}/stock-balances?warehouseId=${warehouseId}`,
    );

    // reset chi tiết
    document.getElementById("detail-body").innerHTML = "";
    addDetailRow();
  }
  // Valid số lượng không quá tồn
  function validateQty(input) {
    const tr = input.closest("tr");
    const productId = tr.querySelector(".product").value;

    const stock = stockByWarehouse.find((x) => x.productId == productId);

    if (!stock) return;

    if (Number(input.value) > stock.quantity) {
      input.value = stock.quantity;
      showToast("Số lượng vượt tồn kho", "error");
    }
  }

  function onProductChange(select) {
    const tr = select.closest("tr");
    const productId = select.value;

    const stock = stockByWarehouse.find((x) => x.productId == productId);

    if (!stock) return;

    // 🔥 set giá nhập
    tr.querySelector(".price").value = stock.inPrice || 0;
  }

  // HỦY DUYỆT XUẤT
  async function cancelApproveStockOut() {
    if (!selected) return;

    if (!confirm("Bạn chắc chắn muốn hủy duyệt phiếu này?")) return;

    await fetchData(
      `${API_BASE_URL}/stock-vouchers/${selected.id}/cancel-approve-out`,
      { method: "POST" },
    );

    loadStockOuts();
    showToast("Đã hủy duyệt phiếu xuất");
  }

  window.openAddStockOut = openAddStockOut;
  window.openViewStockOut = openViewStockOut;
  window.openEditStockOut = openEditStockOut;
  window.saveStockOut = saveStockOut;
  window.addDetailRow = addDetailRow;
  window.closeStockOut = closeStockOut;
  window.approveStockOut = approveStockOut;
  window.validateQty = validateQty;
  window.onProductChange = onProductChange;
  window.cancelApproveStockOut = cancelApproveStockOut;
})();
