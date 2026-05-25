const STORAGE_KEY = "guzel_kuafor_randevular";

function getRandevularFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveRandevularToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateLiveStatsAndTable();
}

function toggleMenu() {
  const menu = document.getElementById("mainMenu");
  const overlay = document.getElementById("menuOverlay");
  menu.classList.toggle("show");
  overlay.style.display = menu.classList.contains("show") ? "block" : "none";
}

// دراپ‌داون‌ها
const dropdowns = document.querySelectorAll(".dropdown-wrapper");
const openRandevuBtn = document.getElementById("openRandevuBtn");

function checkDropdownSelection() {
  const aktivite = document
    .getElementById("selectedAktiviteText")
    .innerText.trim();
  const kuafor = document.getElementById("selectedKuaforText").innerText.trim();
  if (aktivite !== "Uygulama Seç" && kuafor !== "Kuaför Seç") {
    openRandevuBtn.classList.remove("btn-disabled");
  } else {
    openRandevuBtn.classList.add("btn-disabled");
  }
}

dropdowns.forEach((dropdown) => {
  const button = dropdown.querySelector(".search-item");
  const menu = dropdown.querySelector(".dropdown-menu");

  if (button && menu && button.id !== "openRandevuBtn") {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdowns.forEach((d) => {
        if (d !== dropdown) d.classList.remove("active");
      });
      dropdown.classList.toggle("active");
    });

    menu.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", () => {
        const text = item.querySelector("span").innerText.trim();

        if (dropdown.id === "aktiviteWrapper") {
          document.getElementById("selectedAktiviteText").innerText = text;
          const container = document.getElementById("aktiviteIconContainer");
          const icon = item.querySelector("i");
          if (icon) {
            container.innerHTML = "";
            container.appendChild(icon.cloneNode(true));
          }
        }

        if (dropdown.id === "kuaforWrapper") {
          document.getElementById("selectedKuaforText").innerText = text;
          const img = item.querySelector("img");
          if (img) {
            const container = document.getElementById("kuaforIconContainer");
            const newImg = document.createElement("img");
            newImg.src = img.src;
            newImg.className = "dynamic-avatar";
            container.innerHTML = "";
            container.appendChild(newImg);
          }
        }

        dropdown.classList.remove("active");
        checkDropdownSelection();
      });
    });
  }
});

document.addEventListener("click", () =>
  dropdowns.forEach((d) => d.classList.remove("active")),
);

// مدال
const modalOverlay = document.getElementById("randevuModal");
let selectedDateStr = "";
let selectedSlotStr = "";
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

document.getElementById("openRandevuBtn").addEventListener("click", () => {
  if (openRandevuBtn.classList.contains("btn-disabled")) {
    alert("Lütfen önce Aktivite ve Kuaför seçimi yapınız.");
    return;
  }
  modalOverlay.classList.add("open");
  resetRandevuForm();
});

document.querySelectorAll(".btnCloseModal").forEach((btn) => {
  btn.addEventListener("click", () => modalOverlay.classList.remove("open"));
});

function resetRandevuForm() {
  document.getElementById("stepUserAuth").classList.remove("step-hidden");
  document.getElementById("stepNewRandevu").classList.add("step-hidden");
  document.getElementById("stepExistingUser").classList.add("step-hidden");
  document.getElementById("stepAdminPanel").classList.add("step-hidden");
  document.getElementById("modalBox").classList.remove("admin-mode");
  document.getElementById("modalMainTitle").style.display = "block";

  document.getElementById("inputFullName").value = "";
  document.getElementById("inputPhone").value = "";
  selectedDateStr = "";
  selectedSlotStr = "";
  document.getElementById("slotsSection").classList.add("disabled-area");
  document.getElementById("btnSaveRandevu").disabled = true;
  document
    .querySelectorAll(".slot-item")
    .forEach((s) => s.classList.remove("selected"));
  renderCalendar();
}

// تقویم
const monthNamesTr = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function renderCalendar() {
  const titleEl = document.getElementById("calendarTitle");
  const daysContainer = document.getElementById("calendarDays");
  daysContainer.innerHTML = "";
  titleEl.innerText = `${monthNamesTr[currentMonth]} ${currentYear}`;

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < adjustedFirstDay; i++) {
    const empty = document.createElement("span");
    empty.classList.add("empty");
    daysContainer.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day++) {
    const daySpan = document.createElement("span");
    daySpan.innerText = day;
    const cellDate = new Date(currentYear, currentMonth, day);
    const dateStr = `${day} ${monthNamesTr[currentMonth]} ${currentYear}`;

    if (dateStr === selectedDateStr) daySpan.classList.add("selected");
    if (cellDate.getDay() === 0) daySpan.classList.add("sunday");

    if (cellDate <= today) {
      daySpan.classList.add("past-day");
    } else {
      daySpan.addEventListener("click", () => {
        document
          .querySelectorAll("#calendarDays span")
          .forEach((s) => s.classList.remove("selected"));
        daySpan.classList.add("selected");
        selectedDateStr = dateStr;
        document
          .getElementById("slotsSection")
          .classList.remove("disabled-area");
        checkFormCompletion();
      });
    }
    daysContainer.appendChild(daySpan);
  }
}

document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});
document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

document.querySelectorAll(".slot-item").forEach((slot) => {
  slot.addEventListener("click", () => {
    if (
      document
        .getElementById("slotsSection")
        .classList.contains("disabled-area")
    )
      return;
    document
      .querySelectorAll(".slot-item")
      .forEach((s) => s.classList.remove("selected"));
    slot.classList.add("selected");
    selectedSlotStr = slot.getAttribute("data-slot");
    checkFormCompletion();
  });
});

