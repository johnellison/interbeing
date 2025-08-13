# EcoHabits - Habit Tracking with Environmental Impact

## Overview

EcoHabits is a full-stack web application that combines personal habit tracking with environmental impact visualization. Users can create and track daily habits while earning virtual trees for completed actions, creating a gamified experience that connects personal growth with environmental awareness. The application features a clean, nature-inspired interface built with modern React components and a robust Express.js backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom forest-themed design tokens and CSS variables
- **State Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware with structured error responses
- **Development Tools**: Hot reloading with Vite integration in development mode

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Four main entities - sessions (for auth), users, habits, and habit completions with proper foreign key relationships
- **Production Storage**: Full database implementation replacing previous in-memory storage
- **Migrations**: Drizzle Kit for database schema migrations and management
- **Session Storage**: PostgreSQL-backed session store for authentication persistence

### Authentication and Authorization
- **Authentication System**: Replit OpenID Connect integration with session-based authentication
- **User Management**: Database-backed user storage with automatic account creation via Replit Auth
- **Session Management**: PostgreSQL session storage with automatic token refresh
- **Authorization**: Protected API routes using isAuthenticated middleware
- **User Model**: Updated for Replit Auth with email, firstName, lastName, and profileImageUrl fields

### Component Architecture
- **Design System**: Comprehensive UI component library with consistent theming
- **Modular Components**: Separation of concerns with dedicated components for habits, progress tracking, and celebrations
- **Custom Hooks**: Reusable logic for mobile detection, toast notifications, and form handling
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### External Dependencies

#### Database Services
- **Neon Database**: Serverless PostgreSQL database service (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Connection Pooling**: Built-in connection management for serverless environments

#### Third-Party APIs
- **Ecologi API**: Tree planting service integration for real environmental impact
  - Supports both test and production tree planting
  - Tracks individual tree planting transactions
  - Requires ECOLOGI_API_TOKEN environment variable

#### UI and Component Libraries
- **Radix UI**: Comprehensive set of low-level UI primitives for accessibility
- **Lucide React**: Icon library with tree, fitness, and nature-themed icons
- **Embla Carousel**: Touch-friendly carousel component
- **Class Variance Authority**: Utility for creating type-safe component variants

#### Development and Build Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **TypeScript**: Strong typing throughout the application
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **PostCSS**: CSS processing with autoprefixer support

#### Validation and Forms
- **Zod**: Runtime type validation and schema definitions
- **React Hook Form**: Performant form library with validation integration
- **Drizzle Zod**: Integration between Drizzle schemas and Zod validation

#### State Management and Data Fetching
- **TanStack React Query**: Server state management with caching and synchronization
- **Date-fns**: Date manipulation and formatting utilities