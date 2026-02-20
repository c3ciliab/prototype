// /* OPEN/CLOSE MENU */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;

  const item = btn.closest(".menu-filter");
  const list = item.querySelector(".filter-list");

  const willOpen = !item.classList.contains("is-open");
  item.classList.toggle("is-open", willOpen);

  btn.setAttribute("aria-expanded", String(willOpen));
  if (list) {
    list.style.removeProperty("max-height");
  }
});

// /* SEARCH PANEL */ 
document.addEventListener("input", (e) => {
  const input = e.target.closest(".search-input");
  if (!input) return;

  const panel = input.closest(".filter-panel");
  const q = input.value.trim().toLowerCase();

  panel.querySelectorAll(".checklist-item").forEach(li => {
    if (li.classList.contains("checklist-item--selectall")) return;

    const label = li.innerText.trim().toLowerCase();
    li.style.display = label.includes(q) ? "" : "none";
  });

  // recalc dropdown height after filtering
  const wrap = input.closest(".menu-filter")?.querySelector(".filter-list");
  if (wrap && wrap.closest(".menu-filter").classList.contains("is-open")) {
    setMaxHeight(wrap, true);
  }

  // update select-all state after filtering
  updateSelectAll(panel);
});

// select all + indeterminate
function updateSelectAll(panel) {
  const selectAll = panel.querySelector(".select-all");
  const items = [...panel.querySelectorAll(".check-input.item")]
    .filter(cb => cb.closest(".checklist-item").style.display !== "none");

  const checked = items.filter(cb => cb.checked).length;

  if (!selectAll) return;
  selectAll.indeterminate = checked > 0 && checked < items.length;
  selectAll.checked = items.length > 0 && checked === items.length;
}

document.addEventListener("change", (e) => {
  const panel = e.target.closest(".filter-panel");
  if (!panel) return;

  // click select-all
  if (e.target.classList.contains("select-all")) {
    const checked = e.target.checked;
    panel.querySelectorAll(".check-input.item").forEach(cb => {
      // option: ne coche que les visibles
      if (cb.closest(".checklist-item").style.display === "none") return;
      cb.checked = checked;
    });
    updateSelectAll(panel);
    return;
  }

  // click a single item -> update select-all state
  if (e.target.classList.contains("item")) {
    updateSelectAll(panel);
  }
});

document.addEventListener("click", (e) => {
  const clearBtn = e.target.closest(".search-clear");
  if (!clearBtn) return;

  const panel = clearBtn.closest(".filter-panel");
  const input = panel.querySelector(".search-input");
  const wrap = panel.closest(".menu-filter")?.querySelector(".filter-list");

  // 1) reset search
  if (input) input.value = "";

  // 2) show all rows
  panel.querySelectorAll(".checklist-item").forEach(li => {
    li.style.display = "";
  });

  // 3) uncheck all items
  panel.querySelectorAll(".check-input.item").forEach(cb => cb.checked = false);

  // 4) reset select all state
  const selectAll = panel.querySelector(".select-all");
  if (selectAll) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  }

  // 5) recalc dropdown height if open
  if (wrap && wrap.closest(".menu-filter").classList.contains("is-open")) {
    wrap.style.maxHeight = wrap.scrollHeight + "px";
  }
});

// display selection
const HATCHERY_FILTERS = ["hatcheryFilterSide", "hatcheryFilterHeader"];

/* récupère les valeurs cochées dans un filtre */
function getCheckedValues(filter) {
  return [...filter.querySelectorAll(".check-input.item:checked")].map(cb => cb.value);
}

/* applique une sélection (par values) dans un filtre */
function setCheckedValues(filter, values) {
  filter.querySelectorAll(".check-input.item").forEach(cb => {
    cb.checked = values.includes(cb.value);
  });
}

/* met à jour l'état Select All (checked / indeterminate) */
function updateSelectAll(filter) {
  const selectAll = filter.querySelector(".check-input.select-all");
  if (!selectAll) return;

  const items = [...filter.querySelectorAll(".check-input.item")];
  const checked = items.filter(i => i.checked).length;

  selectAll.checked = items.length > 0 && checked === items.length;
  selectAll.indeterminate = checked > 0 && checked < items.length;
}