function checkFormCompletion() {
  document.getElementById("btnSaveRandevu").disabled = !(
    selectedDateStr && selectedSlotStr
  );
}

// ذخیره رزرو
document.getElementById("btnSaveRandevu").addEventListener("click", () => {
  const fullName = document.getElementById("inputFullName").value.trim();
  const phone = document.getElementById("inputPhone").value.trim();
  const aktivite = document
    .getElementById("selectedAktiviteText")
    .innerText.trim();
  const kuafor = document.getElementById("selectedKuaforText").innerText.trim();

  if (!fullName || !phone || !selectedDateStr || !selectedSlotStr) return;

  let list = getRandevularFromStorage();
  const index = list.findIndex(
    (item) =>
      item.fullName.toLowerCase() === fullName.toLowerCase() &&
      item.phone === phone,
  );

  if (index !== -1) {
    list[index] = {
      fullName,
      phone,
      aktivite,
      kuafor,
      date: selectedDateStr,
      slot: selectedSlotStr,
    };
    alert("Randevunuz başarıyla güncellendi.");
  } else {
    list.push({
      fullName,
      phone,
      aktivite,
      kuafor,
      date: selectedDateStr,
      slot: selectedSlotStr,
    });
    alert("Randevunuz başarıyla kaydedildi.");
  }

  saveRandevularToStorage(list);
  modalOverlay.classList.remove("open");
});

// چک کاربر و ادمین
document.getElementById("btnCheckUser").addEventListener("click", () => {
  const fullName = document.getElementById("inputFullName").value.trim();
  const phone = document.getElementById("inputPhone").value.trim();

  if (!fullName || !phone) {
    alert("Ad ve telefon numarası zorunludur.");
    return;
  }

  if (fullName === "admin" && phone === "9122449512") {
    document.getElementById("stepUserAuth").classList.add("step-hidden");
    document.getElementById("modalMainTitle").style.display = "none";
    document.getElementById("modalBox").classList.add("admin-mode");
    document.getElementById("stepAdminPanel").classList.remove("step-hidden");
    updateLiveStatsAndTable();
    return;
  }

  const list = getRandevularFromStorage();
  const exists = list.some(
    (item) =>
      item.fullName.toLowerCase() === fullName.toLowerCase() &&
      item.phone === phone,
  );

  document.getElementById("stepUserAuth").classList.add("step-hidden");
  if (exists) {
    document.getElementById("stepExistingUser").classList.remove("step-hidden");
  } else {
    document.getElementById("stepNewRandevu").classList.remove("step-hidden");
  }
});

document.getElementById("btnEditExisting").addEventListener("click", () => {
  document.getElementById("stepExistingUser").classList.add("step-hidden");
  document.getElementById("stepNewRandevu").classList.remove("step-hidden");
});

document.getElementById("btnCancelExisting").addEventListener("click", () => {
  if (confirm("Randevunuzu iptal etmek istediğinizden emin misiniz?")) {
    let list = getRandevularFromStorage();
    const name = document
      .getElementById("inputFullName")
      .value.trim()
      .toLowerCase();
    const phone = document.getElementById("inputPhone").value.trim();
    list = list.filter(
      (item) => !(item.fullName.toLowerCase() === name && item.phone === phone),
    );
    saveRandevularToStorage(list);
    alert("Randevunuz iptal edildi.");
    modalOverlay.classList.remove("open");
  }
});

document.getElementById("btnBackToAuth").addEventListener("click", () => {
  document.getElementById("stepExistingUser").classList.add("step-hidden");
  document.getElementById("stepUserAuth").classList.remove("step-hidden");
});

document
  .getElementById("btnAdminBack")
  .addEventListener("click", () => modalOverlay.classList.remove("open"));

function updateLiveStatsAndTable() {
  const list = getRandevularFromStorage();
  document.getElementById("liveStatsCount").innerText = list.length;

  const tbody = document.getElementById("adminTableBody");
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#999;">Henüz randevu kaydı yok.</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .slice()
    .reverse()
    .map((item, idx) => {
      const realIndex = list.length - 1 - idx;
      return `
            <tr>
              <td><strong>${item.fullName}</strong></td>
              <td>${item.phone}</td>
              <td><span class="badge badge-aktivite">${item.aktivite}</span></td>
              <td><span class="badge badge-kuafor">${item.kuafor}</span></td>
              <td><span class="badge badge-date">${item.date} - ${item.slot}</span></td>
              <td><button class="btn-delete-row" onclick="deleteSingleRandevu(${realIndex})">Sil</button></td>
            </tr>`;
    })
    .join("");
}

window.deleteSingleRandevu = function (index) {
  if (confirm("Bu randevuyu silmek istediğinizden emin misiniz?")) {
    let list = getRandevularFromStorage();
    list.splice(index, 1);
    saveRandevularToStorage(list);
  }
};

document.getElementById("btnClearStorage").addEventListener("click", () => {
  if (confirm("Tüm randevuları silmek istediğinizden emin misiniz?")) {
    localStorage.removeItem(STORAGE_KEY);
    updateLiveStatsAndTable();
  }
});

// بستن خودکار منو موبایل بعد از کلیک روی آیتم
document.querySelectorAll(".main-navigation-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    const menu = document.getElementById("mainMenu");
    const overlay = document.getElementById("menuOverlay");

    if (window.innerWidth <= 768) {
      // فقط در موبایل
      menu.classList.remove("show");
      overlay.style.display = "none";
    }
  });
});
// شروع
window.addEventListener("DOMContentLoaded", () => {
  updateLiveStatsAndTable();
  checkDropdownSelection();
  renderCalendar();
});
