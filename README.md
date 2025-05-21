# Circuit Planner

An AI-powered electronic circuit design assistant built with Express.js, EJS, and the Gemini API, providing detailed circuit analysis and design recommendations following proper electrical engineering principles.

## Features

- Generate detailed electronic circuit designs based on specifications
- Comprehensive circuit analysis organized into specialized sections:
  - Functional Requirements & Theoretical Boundaries
  - Topology Selection & Theoretical Analysis
  - Component Modeling & Abstraction
  - Netlist Generation & Node Taxonomy
  - Schematic Diagram
  - Implementation Notes
- Interactive UI with tabbed interface for exploring different aspects of circuit design
- API key testing functionality to verify Gemini API integration
- Responsive design with Bootstrap
- Technical formatting for circuit components, values, and equations

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Replace `your_gemini_api_key` with your actual Gemini API key

## Running the Application

### Development mode:
```
npm run dev
```

### Production mode:
```
npm start
```

### Quick Start with Batch File (Windows):
```
start.bat
```

## Usage

1. Enter your circuit requirements in the form on the home page
2. Submit the form to generate a circuit design
3. View the comprehensive analysis in the tabbed interface
4. Navigate between different aspects of the design using the tab navigation
5. Use the "Edit Requirements" button to refine your circuit specifications

## Tech Stack

- Express.js - Web server framework
- EJS - Templating engine
- Gemini API - AI functionality for circuit design analysis
- Axios - API requests
- Bootstrap - Responsive UI framework
- Node.js - JavaScript runtime

## Future Enhancements

- Circuit visualization with interactive diagrams
- Component database integration for specific part recommendations
- User accounts and saved designs
- Export functionality for circuit designs
- Interactive circuit editor
- Mobile application version 