/* met à jour le texte du bouton (liste + ellipsis via CSS) */
function updateHatcherySummary(filter) {
  const btnText = filter.querySelector(".filter-btn > span");
  if (!btnText) return;

  const checkedLabels = [...filter.querySelectorAll(".check-input.item:checked")]
    .map(cb => cb.closest(".check")?.querySelector(".check-label")?.textContent?.trim())
    .filter(Boolean);

  btnText.textContent = checkedLabels.length ? checkedLabels.join(", ") : "Search for a hatchery";
}

/* applique partout une sélection */
function syncAll(fromId, values) {
  HATCHERY_FILTERS.forEach((id) => {
    const filter = document.getElementById(id);
    if (!filter) return;

    // si ce n'est pas celui d'origine : on coche/décoche pareil
    if (id !== fromId) {
      setCheckedValues(filter, values);
    }

    updateSelectAll(filter);
    updateHatcherySummary(filter);
  });
}

/* init : prend la sélection du 1er filtre trouvé */
function initHatcherySync() {
  const first = HATCHERY_FILTERS.map(id => document.getElementById(id)).find(Boolean);
  if (!first) return;
  const values = getCheckedValues(first);
  syncAll(first.id, values);
}

/* CHANGE handler */
document.addEventListener("change", (e) => {
  const filter = e.target.closest("#hatcheryFilterSide, #hatcheryFilterHeader");
  if (!filter) return;

  // click Select All
  if (e.target.matches(".check-input.select-all")) {
    const checked = e.target.checked;
    filter.querySelectorAll(".check-input.item").forEach(cb => cb.checked = checked);

    const values = getCheckedValues(filter);
    syncAll(filter.id, values);
    return;
  }

  // click item
  if (e.target.matches(".check-input.item")) {
    const values = getCheckedValues(filter);
    syncAll(filter.id, values);
  }
});

/* CLEAR handler (pour les 2) */
document.addEventListener("click", (e) => {
  const clear = e.target.closest("#hatcheryFilterSide .search-clear, #hatcheryFilterHeader .search-clear");
  if (!clear) return;

  const filter = clear.closest("#hatcheryFilterSide, #hatcheryFilterHeader");
  if (!filter) return;

  // reset search input local (si tu veux)
  const input = filter.querySelector(".search-input");
  if (input) input.value = "";

  // décoche tout dans le filtre source
  filter.querySelectorAll(".check-input.item").forEach(cb => cb.checked = false);
  const selectAll = filter.querySelector(".check-input.select-all");
  if (selectAll) { selectAll.checked = false; selectAll.indeterminate = false; }

  // sync partout (vide)
  syncAll(filter.id, []);
});

initHatcherySync();


// /* POPUP TOGGLE */
const GAP = 12;

function closeAllPopups(exceptPopup = null) {
  document.querySelectorAll(".popup.is-open").forEach(p => {
    if (p !== exceptPopup) {
      p.classList.remove("is-open");
      p.setAttribute("aria-hidden", "true");
    }
  });

  document.querySelectorAll(".trigger[aria-expanded='true']").forEach(b => {
    const id = b.getAttribute("aria-controls");
    const p = id ? document.getElementById(id) : null;
    if (!exceptPopup || p !== exceptPopup) b.setAttribute("aria-expanded", "false");
  });
}

function positionPopup(trigger, popup) {
  const r = trigger.getBoundingClientRect();
  const pos = trigger.dataset.popupPos || "center";

  popup.style.position = "absolute";
  //popup.style.top = `${window.scrollY + r.bottom + 8}px`; // 8px btn bottom
  //popup.style.left = `${window.scrollX + r.right - popup.offsetWidth}px`; // align right
  popup.style.top = `${window.scrollY + r.bottom + GAP}px`;

  if (pos === "right") {
    // calée à droite de l’écran
    popup.style.left = "auto";
    popup.style.right = "1rem";
  } else {
    // centrée sous le bouton
    popup.style.right = "auto";
    const left = window.scrollX + (r.left + r.width / 2) - (popup.offsetWidth / 2);
    popup.style.left = `${Math.max(window.scrollX + 12, left)}px`; // évite de sortir à gauche
  }
}

