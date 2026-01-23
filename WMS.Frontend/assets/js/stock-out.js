(function () {
  let stockOuts = [];
  let selected = null;
  let page = 1;
  let pageSize = 5;
  let products = [];
  let warehouses = [];

  async function initStockOutPage() {
    if (!document.getElementById("stockout-body")) return;
    products = await fetchData(`${API_BASE_URL}/products`);
    warehouses = await fetchData(`${API_BASE_URL}/warehouses`);
    await loadBaseData;
    await loadStockOuts();
  }

  window.pageRegistry["stock-out"] = initStockOutPage;

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
    addDetailRow();
    document.getElementById("stockOutModal").classList.remove("hidden");
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
  /* ================= OTHER ================= */
  function closeStockOut() {
    document.getElementById("stockOutModal").classList.add("hidden");
  }

  window.openAddStockOut = openAddStockOut;
  window.addDetailRow = addDetailRow;
  window.closeStockOut = closeStockOut;
  window.approveStockOut = approveStockOut;
})();
