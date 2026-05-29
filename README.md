# WA Bot Real Estate (Vue.js 3 + Vite + TypeScript)

A modern, high-performance web application designed for real estate agencies, featuring a public guest catalog, an interactive mortgage simulator, and a comprehensive admin control panel integrated with a WhatsApp automation bot.

---

## 🚀 Tech Stack & Libraries

This project is built using a modern frontend architecture with the following core tools:

*   **Core Framework:** [Vue.js 3](https://vuejs.org/) (Composition API, `<script setup>`)
*   **Build Tool:** [Vite 7](https://vite.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling & UI:** 
    *   [Tailwind CSS v4](https://tailwindcss.com/) (using the new `@tailwindcss/vite` compiler)
    *   [Preline UI](https://preline.co/) (Tailwind-based component utility library)
    *   [Iconify](https://iconify.design/) (Customizable vector icon set integrations)
*   **State Management:** [Pinia](https://pinia.vuejs.org/) (with `pinia-plugin-persistedstate` for browser storage sync)
*   **Routing:** [Vue Router 4](https://router.vuejs.org/)
*   **Tables:** [TanStack Vue Table v8](https://tanstack.com/table) (highly performant search, sorting, and pagination logic)
*   **Charts & Metrics:** [Vue3 ApexCharts](https://apexcharts.com/)
*   **Real-Time Capabilities:** [Microsoft SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction) (for real-time chat & notifications from the WhatsApp bot server)
*   **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) (for generating and downloading dynamic property brochures)
*   **Other UX Enhancers:**
    *   [FullCalendar](https://fullcalendar.io/) (for appointment schedule management)
    *   [Swiper](https://swiperjs.com/) (smooth property carousels)
    *   [Flatpickr](https://flatpickr.js.org/) (clean date & time pickers)
    *   [Dropzone](https://www.dropzone.dev/) (drag-and-drop media upload)
    *   [SweetAlert2](https://sweetalert2.github.io/) (beautiful modal alerts)

---

## 🌟 Key Features

The application is divided into two primary zones:

### 1. Guest Portal (Public)
*   **Interactive Homepage:** Features visual property slideshows, featured listings, and a quick-search filter.
*   **Property Catalog:** Fully searchable catalog filtering properties by transaction type (Jual, Sewa), property type (Rumah, Ruko, Tanah, dll.), city/region, price range, and interior specs (bedrooms, bathrooms, carports, levels) with TanStack-powered pagination.
*   **Detail Property View:** Showcases rich details, specifications, structural highlights, and geographical mapping.
*   **Mortgage Simulator (Simulasi KPR):** Dynamic interactive sliders for loan amount, down payment, interest rate, and term duration, showing instant monthly payment estimates.
*   **FAQ & Contact Us Pages:** Provides agency information, maps, and direct inquiry capabilities.

### 2. Admin Portal (Restricted)
*   **Analytics Dashboard:** Visualizes sales performance, property distribution, client growth, and agent performance via interactive ApexCharts.
*   **WhatsApp Live Chat:** Direct real-time communication module with WhatsApp contacts utilizing SignalR websocket connections to the bot API.
*   **Broadcast Manager:** Allows administrators to manage bulk WhatsApp campaigns and templates.
*   **Appointment Scheduler (Janji Temu):** Drag-and-drop calendar planner to schedule, view, and organize customer property viewings.
*   **Property Listings Manager:** CRUD operations for properties, including multi-photo/video uploads, draft/active display visibility toggles, and status updates (Tersedia, Terjual, Tersewa).
*   **Brochure PDF Generator:** Generates professional, print-ready PDF brochures with discount-pricing formats, strikethrough lines, dynamic property specs, and agent contacts on the fly.
*   **Data Management Panel:** Control panels to manage Admins, Sales Agents, Customers, Regions (Wilayah), Custom Amenities Icons, and Transaction Status.
*   **System Settings:** Access configurations for global business rules, toggle Maintenance Mode, and configure default mock-up brochure values.

---

## 📁 Project Structure

```bash
wa-bot-vue/
├── .agent/              # AI coding helper workflow rules and scripts
├── src/
│   ├── assets/          # Static assets & stylesheets (e.g. global style.css)
│   ├── components/      # Shared reusable components (e.g. ProductCard.vue, CompareModal.vue)
│   ├── composables/     # Shared logic & composition functions (e.g. usePropertyFilters.ts)
│   ├── config/          # Global configuration constants
│   ├── layouts/         # Layout systems (Admin layout, Guest layout, Blank/Auth layout)
│   ├── router/          # Vue Router configurations (includes Auth & Maintenance route guards)
│   ├── services/        # HTTP client instances (Axios configurations)
│   ├── stores/          # Pinia store modules (settings, authentication, etc.)
│   ├── types/           # TypeScript type definitions and interfaces
│   ├── utils/           # Utility helpers (PDF brochure drawers, currency formatters)
│   └── views/           # Page view modules:
│       ├── admin/       # Administrator features (chat, broadcast, dashboard, properti)
│       ├── guest/       # Public guest features (beranda, katalog, simulasi-kpr)
│       ├── auth/        # Login pages
│       └── errors/      # Error pages (403, 404, Server Error, Maintenance Mode)
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🛠️ Getting Started & Installation

### Prerequisites
*   **Node.js:** `^20.19.0` or `>=22.12.0` is recommended.
*   **Package Manager:** `npm` (packaged lock file is provided), `yarn`, or `bun`.

### Step-by-Step Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/pdj2024/admin-bot-real-estate.git
    cd admin-bot-real-estate
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Local Development Server:**
    Run the Vite development server with hot-reload support:
    ```bash
    npm run dev
    ```
    Once running, open the local server URL (usually `http://localhost:5173`) in your browser.

4.  **Production Compilation:**
    Perform type-checking and compile/minify assets for a production bundle:
    ```bash
    npm run build
    ```
    The compiled build outputs to the `/dist` directory.

5.  **Linting & Code Formatting:**
    Check and auto-fix eslint syntax rule errors:
    ```bash
    npm run lint
    ```
    Re-format code styling with Prettier:
    ```bash
    npm run format
    ```

---

## 🛡️ Router Guards & Configuration

The routing system (`src/router/index.ts`) ensures the security of the dashboard:
*   **Authentication Check (`requiresAuth`):** Protects administrative routes and automatically redirects unauthenticated users to `/login`.
*   **Auto Token Refresh:** Refreshes tokens proactively on the initial admin page request to maintain seamless API sessions.
*   **Maintenance Bypass:** Redirects visitors to `/maintenance` when the system is set to maintenance status, while allowing logged-in administrators to browse and work regularly.
