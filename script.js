const DESKTOP = "(min-width: 1050px)";
const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ------------------------------------------------ Бургер-меню */

const burger = document.querySelector(".burger");
const menu = document.getElementById("menu");

let menuOpen = false;

function setMenu(open) {
  menuOpen = open;
  menu.dataset.open = String(open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  // без этого страница продолжает скроллиться под оверлеем
  document.body.style.overflow = open ? "hidden" : "";

  if (open) {
    menu.querySelector("a").focus();
  } else {
    burger.focus();
  }
}

burger.addEventListener("click", () => setMenu(!menuOpen));

menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) setMenu(false);
});

// на десктопе бургер скрыт - если окно развернули при открытом меню, закрываем
window.matchMedia(DESKTOP).addEventListener("change", (e) => {
  if (e.matches && menuOpen) setMenu(false);
});

/* ------------------------------------------------ Счётчик Discord */

const GUILD_ID = "1546010684083666964";
const heroSub = document.querySelector("[data-hero-sub]");

// Русские окончания: 1 участник, 3 участника, 5 участников
function plural(n) {
  const tail = n % 100;
  if (tail >= 11 && tail <= 19) return "участников";

  switch (n % 10) {
    case 1: return "участник";
    case 2: case 3: case 4: return "участника";
    default: return "участников";
  }
}

async function loadDiscordCount() {
  try {
    const res = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`);
    if (!res.ok) return;

    const data = await res.json();
    // widget.json отдаёт только присутствие. Если Discord начнёт отдавать
    // общее число участников - берём его, иначе честно пишем «онлайн».
    const total = data.member_count;
    const online = data.presence_count ?? data.members?.length;

    let text;
    if (total) {
      text = `Идёт набор игроков. В Discord уже ${total} ${plural(total)}. Там новости и дата открытия.`;
    } else if (online) {
      text = `Идёт набор игроков. Сейчас в Discord ${online} онлайн. Там новости и дата открытия.`;
    } else {
      return;
    }

    heroSub.textContent = text;
  } catch {
    // виджет выключен, нет сети или файл открыт с блокировкой запросов -
    // текст без числа остаётся вёрсткой из HTML, это не поломка
  }
}

loadDiscordCount();

/* ------------------------------------------------ FAQ */

const faq = document.querySelector(".faq");

// Открыт максимум один ответ: девять раскрытых блоков превращают
// секцию в простынёю. Сначала гасим все ряды, потом поднимаем нужный -
// так повторный клик по той же кнопке закрывает её, а не ловит гонку.
faq.addEventListener("click", (e) => {
  const btn = e.target.closest(".faq-btn");
  if (!btn) return;

  const row = btn.closest(".faq-row");
  const open = row.dataset.open === "true";

  faq.querySelectorAll(".faq-row").forEach((r) => {
    r.dataset.open = "false";
    r.querySelector(".faq-btn").setAttribute("aria-expanded", "false");
  });

  row.dataset.open = String(!open);
  btn.setAttribute("aria-expanded", String(!open));
});

/* ------------------------------------------------ Появление секций */

const targets = document.querySelectorAll(".rv");

function showAll() {
  targets.forEach((el) => { el.dataset.in = "true"; });
}

if (!("IntersectionObserver" in window) || noMotion.matches) {
  showAll();
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.in = "true";
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  targets.forEach((el) => io.observe(el));
}