function openAndPositionPopup(trigger, popup) {
  // ouvre (selon ton système)
  trigger.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  popup.setAttribute("aria-hidden", "false");

  // IMPORTANT: reset pour éviter les restes
  popup.style.removeProperty("left");
  popup.style.removeProperty("right");

  // position après que la popup ait une vraie taille
  requestAnimationFrame(() => {
    positionPopup(trigger, popup);
    requestAnimationFrame(() => positionPopup(trigger, popup)); // safe si transition
  });
}

document.addEventListener("click", (e) => {
  const trigger = e.target.closest(".trigger");

  // click on trigger
  if (trigger) {
    const popupId = trigger.getAttribute("aria-controls");
    const popup = popupId ? document.getElementById(popupId) : null;
    if (!popup) return;

    const willOpen = !popup.classList.contains("is-open");
    closeAllPopups(popup);

    if (willOpen) {
      popup.classList.add("is-open");
      popup.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");

      // placer après ouverture pour que offsetWidth soit correct
      requestAnimationFrame(() => positionPopup(trigger, popup));
    } else {
      popup.classList.remove("is-open");
      popup.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
    }

    return;
  }

  // click inside popup => don't close
  //if (e.target.closest(".popup")) return;
  
  // if click inside timePicker, don't treat it as outside
  if (e.target.closest("#timePicker")) return;

  // click outside => close everything
  closeAllPopups();
});

// "esc" => close everything
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllPopups();
});

// Si on scroll/resize, on repositionne les popups ouvertes
window.addEventListener("resize", () => {
  document.querySelectorAll(".trigger[aria-expanded='true']").forEach(btn => {
    const id = btn.getAttribute("aria-controls");
    const p = id ? document.getElementById(id) : null;
    if (p && p.classList.contains("is-open")) positionPopup(btn, p);
  });
});
window.addEventListener("scroll", () => {
  document.querySelectorAll(".trigger[aria-expanded='true']").forEach(btn => {
    const id = btn.getAttribute("aria-controls");
    const p = id ? document.getElementById(id) : null;
    if (p && p.classList.contains("is-open")) positionPopup(btn, p);
  });
}, { passive: true });

// /* DELETE */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-delete");
  if (!btn) return;

  btn.closest("p")?.remove();
});

// /* CLOCK */
function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatClock(now) {
  const day = pad2(now.getDate());
  const month = pad2(now.getMonth() + 1);

  let hours = now.getHours();
  const minutes = pad2(now.getMinutes());
  const seconds = pad2(now.getSeconds());

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  return `${day}/${month} - ${hours}:${minutes}:${seconds} ${ampm}`;
}

function formatDay(now) {
  // JJ/Mmm/AAAA
  const day = pad2(now.getDate());
  const month = pad2(now.getMonth() + 1);
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
  //const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  //const mon = months[now.getMonth()];
  //return `${day}, ${mon} ${year}`;
}

function tick() {
  const now = new Date();

  const clockEl = document.getElementById("clock");
  if (clockEl) clockEl.textContent = formatClock(now);

  const dayEl = document.getElementById("dayOnly");
  if (dayEl) dayEl.textContent = formatDay(now);
  //if (dayEl) dayEl.value = formatDay(now);

  document.querySelector("#startDate").placeholder = formatDay(now);
  document.querySelector("#endDate").placeholder = formatDay(now);
}

tick();
setInterval(tick, 1000);

// /* TIME SETTINGS */
function formatDay(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function startOfWeekMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun,1=Mon...
  const diff = (day === 0 ? -6 : 1 - day); // back to Monday
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(0, 0, 0, 0);
  return d;
}

function setDateInputs(startDate, endDate) {
  const startEl = document.querySelector('[name="start-date"]');
  const endEl = document.querySelector('[name="end-date"]');
  if (startEl) startEl.value = formatDay(startDate);
  if (endEl) endEl.value = formatDay(endDate);
}

/**
 * Period rules:
 * - week: from Monday of last week -> today (pending week)
 * - month: previous calendar month (1st -> last day)
 * - quarter: previous calendar quarter
 * - year: previous calendar year
 */
