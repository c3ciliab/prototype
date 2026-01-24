// /* POPUP TOGGLE */
document.addEventListener("click", (e) => {
  const trigger = e.target.closest(".trigger");
  const allTriggers = document.querySelectorAll(".trigger");

  // click on trigger => toggle and close others
  if (trigger) {
    allTriggers.forEach(t => { if (t !== trigger) t.classList.remove("is-open"); });
    trigger.classList.toggle("is-open");
    return;
  }

  // click outside => close everything
  allTriggers.forEach(t => t.classList.remove("is-open"));
});

// "esc" => close everything
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".trigger.is-open")
      .forEach(t => t.classList.remove("is-open"));
  }
});

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
  const year = now.getFullYear();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mon = months[now.getMonth()];
  
  return `${day}, ${mon} ${year}`;
  // JJ/MM
  //const month = pad2(now.getMonth() + 1);
  //return `${day}/${month}`;
}

function tick() {
  const now = new Date();

  const clockEl = document.getElementById("clock");
  if (clockEl) clockEl.textContent = formatClock(now);

  const dayEl = document.getElementById("dayOnly");
  if (dayEl) dayEl.textContent = formatDay(now);
}

tick();
setInterval(tick, 1000);

// /* CLOCK */
