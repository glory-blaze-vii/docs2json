# Document to JSON Converter

## Overview

This is a full-stack TypeScript application that converts PDF and DOCX documents to structured JSON format using OpenAI's GPT models. The application features a React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database support via Drizzle ORM.

**Recent Updates (July 2025):**
- ✅ Implemented standardized JSON output format with validation
- ✅ Added centralized configuration and prompt management
- ✅ Enhanced file I/O with automatic JSON file saving
- ✅ Improved error handling and code organization
- ✅ Added scaffolded features for future development

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Processing**: Multer for file uploads, pdf-parse for PDFs, mammoth for DOCX
- **AI Integration**: OpenAI GPT-4o for document analysis and JSON conversion
- **Session Management**: connect-pg-simple for PostgreSQL session storage

## Key Components

### Frontend Components
1. **FileUpload**: Handles drag-and-drop file uploads with processing options
2. **ProcessingStatus**: Shows real-time conversion status with progress indicators
3. **JsonOutput**: Displays and allows interaction with converted JSON data
4. **RecentHistory**: Lists previous conversions with actions (view, download, delete)

### Backend Services
1. **Document Processor**: Extracts text from PDF and DOCX files with metadata
2. **OpenAI Service**: Converts extracted text to structured JSON using GPT-4o with validation
3. **Storage Interface**: Abstracts data persistence with memory and database implementations
4. **JSON Validator**: Ensures output contains required fields (title, summary, key_points, quotes)
5. **File Utilities**: Handles JSON file saving, cleanup, and filename generation
6. **Folder Monitor**: Scaffolded service for automatic file processing (future feature)

### Database Schema
- **users**: Basic user authentication (id, username, password)
- **conversions**: Tracks document conversions with metadata (filename, status, JSON output, processing time, etc.)

## Data Flow

1. User uploads a document through the FileUpload component
2. File is processed by multer middleware and stored temporarily
3. Document text is extracted using appropriate parser (pdf-parse or mammoth)
4. Extracted text is sent to OpenAI GPT-4o for JSON conversion using centralized prompts
5. JSON output is validated against required schema (title, summary, key_points, quotes)
6. Structured JSON result is saved to file system and stored in database with metadata
7. Frontend receives real-time updates via React Query
8. User can view, download, or manage converted documents with JSON file downloads

## Configuration Management

### Centralized Configuration (`server/config/`)
- **index.ts**: Main configuration with environment variables, OpenAI settings, and file processing limits
- **prompts.ts**: Standardized prompt templates for different processing modes and future features

### Modular Architecture (`server/services/`, `server/utils/`)
- **services/**: Core business logic (document processing, OpenAI integration, folder monitoring)
- **utils/**: Reusable utilities (JSON validation, file handling, data sanitization)
- **config/**: Environment and prompt management for consistent behavior

## External Dependencies

### AI Integration
- **OpenAI API**: Uses GPT-4o model for intelligent document analysis and JSON conversion
- **Configuration**: API key managed through environment variables

### Database
- **Neon Database**: Serverless PostgreSQL for production
- **Drizzle ORM**: Type-safe database operations with automatic migrations
- **Connection**: Uses DATABASE_URL environment variable

### File Processing
- **pdf-parse**: Extracts text content from PDF files
- **mammoth**: Converts DOCX documents to plain text
- **multer**: Handles multipart file uploads with size limits (10MB)

### UI Libraries
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built components with consistent styling
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Deployment Strategy

### Development
- **Dev Server**: Vite dev server with HMR for frontend
- **Backend**: tsx for running TypeScript server with auto-reload
- **Database**: Drizzle kit for schema management and migrations

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend files in production
- **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **DATABASE_URL**: PostgreSQL connection string
- **OPENAI_API_KEY**: Required for document processing
- **File Storage**: Temporary uploads directory for processing

The application uses a monorepo structure with shared TypeScript schemas and utilities, enabling type safety across the full stack while maintaining clear separation between frontend and backend concerns.