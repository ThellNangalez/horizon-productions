"use strict";

const HUB_INVITE = "https://discord.gg/XdaetbyZF7";

/*
  JOBS ARE CURRENTLY FRONT-END DATA.
  When the Discord bot/API is added later, replace this array with a fetch()
  to a trusted backend endpoint. Do NOT expose a Discord bot token in browser JS.
*/
const JOBS = [
  {
    id: "game-designer",
    title: "Game Designer",
    department: "Design",
    type: "Project-based",
    location: "Remote",
    summary: "Design progression, systems, loops, and player-facing content for upcoming Roblox projects.",
    requirements: ["Roblox design experience", "Strong written documentation", "Comfort working with engineers and artists"],
    featured: true
  },
  {
    id: "roblox-engineer",
    title: "Roblox Engineer",
    department: "Engineering",
    type: "Project-based",
    location: "Remote",
    summary: "Build reliable gameplay systems, tools, interfaces, and production-ready Roblox infrastructure.",
    requirements: ["Strong Luau fundamentals", "Experience shipping Roblox systems", "Clean collaboration and debugging habits"],
    featured: true
  },
  {
    id: "vfx-artist",
    title: "VFX Artist",
    department: "Art",
    type: "Project-based",
    location: "Remote",
    summary: "Create readable, performant combat and environmental VFX that support the visual identity of each project.",
    requirements: ["Roblox VFX portfolio", "Strong timing and readability", "Performance awareness"],
    featured: true
  },
  {
    id: "animator",
    title: "Animator",
    department: "Animation",
    type: "Project-based",
    location: "Remote",
    summary: "Produce character, combat, and gameplay animation with strong posing, timing, and implementation awareness.",
    requirements: ["Roblox animation portfolio", "Strong action timing", "Ability to work from references and direction"]
  },
  {
    id: "modeler",
    title: "3D Modeler",
    department: "3D",
    type: "Project-based",
    location: "Remote",
    summary: "Create optimized props, environments, and gameplay assets that fit established project art direction.",
    requirements: ["Strong 3D portfolio", "Optimization knowledge", "Consistent style matching"]
  },
  {
    id: "ui-artist",
    title: "UI Artist",
    department: "UI/UX",
    type: "Project-based",
    location: "Remote",
    summary: "Design polished interfaces with strong hierarchy, game readability, and a premium visual finish.",
    requirements: ["UI portfolio", "Strong hierarchy and composition", "Roblox implementation awareness"]
  }
];

/* ---------------------------
   MOBILE NAVIGATION
---------------------------- */

const menuButton = document.getElementById("menuButton");
const menuClose = document.getElementById("menuClose");
const mobileMenu = document.getElementById("mobileMenu");

function setMenu(open) {
  if (!mobileMenu || !menuButton) return;

  mobileMenu.classList.toggle("open", open);
  mobileMenu.setAttribute("aria-hidden", String(!open));
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
}

menuButton?.addEventListener("click", () => {
  setMenu(!mobileMenu?.classList.contains("open"));
});

menuClose?.addEventListener("click", () => setMenu(false));

mobileMenu?.addEventListener("click", (event) => {
  if (event.target === mobileMenu) setMenu(false);
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
    closeJobModal();
  }
});

/* ---------------------------
   REVEAL
---------------------------- */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("active");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px" }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("active"));
}

/* ---------------------------
   HELPERS
---------------------------- */

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setFeedback(element, message, type = "") {
  if (!element) return;

  element.textContent = message;
  element.className = `form-feedback visible ${type}`.trim();
}

/* ---------------------------
   HOME FEATURED JOBS
---------------------------- */

const featuredJobs = document.getElementById("featuredJobs");

if (featuredJobs) {
  const featured = JOBS.filter((job) => job.featured).slice(0, 3);

  featuredJobs.innerHTML = featured.map((job) => `
    <article class="job-preview">
      <div>
        <h3>${escapeHtml(job.title)}</h3>
        <p>${escapeHtml(job.department)} · ${escapeHtml(job.location)}</p>
      </div>
      <span class="job-pill">${escapeHtml(job.type)}</span>
      <a href="jobs.html?role=${encodeURIComponent(job.id)}">View role ↗</a>
    </article>
  `).join("");
}

/* ---------------------------
   JOB LIST
---------------------------- */

const jobsGrid = document.getElementById("jobsGrid");
const jobFilters = document.getElementById("jobFilters");
const jobCount = document.getElementById("jobCount");
const emptyJobs = document.getElementById("emptyJobs");

let activeDepartment = "All";

function renderJobFilters() {
  if (!jobFilters) return;

  const departments = ["All", ...new Set(JOBS.map((job) => job.department))];

  jobFilters.innerHTML = departments.map((department) => `
    <button
      type="button"
      class="filter-button ${department === activeDepartment ? "active" : ""}"
      data-filter="${escapeHtml(department)}"
    >
      ${escapeHtml(department)}
    </button>
  `).join("");

  jobFilters.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeDepartment = button.dataset.filter || "All";
      renderJobFilters();
      renderJobs();
    });
  });
}

