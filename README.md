# SubscriBoost | Premium Software Subscription Manager

SubscriBoost is a professional-grade dashboard designed to centralize and visualize your digital lifecycle. Built with a focus on high-end UI/UX principles ("Taste Skill"), it provides real-time financial insights and subscription management with a premium feel.

## 🚀 Key Features

- **Financial Analytics**: Real-time monthly spend calculation and 12-month spending projections using interactive charts.
- **Smart Subscription Tracking**: Manage software services with custom categories (Streaming, Productivity, Gaming, etc.).
- **Global Ready (i18n)**: Full support for English (USD) and Spanish (EUR), including automatic currency and date formatting.
- **Premium Interface**:
  - **Dynamic Theming**: Elegant light and dark modes with custom-tuned color palettes (#20C997 / #38D39F).
  - **Asymmetric Layout**: Professional 12-column grid system with high-density information cards.
  - **Responsive Integrity**: Mobile-first design where no content ever overflows its container.
- **Robust Validation**: Strict input handling for numeric values to prevent invalid data entries.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Icons**: Lucide React
- **Visualization**: Recharts
- **Language/Formatting**: Native JS `Intl` API
- **State Management**: React Context + LocalStorage (for persistent prototype state)

## 📦 Installation & Setup

SubscriBoost is compatible with all modern JavaScript package managers.

### Option 1: NPM
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Option 2: Yarn
```bash
# Install dependencies
yarn install

# Run development server
yarn dev
```

### Option 3: PNPM
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## 🧠 Application Logic

1. **State Persistence**: Subscriptions are managed via a local state synced with `localStorage`, ensuring data persists across browser refreshes without a database for the prototype phase.
2. **Dynamic Calculations**: The `useMemo` hook is used to calculate total spending and chart projections, ensuring heavy math doesn't affect render performance.
3. **Responsive Constraints**: Every container uses `min-w-0` and `truncate` or `break-words` logic to ensure that even extremely large currency values or long service names never break the layout.
4. **Context-Driven UI**: The `AppContext` manages global theme and language preferences, providing a single source of truth for the `Intl` formatting logic.

## 🔮 Scalable Future

SubscriBoost is designed to grow into a full-scale SaaS platform:

- **Firebase Integration**: Easily swap the local state for Cloud Firestore for real-time sync across devices.
- **Authentication**: Add Firebase Auth for secure user accounts.
- **Bank API Integration**: Connect via Plaid or similar services to automatically detect subscriptions from bank statements.
- **Notification System**: Email and push notifications for upcoming billing dates.
- **Browser Extension**: A companion tool to detect new subscriptions as you sign up for services.

---
*Created with focus on high-end visual design and technical excellence.*