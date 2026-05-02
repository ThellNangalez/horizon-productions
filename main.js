const root = document.documentElement;

const games = [
  {
    placeId: "140472728510165",
    fallbackName: "Anime Ultra X",
    url: "https://www.roblox.com/games/140472728510165/Anime-Ultra-X"
  },
  {
    placeId: "90719247686306",
    fallbackName: "Swim For Brainrot",
    url: "https://www.roblox.com/games/90719247686306/Swim-For-Brainrot"
  },
  {
    placeId: "89199115862748",
    fallbackName: "Launch Rocket for Brainrots",
    url: "https://www.roblox.com/games/89199115862748/Launch-Rocket-for-Brainrots"
  }
];

document.addEventListener("mousemove", (event) => {
  root.style.setProperty("--x", `${event.clientX}px`);
  root.style.setProperty("--y", `${event.clientY}px`);
});

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

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("active");
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function formatNumber(number) {
  if (!Number.isFinite(number)) return "0";

  return new Intl.NumberFormat("en-US", {
    notation: number >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(number);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed request: ${url}`);
  return response.json();
}

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

async function loadRobloxGames() {
  const gamesGrid = document.getElementById("gamesGrid");
  const totalVisitsElement = document.getElementById("totalVisits");
  const totalPlayingElement = document.getElementById("totalPlaying");

  if (!gamesGrid) return;

  try {
    const gamesWithUniverses = await getUniverseIds();

    const universeIds = gamesWithUniverses
      .map((game) => game.universeId)
      .filter(Boolean)
      .join(",");

    const gameInfo = await fetchJson(
      `https://games.roproxy.com/v1/games?universeIds=${universeIds}`
    );

    const thumbnailInfo = await fetchJson(
      `https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeIds}&size=512x512&format=Png&isCircular=false`
    );

    const thumbnails = {};

    thumbnailInfo.data.forEach((thumbnail) => {
      thumbnails[thumbnail.targetId] = thumbnail.imageUrl;
    });

    let totalVisits = 0;
    let totalPlaying = 0;

    gamesGrid.innerHTML = "";

    gameInfo.data.forEach((info) => {
      const originalGame = gamesWithUniverses.find(
        (game) => String(game.universeId) === String(info.id)
      );

      totalVisits += info.visits || 0;
      totalPlaying += info.playing || 0;

      const thumbnail = thumbnails[info.id];

      const card = document.createElement("article");
      card.className = "card-glow rounded-[1.8rem] border border-white/10 bg-white/[.07] p-5 backdrop-blur-xl";

      card.innerHTML = `
        ${
          thumbnail
            ? `<img class="h-56 w-full rounded-[1.4rem] object-cover" src="${thumbnail}" alt="${info.name} thumbnail">`
            : `<div class="flex h-56 items-center justify-center rounded-[1.4rem] bg-gradient-to-r from-horizonOrange to-horizonPurple text-2xl font-black">${info.name}</div>`
        }

        <h3 class="mt-6 text-2xl font-black">${info.name}</h3>
        <p class="mt-2 line-clamp-3 min-h-[72px] text-white/60">${info.description || "A Horizon Productions Roblox experience."}</p>

        <div class="mt-5 flex flex-wrap gap-2">
          <span class="rounded-full bg-white/10 px-3 py-2 text-sm font-black">${formatNumber(info.visits || 0)} visits</span>
          <span class="rounded-full bg-white/10 px-3 py-2 text-sm font-black">${formatNumber(info.playing || 0)} playing</span>
        </div>

        <button data-url="${originalGame?.url || "#"}" class="glow-button mt-5 rounded-full bg-gradient-to-r from-horizonOrange to-horizonPurple px-5 py-3 font-black">
          Play Game
        </button>
      `;

      gamesGrid.appendChild(card);
    });

    if (totalVisitsElement) totalVisitsElement.textContent = formatNumber(totalVisits);
    if (totalPlayingElement) totalPlayingElement.textContent = formatNumber(totalPlaying);

    document.querySelectorAll("[data-url]").forEach((button) => {
      button.addEventListener("click", () => window.open(button.dataset.url, "_blank"));
    });

    setupGlowCards();
  } catch (error) {
    console.warn("Roblox API failed:", error);

    gamesGrid.innerHTML = games
      .map(
        (game) => `
        <article class="card-glow rounded-[1.8rem] border border-white/10 bg-white/[.07] p-5 backdrop-blur-xl">
          <div class="flex h-56 items-center justify-center rounded-[1.4rem] bg-gradient-to-r from-horizonOrange to-horizonPurple p-6 text-center text-2xl font-black">
            ${game.fallbackName}
          </div>

          <h3 class="mt-6 text-2xl font-black">${game.fallbackName}</h3>
          <p class="mt-2 text-white/60">Roblox live data could not be loaded right now.</p>

          <div class="mt-5 flex flex-wrap gap-2">
            <span class="rounded-full bg-white/10 px-3 py-2 text-sm font-black">Stats unavailable</span>
          </div>

          <button data-url="${game.url}" class="glow-button mt-5 rounded-full bg-gradient-to-r from-horizonOrange to-horizonPurple px-5 py-3 font-black">
            Play Game
          </button>
        </article>
      `
      )
      .join("");

    if (totalVisitsElement) totalVisitsElement.textContent = "Unavailable";
    if (totalPlayingElement) totalPlayingElement.textContent = "Unavailable";

    document.querySelectorAll("[data-url]").forEach((button) => {
      button.addEventListener("click", () => window.open(button.dataset.url, "_blank"));
    });

    setupGlowCards();
  }
}

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const reason = document.getElementById("reason").value;
    const message = document.getElementById("message").value;

    const subject = encodeURIComponent(`Horizon Productions Inquiry: ${reason}`);
    const body = encodeURIComponent(
      `Name / Company: ${name}\n` +
      `Email: ${email}\n` +
      `Inquiry Type: ${reason}\n\n` +
      `Message:\n${message}`
    );

    window.location.href = `mailto:tbg.dev.alt@gmai.com?subject=${subject}&body=${body}`;
  });
}

loadRobloxGames();