function applyPeriod(periodKey) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let start, end;

  switch (periodKey) {
    case "week": {
      const thisMonday = startOfWeekMonday(now);
      start = new Date(thisMonday);
      start.setDate(start.getDate() - 7); // monday last week
      end = now; // pending week = jusqu'à aujourd'hui
      break;
    }

    case "month": {
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevMonthStart.setHours(0, 0, 0, 0);
      start = prevMonthStart;
      end = endOfMonth(prevMonthStart);
      break;
    }

    case "quarter": {
      const q = Math.floor(now.getMonth() / 3); // 0..3 current quarter index
      const prevQEndMonth = q * 3 - 1;          // last month of prev quarter
      const prevQStartMonth = prevQEndMonth - 2;

      const yearForPrevQ = prevQEndMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const endMonth = (prevQEndMonth + 12) % 12;
      const startMonth = (prevQStartMonth + 12) % 12;

      start = new Date(yearForPrevQ, startMonth, 1);
      start.setHours(0, 0, 0, 0);
      end = endOfMonth(new Date(yearForPrevQ, endMonth, 1));
      break;
    }

    case "year": {
      const y = now.getFullYear() - 1;
      start = new Date(y, 0, 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(y, 11, 31);
      end.setHours(0, 0, 0, 0);
      break;
    }

    case "custom":
    default:
      return; // ne touche pas aux inputs
  }

  setDateInputs(start, end);
}

// /* CUSTOMIZE TIME */
function openPopupById(popupId) {
  const popup = document.getElementById(popupId);
  if (!popup) return;

  // trouve le trigger associé
  const trigger = document.querySelector(`.trigger[aria-controls="${popupId}"]`);

  // ferme les autres triggers/popups
  document.querySelectorAll(".trigger.is-open").forEach(t => t.classList.remove("is-open"));
  document.querySelectorAll(".popup.is-open").forEach(p => p.classList.remove("is-open"));

  // ouvre
  trigger?.classList.add("is-open");
  trigger?.setAttribute("aria-expanded", "true");

  popup.classList.add("is-open");
  popup.setAttribute("aria-hidden", "false");
}

function closePeriodMenu(menuEl) {
  menuEl?.classList.remove("is-open");
  menuEl?.querySelector(".trigger")?.setAttribute("aria-expanded", "false");
  menuEl?.querySelector(".popup")?.setAttribute("aria-hidden", "true");
}

// map pour afficher un label propre dans le dropdown
const PERIOD_LABELS = {
  week: "Last week & pending",
  month: "Last month",
  quarter: "Last quarter",
  year: "Last year",
};

// /* TIME SELECT */
document.addEventListener("click", (e) => {
  const clickedChip = e.target.closest("#timePicker .pp-chip");
  const clickedTrigger = e.target.closest(".period-menu .trigger");
  const clickedItem = e.target.closest(".period-menu .period-item");

  // click chip (week/month/quarter/year) inside timePicker
  if (clickedChip) {
    const key = clickedChip.dataset.period;

    // update inputs
    applyPeriod(key);

    // active state on chips
    document.querySelectorAll("#timePicker .pp-chip").forEach(b => {
      b.classList.toggle("is-active", b.dataset.period === key);
    });

    // optional: sync dropdown label (sans fermer le menu)
    const periodLabelEl = document.querySelector(".period-menu .period-label");
    if (periodLabelEl) periodLabelEl.textContent = clickedChip.textContent.trim();

    return;
  }

  // click item => set label + close
  if (clickedItem) {
    const m = clickedItem.closest(".period-menu");
    const trigger = m?.querySelector(".trigger");
    const popup = m?.querySelector("#" + trigger?.getAttribute("aria-controls")) || m?.querySelector(".popup");
    const label = m?.querySelector(".period-label");

    // update label
    if (label) label.textContent = clickedItem.textContent.trim();

    // move focus out of popup BEFORE hiding it
    trigger?.focus();

    // close
    m?.classList.remove("is-open");
    trigger?.setAttribute("aria-expanded", "false");
    popup?.setAttribute("aria-hidden", "true");

    // update inputs
    applyPeriod(clickedItem.dataset.period);
    
    const key = clickedItem.dataset.period;
    document.querySelectorAll("#timePicker .pp-chip").forEach(b => {
      b.classList.toggle("is-active", b.dataset.period === key);
    });

    // hook custom => open timePicker popup
    if (clickedItem.dataset.period === "custom") {
      openPopupById("timePicker");
      const popup = document.getElementById("timePicker");
      const trigger = document.querySelector('.trigger[aria-controls="timePicker"]');
      if (trigger && popup) openAndPositionPopup(trigger, popup);
    }
    return;
  }

  // click trigger => toggle
  if (clickedTrigger) {
    const m = clickedTrigger.closest(".period-menu");
    const willOpen = !m.classList.contains("is-open");

    // close others
    document.querySelectorAll(".period-menu.is-open").forEach((x) => {
      if (x !== m) {
        const t = x.querySelector(".trigger");
        const p = x.querySelector("#" + t?.getAttribute("aria-controls")) || x.querySelector(".popup");
        x.classList.remove("is-open");
        t?.setAttribute("aria-expanded", "false");
        p?.setAttribute("aria-hidden", "true");
      }
    });

    // toggle current
    const popup = m.querySelector("#" + clickedTrigger.getAttribute("aria-controls")) || m.querySelector(".popup");
    m.classList.toggle("is-open", willOpen);
    clickedTrigger.setAttribute("aria-expanded", String(willOpen));
    popup?.setAttribute("aria-hidden", String(!willOpen));
    return;
  }

  // if click inside timePicker, don't treat it as outside
  if (e.target.closest("#timePicker")) return;

  // click outside => close all
  document.querySelectorAll(".period-menu.is-open").forEach((x) => {
    const t = x.querySelector(".trigger");
    const p = x.querySelector("#" + t?.getAttribute("aria-controls")) || x.querySelector(".popup");
    x.classList.remove("is-open");
    t?.setAttribute("aria-expanded", "false");
    p?.setAttribute("aria-hidden", "true");
  });
});

