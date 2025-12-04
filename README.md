# The Best Valet Parking Management System

A comprehensive, modern valet parking management system built with React, TypeScript, and Supabase. This system provides a complete solution for managing valet parking operations, including ticket generation, car requests, payment processing, and revenue analytics.

## 🚀 Features

### Core Functionality
- **Ticket Management**: Generate and manage parking tickets with multiple ticket types (Standard, Premium, VIP, Event)
- **Car Request System**: Real-time car retrieval requests with status tracking
- **Payment Processing**: Support for cash and card payments with payment status tracking
- **Revenue Analytics**: Comprehensive revenue analysis with daily, weekly, and monthly reports
- **Real-time Updates**: Live notifications for new car requests using Supabase real-time subscriptions
- **Multi-dashboard System**: Separate dashboards for entrance staff, valet staff, and customers

### User Interfaces
- **Entrance Dashboard**: Ticket generation, car requests, ticket management, and revenue analysis
- **Valet Dashboard**: Car request notifications and ticket search functionality
- **Customer Interface**: Simple ticket number input for car retrieval requests
- **Settings Page**: Password management and system configuration

### Security & Access Control
- **Password Protection**: Role-based password protection for different dashboard sections
- **Session Management**: Secure session-based authentication
- **Development Mode**: Configurable development mode for easier testing

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - High-quality React components
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL database, real-time subscriptions, authentication)
- **PostgreSQL** - Relational database

### Additional Libraries
- **React Query** - Data fetching and caching
- **Zod** - Schema validation
- **React Hook Form** - Form management
- **Date-fns** - Date manipulation
- **Vercel Analytics** - Analytics integration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** or **bun** package manager
- **Supabase account** and project
- **Git** (for version control)

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd thebestvalet-system
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_PUBLIC_SUPABASE_URL=your_supabase_project_url
VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Mode (optional)
VITE_DEVELOPMENT_MODE=false

# Application Name (optional)
VITE_APP_NAME=The Best Valet
```

> **Note**: Get your Supabase credentials from your Supabase project dashboard under Settings > API.

### 4. Database Setup

Run the database migrations to set up the schema:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the migration files in supabase/migrations/
```

The migrations include:
- `20231105000000_initialize_schema.sql` - Core database schema
- `20231105000001_seed_data.sql` - Initial seed data
- `20231105000002_add_secure_policies.sql` - Row-level security policies
- `20231105000003_add_payment_method.sql` - Payment method support

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The application will be available at `http://localhost:8080`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── shared/         # Reusable shared components
│   ├── ui/             # Shadcn UI components
│   └── ...             # Feature-specific components
├── pages/              # Page components (routes)
├── services/           # Service layer (API calls)
│   ├── ticket-service.ts
│   ├── car-request-service.ts
│   ├── revenue-service.ts
│   └── print-service.ts
├── hooks/              # Custom React hooks
│   ├── useTicketSearch.ts
│   ├── useCarRequestSubmission.ts
│   ├── useNotificationSound.ts
│   └── ...
├── context/            # React Context providers
│   └── ValetContext.tsx
├── lib/                # Utility functions
│   ├── date-utils.ts
│   ├── password-service.ts
│   └── utils.ts
├── config/             # Configuration files
│   └── app.ts
├── constants/          # Application constants
│   └── ticketPrices.ts
└── integrations/       # Third-party integrations
    └── supabase/
```

## 🔧 Configuration

### Development Mode

Set `VITE_DEVELOPMENT_MODE=true` in your `.env` file to bypass password protection during development. This is useful for faster iteration but should **never** be enabled in production.

### Ticket Prices

Ticket prices are configured in `src/constants/ticketPrices.ts`. You can customize prices for different ticket types:

```typescript
export const TICKET_PRICES = {
  STANDARD: 2.0,
  PREMIUM: 5.0,
  VIP: 10.0,
  EVENT: 15.0,
};
```

### Passwords

Passwords are stored in the Supabase database and can be managed through the Settings page. Default passwords are set in the seed data migration.

## 🏗️ Building for Production

### Build the Application

```bash
npm run build
# or
yarn build
# or
bun run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy

The application can be deployed to various platforms:

- **Vercel**: Connect your repository and configure environment variables
- **Netlify**: Use the included `netlify.toml` configuration
- **Any static hosting**: Upload the `dist/` folder contents

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes | - |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes | - |
| `VITE_DEVELOPMENT_MODE` | Enable development mode (bypasses auth) | No | `false` |
| `VITE_APP_NAME` | Application name | No | `Valet Parking Pro` |

## 📊 Database Schema

### Main Tables

- **tickets**: Stores parking tickets with payment status
- **car_requests**: Tracks car retrieval requests with status (pending, accepted, completed)
- **passwords**: Stores encrypted passwords for different dashboard sections

### Key Relationships

- `car_requests.ticket_id` → `tickets.id` (Foreign Key)

## 🎨 Customization

### Styling

The application uses Tailwind CSS. Customize colors and themes in `tailwind.config.ts`.

### Components

All UI components are built with Shadcn UI and can be customized in `src/components/ui/`.

### Routes

Routes are defined in `src/App.tsx`. Add new routes as needed:

```typescript
<Route path="/your-route" element={<YourComponent />} />
```

## 🧪 Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions

### Service Layer Pattern

All database operations should go through the service layer:

```typescript
// ✅ Good - Use service
import { createTicket } from '@/services/ticket-service';
await createTicket({ ... });

// ❌ Bad - Direct Supabase call
await supabase.from('tickets').insert({ ... });
```

### Component Organization

- **Shared components**: Reusable across multiple features → `src/components/shared/`
- **Feature components**: Specific to a feature → `src/components/[feature]/`
- **Page components**: Full page views → `src/pages/`

## 🐛 Troubleshooting

### Common Issues

**Issue**: Supabase connection errors
- **Solution**: Verify your environment variables are set correctly
- Check that your Supabase project is active
- Ensure Row Level Security policies are configured

**Issue**: Real-time subscriptions not working
- **Solution**: Verify Supabase real-time is enabled in your project
- Check browser console for subscription errors
- Ensure proper channel cleanup in useEffect

**Issue**: Build errors
- **Solution**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`
- Verify all environment variables are set

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Contribution Guidelines

- Follow the existing code style and patterns
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Credits

**Owner**: Abdul Rahman Saad  
**System**: The Best Valet Parking Management System

## 📞 Support

For issues, questions, or feature requests, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for efficient valet parking management**
