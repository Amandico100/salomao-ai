# SALOMÃO.AI

## Overview

SALOMÃO.AI is a conversational AI platform that creates intelligent automated sales systems in 60 seconds. The platform allows users to interact with an AI assistant (Salomão) through a chat interface to generate customized sales systems based on their business needs. The system features a modern dark-themed interface with real-time system preview and dashboard analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with Shadcn/ui component library for consistent UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Zustand for global application state and TanStack Query for server state management
- **UI Components**: Comprehensive Shadcn/ui component library with Radix UI primitives for accessibility

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Authentication**: Replit Auth integration with session management
- **File Structure**: Monorepo structure with separate client and server directories

### Chat System
- **AI Integration**: OpenAI GPT-4o for conversational AI and system generation
- **Question Flow**: Structured conversation flow to gather business requirements
- **System Generation**: AI-powered creation of sales systems based on user inputs
- **Real-time Preview**: Live preview of generated systems in mobile mockup format

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Session Storage**: PostgreSQL-based session storage for authentication

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **User Management**: User profiles with business information and subscription tiers

### Database Schema
- **Users**: User profiles with business details and subscription information
- **Systems**: Generated sales systems with configuration and metrics
- **Templates**: Pre-built system templates with performance data
- **Leads**: Customer lead tracking and management
- **Chat Sessions**: Conversation history and system generation tracking

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting for data persistence
- **OpenAI API**: GPT-4o model for AI conversation and system generation
- **Replit Auth**: Authentication and user management service

### Frontend Libraries
- **Shadcn/ui**: Complete UI component library with accessibility
- **Radix UI**: Headless UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing solution

### Backend Libraries
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL support
- **Express**: Web application framework with middleware support
- **OpenAI SDK**: Official OpenAI API client for AI integration
- **Connect PG Simple**: PostgreSQL session store for Express sessions

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind integration

The architecture prioritizes type safety, developer experience, and scalability while maintaining a clean separation between frontend and backend concerns. The system is designed to handle real-time chat interactions while providing a responsive dashboard experience for system management and analytics.