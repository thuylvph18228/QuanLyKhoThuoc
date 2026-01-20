/*************************************************
 * UNIT MODULE – WMS
 *************************************************/
(function () {
  let unitList = [];
  let selectedUnit = null;
  let unitPage = 1;
  let unitPageSize = 5;

  /* ================= INIT ================= */
  function initUnitsPage() {
    if (!document.getElementById("unit-body")) return;
    loadUnitsPage();
    updateUnitToolbar();
  }
  // 👉 ĐĂNG KÝ VỚI ROUTER
  window.pageRegistry["unit"] = initUnitsPage;

  /* ================= LOAD ================= */
  async function loadUnitsPage() {
    try {
      const res = await fetch(`${API_BASE_URL}/units/all`);
      unitList = await res.json();
      renderUnits();
    } catch (err) {
      console.error(err);
      showToast("Không tải được đơn vị tính", "error");
    }
  }

  /* ================= RENDER ================= */
  function renderUnits() {
    const tbody = document.getElementById("unit-body");
    if (!tbody) return;

    const keyword =
      document.getElementById("searchInput")?.value.toLowerCase() || "";

    const filtered = unitList.filter((u) =>
      u.name.toLowerCase().includes(keyword),
    );

    const start = (unitPage - 1) * unitPageSize;
    const pageData = filtered.slice(start, start + unitPageSize);

    tbody.innerHTML = "";
    selectedUnit = null;
    updateUnitToolbar();

    pageData.forEach((u) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
      <td>${u.name}</td>
      <td style="text-align:center">
        <input type="checkbox" disabled ${u.isActive ? "checked" : ""}/>
      </td>
    `;

      tr.addEventListener("click", () => selectUnit(tr, u));
      tr.addEventListener("dblclick", () => openEditUnit(u));

      tbody.appendChild(tr);
    });

    renderBasePagination({
      totalItems: filtered.length,
      currentPage: unitPage,
      pageSize: unitPageSize,
      containerId: "unit-pagination",
      onPageChange: (page) => {
        unitPage = page;
        renderUnits();
      },
    });
  }

  /* ================= SELECT ================= */
  function selectUnit(row, unit) {
    const isSelected = row.classList.contains("selected");

    document
      .querySelectorAll("#unit-body tr")
      .forEach((tr) => tr.classList.remove("selected"));

    if (isSelected) {
      selectedUnit = null;
    } else {
      row.classList.add("selected");
      selectedUnit = unit;
    }

    updateUnitToolbar();
  }

  /* ================= SEARCH ================= */
  function searchUnits() {
    unitPage = 1;
    renderUnits();
  }

  /* ================= ADD / EDIT ================= */
  function openAddUnit() {
    selectedUnit = null;
    updateUnitToolbar();
    document.getElementById("unitId").value = "";
    document.getElementById("unitName").value = "";
    document.getElementById("unitIsActive").checked = true;
    document.getElementById("unitModal").classList.remove("hidden");
  }
  function openEditUnit(unit = selectedUnit) {
    if (!unit) {
      showToast("Vui lòng chọn đơn vị để sửa", "error");
      return;
    }
    selectedUnit = unit;
    updateUnitToolbar();
    document.getElementById("unitId").value = unit.id;
    document.getElementById("unitName").value = unit.name;
    document.getElementById("unitIsActive").checked = unit.isActive;
    document.getElementById("unitModal").classList.remove("hidden");
  }
  /* ================= SAVE ================= */
  async function saveUnit() {
    const name = document.getElementById("unitName").value.trim();
    const isActive = document.getElementById("unitIsActive").checked;

    if (!name) {
      showToast("Tên không được để trống", "error");
      return;
    }
    const payload = { name, isActive };
    if (selectedUnit) {
      if (
        !confirm(
          `Bạn có chắc chắn muốn sửa đơn vị tính "${selectedUnit.name}" không?`,
        )
      )
        return;
      await fetchData(`${API_BASE_URL}/units/${selectedUnit.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await fetchData(`${API_BASE_URL}/units`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
    closeUnitModal();
    loadUnitsPage();
    showToast("Lưu đơn vị tính thành công", "success");
  }

  /* ================= DELETE ================= */
  async function deleteUnit() {
    if (!selectedUnit)
      return showToast("Vui lòng chọn đơn vị tính để xóa", "error");

    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa đơn vị tính "${selectedUnit.name}" không?`,
      )
    )
      return;
    await fetchData(`${API_BASE_URL}/units/${selectedUnit.id}`, {
      method: "DELETE",
    });

    loadUnitsPage();
    showToast("Xóa đơn vị tính thành công!", "success");
  }

  /* ================= TOOLBAR ================= */
  function updateUnitToolbar() {
    const btnEditUnit = document.getElementById("btnEditUnit");
    const btnDeleteUnit = document.getElementById("btnDeleteUnit");

    if (btnEditUnit) btnEditUnit.disabled = !selectedUnit;
    if (btnDeleteUnit) btnDeleteUnit.disabled = !selectedUnit;
  }

  /* ================= PAGE SIZE ================= */
  function changeUnitPageSize() {
    unitPageSize = Number(document.getElementById("unitPageSize")?.value || 5);
    unitPage = 1;
    renderUnits();
  }

  /* ================= MODAL ================= */
  function closeUnitModal() {
    document.getElementById("unitModal").classList.add("hidden");
  }
  // EXPORT
  window.searchUnits = searchUnits;
  window.changeUnitPageSize = changeUnitPageSize;
  window.openAddUnit = openAddUnit;
  window.openEditUnit = openEditUnit;
  window.closeUnitModal = closeUnitModal;
  window.saveUnit = saveUnit;
  window.deleteUnit = deleteUnit;
})();
