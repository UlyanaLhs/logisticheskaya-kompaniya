# NEXORA LOGISTICS — Premium International Freight & Supply Chain Platform

> **Moving Business Forward.**  
> A high-performance, enterprise-grade B2B website for international freight forwarding, multimodal transportation coordination, and supply chain visibility. Built strictly with **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. Fully GitHub Ready and optimized for deployment on GitHub Pages.

---

## 1. Project Overview & Brand Identity

**NEXORA LOGISTICS** positions itself as a modern, technology-enabled logistics partner bridging the gap between heavy industrial transportation corridors and digital supply chain visibility.

- **Primary Colors:** Midnight Navy (`#09101A` / `#101C2C`), Deep Slate (`#1A283B` / `#20324A`), Signal Blue (`#2878F0`), and Accent Cyan (`#38BDF8`).
- **Aesthetic Direction:** Clean Enterprise / Dense Operational Swiss. High contrast, precise typography, structured data cards, and zero generic AI tropes.
- **Accessibility:** Built to comply with WCAG 2.1 AA contrast standards, keyboard navigation (`:focus-visible`), skip links, and `prefers-reduced-motion` compliance.

---

## 2. Directory Structure

```text
├── index.html                  # Lead-generation homepage with hero, services, process & preview
├── services.html               # Detailed service breakdown (Road, Air, Ocean, Rail, Warehousing, Customs)
├── industries.html             # Sector solutions (Manufacturing, Automotive, Tech, Retail, Healthcare)
├── solutions.html              # Strategic capabilities (Multimodal, Time-Critical, Customs, Green Corridors)
├── about.html                  # Corporate philosophy, operational discipline, and core pillars
├── quote.html                  # Freight quotation system with real-time CBM calculator & demo export
├── tracking.html               # Shipment tracking portal with interactive demo records & telematics
├── contact.html                # Regional dispatch desks, inquiry form, and interactive logistics FAQ
├── privacy.html                # Corporate data protection and quotation privacy policy
├── .nojekyll                   # Bypasses Jekyll on GitHub Pages to serve clean static files
├── README.md                   # Complete architectural, deployment, and integration documentation
└── assets/
    ├── css/
    │   └── styles.css          # Master stylesheet with design tokens, responsive grid & animations
    ├── js/
    │   ├── main.js             # Mobile nav, header scroll state, intersection observer & modals
    │   ├── quote.js            # Quotation validation, dimensional calculation, URL prefill & JSON export
    │   ├── tracking.js         # Interactive tracking database, milestone renderer & error handler
    │   └── assistant.js        # Floating AI Logistics Assistant widget with contextual offline intelligence
    └── images/
        ├── logo.svg            # Scalable vector brand wordmark & symbol
        ├── favicon.svg         # High-resolution vector favicon
        ├── hero-truck.jpg      # Commercial dusk highway freight semi-truck
        ├── service-air.jpg     # International cargo aircraft loading on apron at dawn
        ├── service-ocean.jpg   # Container ship docking at deepwater seaport
        ├── service-rail.jpg    # Electric container rail corridor freight train
        ├── service-warehouse.jpg # High-bay modern automated distribution facility
        ├── service-customs.jpg # Port customs cargo documentation and inspection
        ├── service-supplychain.jpg # High-tech operations control room
        ├── about-facility.jpg  # Logistics terminal architecture
        ├── about-team.jpg      # Operations specialist reviewing flight manifest
        ├── industry-manufacturing.jpg # Heavy industrial machinery freight
        ├── industry-automotive.jpg    # Automotive components and spare parts
        ├── industry-technology.jpg    # High-value electronics freight
        ├── industry-retail.jpg        # Retail and e-commerce packaging fulfillment
        └── industry-healthcare.jpg    # Healthcare diagnostic equipment (ambient)
```

---

## 3. Local Development Instructions

The website requires **zero build tools, bundlers, or npm installations**. All assets use strict relative paths (`./assets/...`).

### Running Locally with Python:
```bash
# Python 3
python -m http.server 8000
```
Open your browser at: `http://localhost:8000`

### Running with VS Code:
Right-click on `index.html` and choose **"Open with Live Server"**.

### Running with Node.js (Optional):
```bash
npx serve .
```

---

## 4. GitHub Pages Deployment Instructions

This repository is engineered to work directly out of the box on GitHub Pages, including when hosted under a repository subpath (e.g. `https://<username>.github.io/<repo-name>/`).

1. **Initialize Git & Commit:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: NEXORA LOGISTICS GitHub Ready site"
   ```

2. **Push to GitHub:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - In your repository, click **Settings** → **Pages** (under "Code and automation").
   - Under **Build and deployment > Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and root `/` folder.
   - Click **Save**.
   - Your site will be published at `https://<your-username>.github.io/<your-repo-name>/`.
   - The included `.nojekyll` file ensures GitHub Pages serves all static assets without modification.