// esc => close
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;

  document.querySelectorAll(".period-menu.is-open").forEach((x) => {
    const t = x.querySelector(".trigger");
    const p = x.querySelector("#" + t?.getAttribute("aria-controls")) || x.querySelector(".popup");
    x.classList.remove("is-open");
    t?.setAttribute("aria-expanded", "false");
    p?.setAttribute("aria-hidden", "true");
  });
});

// Quick chips inside #timePicker (week/month/quarter/year)
document.addEventListener("click", (e) => {
  const chip = e.target.closest(".pp-chip");
  if (!chip) return;

  // on s'assure que c'est bien DANS timePicker
  if (!chip.closest("#timePicker")) return;

  const key = chip.dataset.period;
  if (!key) return;

  // update inputs
  applyPeriod(key);

  // active state
  document.querySelectorAll("#timePicker .pp-chip").forEach((b) => {
    b.classList.toggle("is-active", b === chip);
  });

  // sync dropdown label
  const periodLabelEl = document.querySelector(".period-menu .period-label");
  if (periodLabelEl) periodLabelEl.textContent = PERIOD_LABELS[key] || chip.textContent.trim();
});

// /* FLOCKS LIST */
function createRowLine(cells, flockName, volume, female, male, vfemale, vmale) {
  const row = document.createElement("div");
  row.className = "row-line";
  row.dataset.flock = flockName;
  row.dataset.volume = volume;
  row.dataset.female = female;
  row.dataset.male = male;
  row.dataset.vfemale = vfemale;
  row.dataset.vmale = vmale;

  cells.forEach((cell) => {
    const span = document.createElement("span");
    span.textContent = String(cell);
    row.appendChild(span);
  });

  return row;
}

function renderRowLines(container, rows) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) return;

  el.innerHTML = "";
  const frag = document.createDocumentFragment();

  rows.forEach((r) => {
    const cells = Array.isArray(r) ? r : [
      r.id,
      r.lot,
      r.age,
      r.volume,
      r.female,
      r.male
    ];
    const flockName = Array.isArray(r) ? r[1] : r.lot;
    const volume    = Array.isArray(r) ? r[3] : r.volume;
    const female    = Array.isArray(r) ? r[4] : r.female;
    const male    = Array.isArray(r) ? r[5] : r.male;
    const vfemale   = Array.isArray(r) ? r[6] : r.vfemale;
    const vmale     = Array.isArray(r) ? r[7] : r.vmale;

    frag.appendChild(createRowLine(cells, flockName, volume, female, male, vfemale, vmale));
  });

  el.appendChild(frag);
}

function setKpiValue(el, value, placeholder = "[select flock]") {
  if (!el) return;

  const isEmpty = !value || value === placeholder;

  el.textContent = isEmpty ? placeholder : value;
  el.classList.toggle("is-empty", isEmpty);
}

