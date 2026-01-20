/*************************************************
 * WAREHOUSE MODULE – WMS
 *************************************************/
(function () {
  let warehouses = [];
  let selectedWarehouse = null;
  let warehousePage = 1;
  let warehousePageSize = 5;

  /* ================= INIT ================= */
  function initWarehousesPage() {
    if (!document.getElementById("warehouse-body")) return;
    loadWarehousesPage();
    updateWarehouseToolbar();
  }
  // 👉 ĐĂNG KÝ VỚI ROUTER
  window.pageRegistry["warehouse"] = initWarehousesPage;
  /* ================= LOAD ================= */
  async function loadWarehousesPage() {
    try {
      const res = await fetch(`${API_BASE_URL}/warehouses/all`);
      warehouses = await res.json();
      renderWarehouses();
    } catch (err) {
      console.error(err);
      showToast("Không tải được kho", "error");
    }
  }

  /* ================= RENDER ================= */
  function renderWarehouses() {
    const tbody = document.getElementById("warehouse-body");
    if (!tbody) return;

    const keyword =
      document.getElementById("searchInput")?.value.toLowerCase() || "";

    const filtered = warehouses.filter(
      (w) =>
        w.name.toLowerCase().includes(keyword) ||
        w.code.toLowerCase().includes(keyword),
    );

    const start = (warehousePage - 1) * warehousePageSize;
    const pageData = filtered.slice(start, start + warehousePageSize);

    tbody.innerHTML = "";
    selectedWarehouse = null;
    updateWarehouseToolbar();

    pageData.forEach((w) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>${w.code}</td>
      <td>${w.name}</td>
      <td>${w.address || ""}</td>
      <td style="text-align:center">
        <input type="checkbox" disabled ${w.isActive ? "checked" : ""}/>
      </td>
    `;
      tr.addEventListener("click", () => selectWarehouse(tr, w));
      tr.addEventListener("dblclick", () => editWarehouse(w));

      tbody.appendChild(tr);
    });

    renderBasePagination({
      totalItems: filtered.length,
      currentPage: warehousePage,
      pageSize: warehousePageSize,
      containerId: "warehouse-pagination",
      onPageChange: (page) => {
        warehousePage = page;
        renderWarehouses();
      },
    });
  }

  /* ================= SELECT ================= */
  function selectWarehouse(row, warehouse) {
    const isSelected = row.classList.contains("selected");

    document
      .querySelectorAll("#warehouse-body tr")
      .forEach((tr) => tr.classList.remove("selected"));

    if (isSelected) {
      selectedWarehouse = null;
    } else {
      row.classList.add("selected");
      selectedWarehouse = warehouse;
    }

    updateWarehouseToolbar();
  }

  /* ================= SEARCH ================= */
  function searchWarehouses() {
    warehousePage = 1;
    renderWarehouses();
  }

  /* ================= TOOLBAR ================= */
  function updateWarehouseToolbar() {
    const btnEditWarehouse = document.getElementById("btnEditWarehouse");
    const btnDeleteWarehouse = document.getElementById("btnDeleteWarehouse");

    if (btnEditWarehouse) btnEditWarehouse.disabled = !selectedWarehouse;
    if (btnDeleteWarehouse) btnDeleteWarehouse.disabled = !selectedWarehouse;
  }

  /* ================= PAGE SIZE ================= */
  function changeWarehousePageSize() {
    warehousePageSize = Number(
      document.getElementById("warehousePageSize")?.value || 5,
    );
    warehousePage = 1;
    renderWarehouses();
  }
  /* ================= ADD ================= */
  async function openWarehouseForm() {
    selectedWarehouse = null;
    updateWarehouseToolbar();

    document.getElementById("warehouseModalTitle").innerText = "Thêm kho";
    document.getElementById("warehouseId").value = "";
    document.getElementById("whCode").value = "";
    document.getElementById("whName").value = "";
    document.getElementById("whAddress").value = "";

    const modal = document.getElementById("warehouseModal");
    modal.classList.remove("hidden");
  }

  /* ================= EDIT ================= */
  function editSelectedWarehouse() {
    if (!selectedWarehouse) {
      showToast("Vui lòng chọn kho để sửa", "error");
      return;
    }
    editWarehouse(selectedWarehouse);
  }

  async function editWarehouse(warehouse) {
    selectedWarehouse = warehouse;
    updateWarehouseToolbar();

    document.getElementById("warehouseModalTitle").innerText = "Sửa kho";
    document.getElementById("warehouseId").value = warehouse.id;
    document.getElementById("whCode").value = warehouse.code;
    document.getElementById("whName").value = warehouse.name;
    document.getElementById("whAddress").value = warehouse.address;
    document.getElementById("whIsActive").checked = warehouse.isActive;

    document.getElementById("warehouseModal").classList.remove("hidden");
  }

  /* ================= SAVE ================= */
  async function saveWarehouse() {
    const code = document.getElementById("whCode").value.trim();
    const name = document.getElementById("whName").value.trim();
    const address = document.getElementById("whAddress").value.trim();
    const isActive = document.getElementById("whIsActive").checked;

    if (!code) return showToast("Mã kho không được để trống", "error");
    if (!name) return showToast("Tên kho không được để trống", "error");
    const payload = { code, name, address, isActive };

    if (selectedWarehouse) {
      if (
        !confirm(`Bạn có chắc chắn muốn sửa kho "${selectedWarehouse.name}" ?`)
      )
        return;
      await fetchData(`${API_BASE_URL}/warehouses/${selectedWarehouse.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await fetchData(`${API_BASE_URL}/warehouses`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
    closeWarehouseForm();
    loadWarehousesPage();
    showToast("Lưu kho thành công", "success");
  }

  /* ================= DELETE ================= */
  async function deleteWarehouse() {
    if (!selectedWarehouse)
      return showToast("Vui lòng chọn kho để xóa", "error");

    if (!confirm(`Bạn có chắc chắn muốn xóa kho "${selectedWarehouse.name}" ?`))
      return;
    await fetchData(`${API_BASE_URL}/warehouses/${selectedWarehouse.id}`, {
      method: "DELETE",
    });

    loadWarehousesPage();
    showToast("Xóa kho thành công!", "success");
  }

  /* ================= MODAL ================= */
  function closeWarehouseForm() {
    document.getElementById("warehouseModal").classList.add("hidden");
  }
  // EXPORT
  window.searchWarehouses = searchWarehouses;
  window.changeWarehousePageSize = changeWarehousePageSize;
  window.openWarehouseForm = openWarehouseForm;
  window.editSelectedWarehouse = editSelectedWarehouse;
  window.closeWarehouseForm = closeWarehouseForm;
  window.saveWarehouse = saveWarehouse;
  window.deleteWarehouse = deleteWarehouse;
})();