---

## 5. Production Integration Guides

### A. Connecting a Real Freight Quotation Backend
In `assets/js/quote.js`, the form currently captures inputs, validates them client-side, and generates a formatted reference modal with a local JSON download option (`NXQ-YYYYMMDD-XXXX`).

To send submissions to an actual email or CRM endpoint:
1. **Using Formspree / Webhook:**
   Change `<form id="freight-quote-form">` action to your endpoint:
   ```html
   <form id="freight-quote-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
2. **Using a Secure REST API / n8n Workflow:**
   In `assets/js/quote.js`, update the submit handler to POST JSON payload:
   ```javascript
   fetch('https://api.yourdomain.com/v1/quotes', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(data)
   })
   .then(res => res.json())
   .then(result => renderQuoteModal(result.quote_id, data))
   .catch(err => window.NEXORA.showToast('Network error submitting quote', 'error'));
   ```

---

### B. Integrating Live Shipment Tracking (Carrier APIs)
In `assets/js/tracking.js`, the tracking portal operates in **Demonstration Mode** with three pre-configured active shipments:
- `NEX-849201`: Ocean & Rail Multimodal (Rotterdam → Munich)
- `NEX-104928`: Priority Air Cargo (Chicago ORD → Frankfurt FRA)
- `NEX-552190`: Full Truckload Road Freight (Lyon → Madrid)

#### Production Architecture:
1. **Never expose carrier API keys in client-side JavaScript.**
2. Set up a secure backend proxy (Node.js, Go, or Python) connecting to:
   - **Project44 / FourKites / Shippeo REST APIs**
   - **Ocean Carrier AIS feeds**
   - **EDI 214 Shipment Status transactions**
3. Update `executeTrackingLookup(code)` in `assets/js/tracking.js` to call your proxy:
   ```javascript
   async function executeTrackingLookup(code) {
     const res = await fetch(`/api/tracking?ref=${encodeURIComponent(code)}`);
     if (res.ok) {
       const shipment = await res.json();
       renderShipmentDetails(shipment, resultsContainer);
     } else {
       renderUnknownShipment(code, resultsContainer);
     }
   }
   ```

---

### C. Enabling Live AI Logistics Assistant
The **NEXORA AI Assistant** floating widget (`assets/js/assistant.js`) operates offline with a contextual rule engine capable of explaining services, transport modes, CBM calculations, Incoterms, and prefilling quote forms.

To connect a live Large Language Model (e.g., Google Gemini, Anthropic Claude, OpenAI, or an n8n AI Agent):
1. Create a serverless or backend endpoint: `POST /api/chat`.
2. Keep all API keys on the server.
3. In `assets/js/assistant.js`, replace `simulateBotResponse` with a streaming or fetch request:
   ```javascript
   async function sendToBackendAI(userMessage) {
     const response = await fetch('/api/chat', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ message: userMessage, history: chatHistory })
     });
     const data = await response.json();
     appendMessage('bot', data.reply, data.suggestions, data.actionButton);
   }
   ```

---

## 6. Demonstration Content Disclosure

Before launching for a live corporate entity, ensure the following sample elements are replaced with verified business records:
- **Phone numbers & sample emails:** Replace `+31 (0) 10 592 0180` and `@nexora-logistics.demo`.
- **Sample Desk Addresses:** Update Rotterdam, Chicago, and Singapore addresses with verified corporate facilities.
- **Service Certifications:** Add official IATA, ISO 9001, AEO, or local customs brokerage license numbers where legally held.
- **Demonstration Badges:** Remove the `.demo-badge` UI indicators once live APIs and verified company data are connected.

---

## 7. Quality Assurance Verification Summary

| Category | Verification Performed | Status |
| :--- | :--- | :---: |
| **All Pages & Internal Links** | 9 HTML pages linked with clean relative paths, zero 404s | Pass |
| **Responsive Layouts** | Tested for mobile (360px–390px), tablet (768px), desktop (1440px+) | Pass |
| **Quote Form Validation** | Email regex, required fields, inline error banners, CBM estimator | Pass |
| **Sample Tracking Console** | Tested `NEX-849201`, `NEX-104928`, `NEX-552190`, and unknown code | Pass |
| **AI Logistics Assistant** | Widget toggle, suggestion pills, modal triggers, URL prefilling | Pass |
| **Visual Assets** | High-res commercial logistics photos, custom SVG logo & favicon | Pass |
| **Accessibility (a11y)** | Skip link, `:focus-visible` styling, ARIA roles, contrast ratios | Pass |
| **GitHub Deployment** | `.nojekyll` present, relative paths tested, zero machine-specific paths | Pass |