function parsePct(pctStr) {
  if (!pctStr) return null;
  // "51,0%" -> 51.0
  const n = parseFloat(String(pctStr).replace("%", "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

function updateHalfCircle(maleStr, femaleStr) {
  const male = parsePct(maleStr);
  const female = parsePct(femaleStr);

  // fallback si une valeur manque
  const m = male ?? (female != null ? 100 - female : 50);
  const f = female ?? (male != null ? 100 - male : 50);

  document.querySelectorAll(".half-circle").forEach((circle) => {
    circle.style.setProperty("--male", m);
    circle.style.setProperty("--female", f);
  });
}

// click update
document.addEventListener("click", (e) => {
  const row = e.target.closest(".row-line");
  if (!row) return;

  const flock = row.dataset.flock;
  const volume = row.dataset.volume;
  const female = row.dataset.female;
  const male = row.dataset.male;
  const vfemale = row.dataset.vfemale;
  const vmale = row.dataset.vmale;

  // On-going flock
  const flockEl = document.getElementById("ongoingFlock");
  setKpiValue(flockEl, flock);

  // Day-old chicks sorted
  document.querySelectorAll(".sorted-volume").forEach((el) => {
    setKpiValue(el, volume);
  });

  // %age female/male
  document.querySelectorAll(".pctFemale").forEach((el) => {
    setKpiValue(el, female);
  });
  document.querySelectorAll(".pctMale").forEach((el) => {
    setKpiValue(el, male);
  });

  updateHalfCircle(male, female);

  // volume female/male
  document.querySelectorAll(".v-female").forEach((el) => {
    el.textContent = vfemale ?? "-";
  });
  document.querySelectorAll(".v-male").forEach((el) => {
    el.textContent = vmale ?? "-";
  });

  // style "selected"
  document.querySelectorAll(".row-line.selected").forEach(r => r.classList.remove("selected"));
  row.classList.add("selected");
});

const rows = [
  { id: 1, lot: "2411CF S51", age: "51 w", volume: "200,000", female: "52,0%", male: "48,0%", vfemale: "102,000", vmale: "98,000" },
  { id: 2, lot: "2411CF S52", age: "52 w", volume: "201,000", female: "50,0%", male: "50,0%", vfemale: "100,500", vmale: "100,500" },
  { id: 3, lot: "2411CF S53", age: "53 w", volume: "203,000", female: "51,0%", male: "49,0%", vfemale: "101,000", vmale: "100,500" },
  { id: 4, lot: "2411CF S54", age: "54 w", volume: "202,000", female: "49,0%", male: "51,0%", vfemale: "100,500", vmale: "101,500" },
  { id: 5, lot: "2411CF S53", age: "53 w", volume: "201,000", female: "50,3%", male: "49,7%", vfemale: "100,800", vmale: "100,200" },
  { id: 6, lot: "2411CF S54", age: "54 w", volume: "202,000", female: "48,0%", male: "52,0%", vfemale: "100,000", vmale: "100,000" },
  { id: 7, lot: "2411CF S55", age: "54 w", volume: "200,000", female: "49,0%", male: "51,0%", vfemale: "100,000", vmale: "100,000" },
  { id: 8, lot: "2411CF S56", age: "54 w", volume: "201,000", female: "49,0%", male: "51,0%", vfemale: "100,500", vmale: "100,500" },
  { id: 9, lot: "2411CF S57", age: "53 w", volume: "198,000", female: "50,0%", male: "50,0%", vfemale: "100,000", vmale: "98,000" },
  { id: 10, lot: "2411CF S58", age: "54 w", volume: "200,000", female: "49,0%", male: "51,0%", vfemale: "100,000", vmale: "100,000" }
];

renderRowLines("#flocksTable", rows);

// /* TOGGLE GRAPHS */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".view-btn");
  if (!btn) return;

  const card = btn.closest(".card") || document; // si ta card a une classe .card
  const viewsWrap = card.querySelector(".graph-views");
  if (!viewsWrap) return;

  const view = btn.dataset.view;

  // active button
  card.querySelectorAll(".view-btn").forEach(b => {
    const active = b === btn;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-selected", String(active));
  });

  // show/hide views
  viewsWrap.querySelectorAll(".graph-view").forEach(v => {
    const isTarget = v.dataset.view === view;
    v.hidden = !isTarget;
  });

  viewsWrap.dataset.activeView = view;
});