# Data Labeling Engine

A sophisticated data labeling system that automatically processes JSON payloads using user-defined rules and provides comprehensive analytics. Built with React, Node.js, and Supabase for reliable data persistence.

##  Features

### Configuration Management
- **JSON Schema Detection**: Automatic extraction of keys from sample JSON
- **Visual Rule Builder**: Intuitive interface with support for complex conditions
- **Logical Operators**: Support for AND/OR operations with nested groups
- **Comparison Operators**: Full range of operators (=, !=, <, >, <=, >=)
- **Rule Management**: Create, edit, delete, enable/disable rules with priority system

### Analytics Dashboard
- **Real-time Statistics**: Live processing metrics with auto-refresh
- **Interactive Charts**: Bar charts and pie charts for data visualization
- **Advanced Filtering**: Filter by label, date range, and other criteria
- **Export Functionality**: Export statistics to CSV and PDF formats
- **Recent Entries**: Monitor latest processed data with applied labels

### Processing Engine
- **Priority-based Evaluation**: Rules processed by priority order
- **Multi-label Support**: Apply multiple labels to single payload
- **Efficient Storage**: In-memory data structures for optimal performance
- **Error Handling**: Comprehensive validation and error reporting

## API Documentation

### Rules Endpoints
```
GET    /api/rules           # Get all rules
POST   /api/rules           # Create new rule
PUT    /api/rules/:id       # Update existing rule
DELETE /api/rules/:id       # Delete rule
POST   /api/rules/:id/toggle # Enable/disable rule
```

### Processing Endpoints
```
POST   /api/process         # Process JSON payload
GET    /api/statistics      # Get processing statistics
GET    /api/statistics?label=Green&from=2024-01-01&to=2024-01-31
```

### Health Check
```
GET    /api/health          # API health status
GET    /api/docs           # OpenAPI documentation
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Supabase:
   - Create a new Supabase project at https://supabase.com
   - Copy your project URL and API keys
   - Create a `.env` file based on `.env.example`
   - Run the database migration in your Supabase SQL editor:
     ```sql
     -- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
     ```

### Development
Start both frontend and backend servers:
```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:3001
- Frontend development server on http://localhost:5173

### Environment Variables
Create a `.env` file with your Supabase credentials:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Production Build
```bash
npm run build
npm run preview
```

### Deployment
The application is ready for deployment on Vercel:
1. Connect your repository to Vercel
2. Add your Supabase environment variables in Vercel's dashboard
3. Deploy - the API routes will work automatically with Vercel's serverless functions

Data will persist across deployments and serverless function restarts thanks to Supabase.

## Sample Data

The system comes pre-configured with sample rules and supports the following JSON structure:

```json
{
  "CompanyName": "Fortune Company",
  "Product": "Chocolate",
  "Size": "Small",
  "Price": 2,
  "Currency": "USD",
  "Weight": "10 gm",
  "BatchID": 15,
  "MFGUnit": "df_rd-15",
  "Quantity": 1800,
  "MOQ": 200
}
```

### Pre-configured Rules
1. **High Value Products**: Companies like Google or Amazon with specific price conditions → "Green"
2. **Standard Price Range**: Products with price = 2 → "Orange"
3. **Low MOQ Products**: MOQ < 100 AND Price < 1.5 → "Green"

## Architecture

### Frontend (React + TypeScript)
- **Pages**: Configuration and Dashboard
- **Components**: Modular, reusable UI components
- **Services**: API integration layer
- **Types**: TypeScript definitions for type safety

### Backend (Serverless API Routes)
- **RESTful API**: Clean, documented endpoints
- **Supabase Integration**: Persistent PostgreSQL database
- **Rule Engine**: Sophisticated condition evaluation system
- **Statistics Engine**: Real-time analytics computation

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS, Chart.js
- **Backend**: Vercel Serverless Functions, Supabase PostgreSQL
- **Development**: Vite, ESLint, Concurrent execution
- **Export**: jsPDF, Papa Parse for CSV/PDF generation
- **Database**: Supabase (PostgreSQL with real-time features)

## Usage Examples

### Creating Rules
1. Navigate to Configuration page
2. Paste your JSON sample to extract keys
3. Use the Rule Builder to create conditions:
   - Single conditions: `Price > 5`
   - Complex groups: `(CompanyName = "Google" OR Price < 2) AND MOQ > 100`
4. Assign labels and priorities
5. Save and activate rules

### Processing Data
Send POST requests to `/api/process` with your JSON payload:
```bash
curl -X POST http://localhost:3001/api/process \
  -H "Content-Type: application/json" \
  -d '{"CompanyName": "Google", "Price": 1.5, "MOQ": 150}'
```

### Monitoring Analytics
- Visit Dashboard page for real-time statistics
- Filter data by labels or date ranges
- Export reports in CSV or PDF format
- Monitor recent processing activity

## Assumptions Made

- JSON payloads follow consistent schema structure  
- Rule priorities are positive integers (higher = more important)
- Labels are simple strings without special formatting requirements
- Date filtering uses ISO date format (YYYY-MM-DD)
- Export functionality requires modern browser support
- Real-time updates use polling mechanism (10-second intervals)
- Supabase provides reliable data persistence and handles concurrent access