function renderJobs() {
  if (!jobsGrid) return;

  const filtered = activeDepartment === "All"
    ? JOBS
    : JOBS.filter((job) => job.department === activeDepartment);

  if (jobCount) {
    jobCount.textContent = `${filtered.length} open ${filtered.length === 1 ? "role" : "roles"}`;
  }

  if (emptyJobs) {
    emptyJobs.hidden = filtered.length !== 0;
  }

  jobsGrid.innerHTML = filtered.map((job) => `
    <article class="job-card reveal active">
      <div class="job-card-top">
        <div>
          <span class="department">${escapeHtml(job.department)}</span>
          <h3>${escapeHtml(job.title)}</h3>
        </div>
        <span class="job-pill">${escapeHtml(job.type)}</span>
      </div>

      <p>${escapeHtml(job.summary)}</p>

      <div class="job-card-footer">
        <div class="job-meta">
          <span class="job-pill">${escapeHtml(job.location)}</span>
          ${job.featured ? `<span class="job-pill">Priority</span>` : ""}
        </div>

        <button class="apply-button" type="button" data-apply="${escapeHtml(job.id)}">
          Apply ↗
        </button>
      </div>
    </article>
  `).join("");

  jobsGrid.querySelectorAll("[data-apply]").forEach((button) => {
    button.addEventListener("click", () => openJobModal(button.dataset.apply));
  });
}

renderJobFilters();
renderJobs();

/* ---------------------------
   JOB APPLICATION MODAL
---------------------------- */

const jobModal = document.getElementById("jobModal");
const hubConfirmed = document.getElementById("hubConfirmed");
const applicationForm = document.getElementById("jobApplicationForm");
const applicationFeedback = document.getElementById("applicationFeedback");

function openJobModal(jobId) {
  if (!jobModal) return;

  const job = JOBS.find((item) => item.id === jobId);
  if (!job) return;

  const title = document.getElementById("applicationTitle");
  const department = document.getElementById("applicationDepartment");
  const type = document.getElementById("applicationType");
  const intro = document.getElementById("applicationIntro");
  const roleInput = document.getElementById("jobRole");

  if (title) title.textContent = `Apply — ${job.title}`;
  if (department) department.textContent = job.department;
  if (type) type.textContent = `${job.type} · ${job.location}`;
  if (intro) intro.textContent = job.summary;
  if (roleInput) roleInput.value = job.title;

  if (hubConfirmed) hubConfirmed.checked = false;
  if (applicationForm) applicationForm.hidden = true;
  if (applicationFeedback) applicationFeedback.className = "form-feedback";

  jobModal.classList.add("open");
  jobModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeJobModal() {
  if (!jobModal?.classList.contains("open")) return;

  jobModal.classList.remove("open");
  jobModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

jobModal?.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", closeJobModal);
});

hubConfirmed?.addEventListener("change", () => {
  if (!applicationForm) return;
  applicationForm.hidden = !hubConfirmed.checked;
});

applicationForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!hubConfirmed?.checked) {
    setFeedback(applicationFeedback, "Join Horizon Hub and confirm membership before applying.", "error");
    return;
  }

  const role = document.getElementById("jobRole")?.value.trim() || "";
  const discord = document.getElementById("appDiscord")?.value.trim() || "";
  const roblox = document.getElementById("appRoblox")?.value.trim() || "";
  const portfolio = document.getElementById("appPortfolio")?.value.trim() || "";
  const experience = document.getElementById("appExperience")?.value.trim() || "";
  const why = document.getElementById("appWhy")?.value.trim() || "";
  const availability = document.getElementById("appAvailability")?.value.trim() || "";

  if (!role || !discord || !roblox || !portfolio || !experience || !why || !availability) {
    setFeedback(applicationFeedback, "Complete every field before preparing your application.", "error");
    return;
  }

  const application = [
    "HORIZON PRODUCTIONS — JOB APPLICATION",
    "",
    `Role: ${role}`,
    `Discord: ${discord}`,
    `Roblox: ${roblox}`,
    `Portfolio: ${portfolio}`,
    `Availability: ${availability}`,
    "",
    "RELEVANT EXPERIENCE",
    experience,
    "",
    "WHY HORIZON",
    why
  ].join("\n");

  try {
    await navigator.clipboard.writeText(application);
    setFeedback(
      applicationFeedback,
      "Application copied. Open Horizon Hub and paste it into the recruitment flow. Automated tickets will be added later.",
      "success"
    );
  } catch {
    setFeedback(
      applicationFeedback,
      "Your browser blocked clipboard access. Copy the application manually from the fields, then continue in Horizon Hub.",
      "error"
    );
  }

  setTimeout(() => {
    window.open(HUB_INVITE, "_blank", "noopener,noreferrer");
  }, 450);
});

/* Auto-open role from ?role= */
if (jobsGrid) {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role");

  if (role && JOBS.some((job) => job.id === role)) {
    setTimeout(() => openJobModal(role), 350);
  }
}

/* ---------------------------
   BUSINESS CONTACT FORM
---------------------------- */

const contactForm = document.getElementById("contactForm");
const contactFeedback = document.getElementById("contactFeedback");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("contactName")?.value.trim() || "";
  const email = document.getElementById("contactEmail")?.value.trim() || "";
  const reason = document.getElementById("contactReason")?.value || "";
  const message = document.getElementById("contactMessage")?.value.trim() || "";

  if (name.length < 2 || !email || !reason || message.length < 10) {
    setFeedback(contactFeedback, "Complete all fields before preparing your email.", "error");
    return;
  }

  const subject = encodeURIComponent(`Horizon Productions — ${reason}`);
  const body = encodeURIComponent([
    "HORIZON PRODUCTIONS — BUSINESS INQUIRY",
    "",
    `Name / Company: ${name}`,
    `Reply Email: ${email}`,
    `Inquiry Type: ${reason}`,
    "",
    "MESSAGE",
    message
  ].join("\n"));

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=tbg.dev.alt@gmail.com` +
    `&su=${subject}` +
    `&body=${body}`;

  setFeedback(contactFeedback, "Opening Gmail with your inquiry prepared.", "success");

  const popup = window.open(gmailUrl, "_blank", "noopener,noreferrer");

  if (!popup) {
    window.location.href = `mailto:tbg.dev.alt@gmail.com?subject=${subject}&body=${body}`;
  }
});
