const root = document.documentElement;

/* =========================
   ROBLOX GAME CONFIG
========================= */
const games = [
  {
    placeId: "140472728510165",
    fallbackName: "Anime Ultra X",
    url: "https://www.roblox.com/games/140472728510165/Anime-Ultra-X"
  },
  {
    placeId: "89199115862748",
    fallbackName: "Launch Rocket for Brainrots",
    url: "https://www.roblox.com/games/89199115862748/Launch-Rocket-for-Brainrots"
  }
];

/* =========================
   BACKGROUND MOUSE EFFECT
========================= */
document.addEventListener("mousemove", (event) => {
  root.style.setProperty("--x", `${event.clientX}px`);
  root.style.setProperty("--y", `${event.clientY}px`);
});

/* =========================
   GLOW EFFECT
========================= */
function setupGlowCards() {
  document.querySelectorAll(".card-glow").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

setupGlowCards();

/* =========================
   REVEAL ANIMATION
========================= */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => {
  revealObserver.observe(el);
});

/* =========================
   NUMBER FORMATTER
========================= */
function formatNumber(number) {
  if (!Number.isFinite(number)) return "0";

  return new Intl.NumberFormat("en-US", {
    notation: number >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(number);
}

/* =========================
   FETCH HELPER
========================= */
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API failed");
  return res.json();
}

/* =========================
   GET UNIVERSE IDS
========================= */
async function getUniverseIds() {
  const results = [];

  for (const game of games) {
    const data = await fetchJson(
      `https://apis.roproxy.com/universes/v1/places/${game.placeId}/universe`
    );

    results.push({
      ...game,
      universeId: data.universeId
    });
  }

  return results;
}

/* =========================
   LOAD ROBLOX DATA
========================= */
async function loadRobloxGames() {
  const gamesGrid = document.getElementById("gamesGrid");
  const totalVisitsElement = document.getElementById("totalVisits");
  const totalPlayingElement = document.getElementById("totalPlaying");

  if (!gamesGrid) return;

  try {
    const gamesWithUniverses = await getUniverseIds();

    const universeIds = gamesWithUniverses
      .map((g) => g.universeId)
      .filter(Boolean)
      .join(",");

    const gameInfo = await fetchJson(
      `https://games.roproxy.com/v1/games?universeIds=${universeIds}`
    );

    const thumbnails = await fetchJson(
      `https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeIds}&size=512x512&format=Png`
    );

    const thumbMap = {};
    thumbnails.data.forEach((t) => {
      thumbMap[t.targetId] = t.imageUrl;
    });

    let totalVisits = 0;
    let totalPlaying = 0;

    gamesGrid.innerHTML = "";

    gameInfo.data.forEach((info) => {
      const game = gamesWithUniverses.find(
        (g) => String(g.universeId) === String(info.id)
      );

      totalVisits += info.visits || 0;
      totalPlaying += info.playing || 0;

      const thumbnail = thumbMap[info.id];

      const card = document.createElement("article");
      card.className = "card-glow rounded-[1.8rem] border border-white/10 bg-white/[.07] p-5 backdrop-blur-xl";

      card.innerHTML = `
        ${
          thumbnail
            ? `<img class="h-56 w-full rounded-[1.4rem] object-cover" src="${thumbnail}">`
            : `<div class="flex h-56 items-center justify-center rounded-[1.4rem] bg-gradient-to-r from-orange-500 to-purple-600 text-2xl font-black">${info.name}</div>`
        }

        <h3 class="mt-6 text-2xl font-black">${info.name}</h3>
        <p class="mt-2 text-white/60">${info.description || "Roblox experience."}</p>

        <div class="mt-5 flex gap-2 flex-wrap">
          <span class="bg-white/10 px-3 py-2 rounded-full text-sm font-black">
            ${formatNumber(info.visits)} visits
          </span>
          <span class="bg-white/10 px-3 py-2 rounded-full text-sm font-black">
            ${formatNumber(info.playing)} playing
          </span>
        </div>

        <button data-url="${game?.url}" class="mt-5 px-5 py-3 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 font-black">
          Play Game
        </button>
      `;

      gamesGrid.appendChild(card);
    });

    if (totalVisitsElement) totalVisitsElement.textContent = formatNumber(totalVisits);
    if (totalPlayingElement) totalPlayingElement.textContent = formatNumber(totalPlaying);

    document.querySelectorAll("[data-url]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.open(btn.dataset.url, "_blank");
      });
    });

    setupGlowCards();

  } catch (err) {
    console.warn("Roblox API failed:", err);
  }
}

/* =========================
   CONTACT FORM (FIXED)
========================= */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const reason = document.getElementById("reason").value;
    const message = document.getElementById("message").value.trim();

    const subject = encodeURIComponent(`Horizon Inquiry: ${reason}`);

    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nType: ${reason}\n\nMessage:\n${message}`
    );

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=tbg.dev.alt@gmail.com&su=${subject}&body=${body}`,
      "_blank"
    );

    contactForm.reset();
  });
}

/* =========================
   INIT
========================= */
loadRobloxGames();