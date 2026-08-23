Horizon Productions redesign

Files:
- index.html
- jobs.html
- contact.html
- style.css
- main.js

Keep your existing Assets folder next to these files.

Required existing assets:
Assets/Logo.png
Assets/favicon.png
Assets/CEO_Image.jpg
Assets/CFO_Image.jpg
Assets/Engineer_Image.jpg
Assets/KonImage.png
Assets/PlatImage.jpeg

Important:
- The Discord bot/ticket integration is intentionally NOT implemented yet.
- Job posts currently live in the JOBS array at the top of main.js.
- Never put a Discord bot token in main.js or any browser-visible file.
- Later, job listings should be loaded from a trusted backend API controlled by the Discord bot/server.

2026 visual upgrade:
- All public HZN labels changed to HRZN.
- Interactive background uses tsParticles v4 slim via jsDelivr.
- Hero planet uses Three.js 0.185.1 via jsDelivr and lives in planet.js.
- The planet is procedural: no external texture/image assets are required.
- Keep planet.js at the repository root beside main.js.
