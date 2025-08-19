# Data Labeling Engine

A clean and simple data labeling system that automatically processes JSON payloads using user-defined rules and provides real-time analytics. Built with React and Vercel serverless functions.

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
- **Serverless Architecture**: Optimized for Vercel deployment
- **Error Handling**: Comprehensive validation and error reporting

## API Documentation

### Rules Endpoints
POST   /api/rules           # Create new rule
PUT    /api/rules/:id       # Update existing rule
DELETE /api/rules/:id       # Delete rule
POST   /api/rules/:id/toggle # Enable/disable rule
POST   /api/process         # Process JSON payload
POST   /api/test           # Test rules without storing
GET    /api/statistics      # Get processing statistics
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the development server:
```bash
npm run dev
```

This will start the frontend development server on http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

### Deployment
The application is ready for deployment on Vercel:
1. Connect your repository to Vercel
2. Deploy - the API routes will work automatically with Vercel's serverless functions

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
- **In-memory Storage**: Global variables for data persistence
- **Rule Engine**: Sophisticated condition evaluation system
- **Statistics Engine**: Real-time analytics computation

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS, Chart.js, React Router
- **Backend**: Vercel Serverless Functions
- **Development**: Vite, ESLint, Concurrent execution

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
curl -X POST /api/process \
  -H "Content-Type: application/json" \
  -d '{"CompanyName": "Google", "Price": 1.5, "MOQ": 150}'
```

### Monitoring Analytics
- Visit Dashboard page for real-time statistics
- Monitor recent processing activity

## Technical Notes

- **Serverless Limitations**: Data persists within the same container but may reset on cold starts
- Rule priorities are positive integers (higher = more important)
- Labels are simple strings without special formatting requirements
- Real-time updates use polling mechanism (3-second intervals)
- Global variables provide data persistence across function calls in the same container
