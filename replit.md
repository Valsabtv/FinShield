# FinShield - Money Laundering Detection System

## Overview

FinShield is a comprehensive money laundering detection system designed for banks and government institutions to identify suspicious transaction patterns. The application combines rule-based filtering with machine learning algorithms to detect layering patterns in bank accounts and provide real-time fraud detection capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack TypeScript architecture with a clear separation between client, server, and shared components:

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Custom financial services color palette optimized for risk visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Hosting**: Configured for Neon Database serverless PostgreSQL
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple

### Data Storage Architecture
- **Primary Database**: PostgreSQL via Neon Database serverless platform (ACTIVE)
- **ORM**: Drizzle ORM with Zod validation schemas
- **Migration Strategy**: Drizzle Kit for database schema migrations
- **Storage Implementation**: DatabaseStorage class with full CRUD operations for transactions, alerts, users, and system metrics
- **Database Tables**: users, transactions, alerts, system_metrics with proper foreign key relationships
- **Seeding**: Automatic seeding of initial system metrics on server startup

## Key Components

### Machine Learning Integration
- **ML Service**: Integrated fraud detection algorithms based on the Money Laundering Detection repository
- **Feature Engineering**: Comprehensive feature extraction across five categories:
  - Monetary features (amount, velocity, ticket size)
  - Temporal features (time patterns, intervals)
  - Location & channel features (IP analysis, geo-velocity)
  - Device & session features (fingerprinting, behavior analysis)
  - Identity features (email verification, social presence)

### Risk Assessment Engine
- **Rule-Based Pre-filtering**: Hard rules for immediate flagging (high-value transactions, structuring patterns, IP mismatches)
- **ML Scoring**: Supervised learning model with probability scoring and SHAP explanations
- **Risk Classification**: Three-tier system (LOW/MEDIUM/HIGH) with automated response actions

### User Interface Components
- **Dashboard**: Real-time monitoring with key metrics and risk distribution visualization
- **Transaction Monitor**: Searchable and filterable transaction table with real-time updates
- **Alert Queue**: Prioritized alert management system with resolution workflows
- **Analytics**: Comprehensive reporting with charts and trend analysis
- **Upload System**: Batch transaction processing with progress tracking

## Data Flow

### Transaction Processing Pipeline
1. **Data Ingestion**: Transactions uploaded via web interface or API
2. **Feature Extraction**: Automatic calculation of ML features from transaction data
3. **Rule-Based Filtering**: Apply hard rules for immediate risk assessment
4. **ML Scoring**: Generate probability scores and SHAP explanations
5. **Risk Classification**: Assign risk levels and determine response actions
6. **Alert Generation**: Create alerts for flagged transactions
7. **Real-time Updates**: Push notifications to connected clients

### Alert Management Flow
1. **Alert Creation**: Automatic generation based on risk thresholds
2. **Priority Assignment**: Based on risk level and business rules
3. **Queue Management**: Organized display with filtering capabilities
4. **Resolution Workflow**: Manual review and disposition tracking
5. **Audit Trail**: Complete history of alert handling

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL serverless)
- **UI Components**: Radix UI primitives for accessible components
- **Validation**: Zod for runtime type validation
- **Date Handling**: date-fns for temporal feature calculations
- **Styling**: Tailwind CSS with class-variance-authority for component variants

### Development Dependencies
- **Build Tools**: Vite for frontend bundling, esbuild for server compilation
- **Type Safety**: TypeScript with strict configuration
- **Development Environment**: Replit-specific plugins for hot reloading and error handling

### Machine Learning Dependencies
- **Feature Engineering**: Custom implementations for financial feature extraction
- **Model Integration**: Designed to integrate with external ML services or models
- **Explainability**: SHAP integration for model interpretability

## Deployment Strategy

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild compilation to ESM format with external package handling
- **Database**: Drizzle migrations for schema deployment

### Environment Configuration
- **Development**: Hot reloading with Vite middleware integration
- **Production**: Containerized deployment with environment variable configuration
- **Database**: Environment-based connection string configuration

### Security Considerations
- **Session Management**: Secure session storage in PostgreSQL
- **Data Validation**: Comprehensive input validation with Zod schemas
- **API Security**: Express middleware for request logging and error handling
- **Database Security**: Parameterized queries through Drizzle ORM

### Monitoring and Observability
- **Real-time Updates**: WebSocket-like behavior through query invalidation
- **Request Logging**: Detailed API request and response logging
- **Performance Metrics**: System metrics tracking for dashboard display
- **Error Handling**: Comprehensive error boundaries and logging

The system is designed for high availability and real-time processing, suitable for financial institutions requiring immediate fraud detection and regulatory compliance capabilities.