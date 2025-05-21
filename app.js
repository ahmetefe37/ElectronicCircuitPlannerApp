const express = require('express');
const path = require('path');
require('dotenv').config();
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Session storage for demo purposes (in production, use a database)
const sessionData = {};

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Add currentRoute to all routes
app.use((req, res, next) => {
  res.locals.currentRoute = req.path;
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Circuit Planner' });
});

// Output route
app.get('/output', (req, res) => {
  res.render('output', { 
    title: 'Circuit Results',
    circuitSpec: sessionData.circuitSpec || '',
    result: sessionData.parsedResult || null
  });
});

// API test route
app.get('/test-api-key', async (req, res) => {
  const apiStatus = {
    success: false,
    error: '',
    model: '',
    responseTime: 0,
    testResponse: ''
  };
  
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please check your .env file.');
    }

    // Gemini API endpoint
    const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';
    
    // Simple test prompt
    const payload = {
      contents: [{
        parts: [{
          text: 'Respond with a short greeting and confirm that you can help with circuit design. Keep it under 50 words.'
        }]
      }]
    };

    const startTime = Date.now();
    
    // Call the Gemini API
    const response = await axios.post(
      `${endpoint}?key=${GEMINI_API_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const endTime = Date.now();
    
    // Extract the AI response
    const testResponse = response.data.candidates[0].content.parts[0].text;
    
    apiStatus.success = true;
    apiStatus.model = 'gemini-2.0-flash';
    apiStatus.responseTime = endTime - startTime;
    apiStatus.testResponse = testResponse;
    
  } catch (error) {
    console.error('API Test Error:', error);
    apiStatus.success = false;
    apiStatus.error = error.message || 'An unknown error occurred';
    
    // Handle specific error codes from Google API
    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      if (statusCode === 400) {
        apiStatus.error = 'Bad request: Check if your API key has the correct permissions.';
      } else if (statusCode === 401) {
        apiStatus.error = 'Unauthorized: Your API key is invalid or has expired.';
      } else if (statusCode === 403) {
        apiStatus.error = 'Forbidden: Your API key doesn\'t have access to this resource.';
      } else if (statusCode === 429) {
        apiStatus.error = 'Too many requests: You\'ve exceeded your API quota.';
      } else if (errorData && errorData.error) {
        apiStatus.error = `API Error: ${errorData.error.message || errorData.error}`;
      }
    }
  }
  
  res.render('api-test', { 
    title: 'API Key Test',
    apiStatus
  });
});

// Function to parse the AI response into circuit engineering sections
function parseCircuitResponse(text) {
  if (!text) return null;
  
  const sections = {
    functionalRequirements: '',
    topologyAnalysis: '',
    componentModeling: '',
    netlistGeneration: '',
    schematicDiagram: '',
    simulationResults: '',
    implementationNotes: ''
  };

  // Try to find sections in the response
  let currentSection = 'functionalRequirements'; // Default section
  
  const lines = text.split('\n');
  let sectionContent = [];
  
  for (const line of lines) {
    // Check for section headers
    if (line.match(/functional requirements|theoretical boundaries|rule 1\./i)) {
      currentSection = 'functionalRequirements';
      sectionContent = [];
    } else if (line.match(/topology selection|theoretical analysis|principle 2\./i)) {
      // Save previous section
      sections[currentSection] = sectionContent.join('\n');
      currentSection = 'topologyAnalysis';
      sectionContent = [];
    } else if (line.match(/component modeling|abstraction|rule 3\./i)) {
      sections[currentSection] = sectionContent.join('\n');
      currentSection = 'componentModeling';
      sectionContent = [];
    } else if (line.match(/netlist generation|node taxonomy|principle 4\./i)) {
      sections[currentSection] = sectionContent.join('\n');
      currentSection = 'netlistGeneration';
      sectionContent = [];
    } else if (line.match(/schematic diagram|circuit diagram|schematic/i)) {
      sections[currentSection] = sectionContent.join('\n');
      currentSection = 'schematicDiagram';
      sectionContent = [];
    } else if (line.match(/simulation results|expected behavior|performance/i)) {
      sections[currentSection] = sectionContent.join('\n');
      currentSection = 'simulationResults';
      sectionContent = [];
    } else if (line.match(/implementation notes|practical considerations|notes/i)) {
      sections[currentSection] = sectionContent.join('\n');
      currentSection = 'implementationNotes';
      sectionContent = [];
    }
    
    // Add line to current section
    sectionContent.push(line);
  }
  
  // Save the final section
  sections[currentSection] = sectionContent.join('\n');
  
  // Format the sections with HTML
  for (const section in sections) {
    sections[section] = formatCircuitContent(sections[section]);
  }
  
  return sections;
}

// Function to format circuit content with HTML and technical terms
function formatCircuitContent(text) {
  if (!text) return '';
  
  // Replace line breaks with HTML breaks
  let formatted = text.replace(/\n/g, '<br>');
  
  // Format headings (number followed by dot and space at start of line)
  formatted = formatted.replace(/^(Rule|Principle)\s+(\d+\.\d+):\s+([^\n<]+)/gmi, 
    '<h5 class="mt-3 mb-2 fw-bold">$1 $2: $3</h5>');
  
  // Format component names and values
  formatted = formatted.replace(/"([^"]+)"/g, '<code class="component-name">$1</code>');
  formatted = formatted.replace(/(\d+\s*(Ω|ohm|V|Hz|F|H|µF|uF|pF|nF|mH|µH|MHz|kHz))/gi, 
    '<code class="component-value">$1</code>');
  
  // Format mathematical expressions (text between $ signs)
  formatted = formatted.replace(/\$([^$]+)\$/g, '<span class="math-formula">$1</span>');
  
  // Format KVL/KCL equations
  formatted = formatted.replace(/(∑[IV][^=<>]*=[^<,\.]+)/g, 
    '<span class="math-equation">$1</span>');
  
  // Format important circuit terms
  const circuitTerms = ['KVL', 'KCL', 'impedance', 'voltage source', 'current source', 
    'op-amp', 'transistor', 'MOSFET', 'BJT', 'capacitor', 'inductor', 'resistor', 
    'ESR', 'Q-factor', 'Bode plot', 'stability margin', 'phase margin', 'gain margin',
    'small-signal', 'large-signal', 'frequency response', 'bandwidth', 'gain',
    'Thévenin', 'Norton', 'equivalent circuit'];
  
  for (const term of circuitTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    formatted = formatted.replace(regex, '<span class="circuit-term">$&</span>');
  }
  
  // Highlight warnings and important notes
  formatted = formatted.replace(/(Note:|Warning:|Important:|Caution:)(.+?)(<br|$)/g, 
    '<div class="alert alert-warning p-2 mt-2 mb-2"><strong>$1</strong>$2</div>$3');
  
  return formatted;
}

// API route for Gemini
app.post('/generate', async (req, res) => {
  try {
    const { circuitSpec } = req.body;
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Save the circuit spec in session data
    sessionData.circuitSpec = circuitSpec;

    // Gemini API endpoint
    const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';
    
    // Prepare request payload for Gemini API with structured engineering approach
    const payload = {
      contents: [{
        parts: [{
          text: `As an expert electrical engineer, analyze the following circuit requirements and provide a detailed engineering design following proper circuit engineering principles. 

Requirements: ${circuitSpec}

Please structure your response according to these specific circuit engineering principles:

1. Functional Requirements & Theoretical Boundaries
- Define voltage/current domains with Kirchhoff's Voltage/Current Law (KVL/KCL)
- Specify all ideal source assumptions
- Flag any conflicting requirements

2. Topology Selection & Theoretical Analysis
- Include small-signal models for amplifiers if applicable
- Discuss Bode stability margins if needed
- For digital logic, follow Boolean completeness principles
- For mixed-signal designs, include isolation analysis

3. Component Modeling & Abstraction
- Specify SPICE-compatible models for active components
- Provide frequency-dependent models for passive components
- Include non-ideal source modeling as appropriate

4. Netlist Generation & Node Taxonomy
- Use hierarchical naming for nodes
- Ensure no floating nodes
- Verify all nets have DC path to ground

5. Schematic Diagram
- Provide a text-based representation of the circuit schematic
- Label all components with appropriate values
- Show connections between components clearly

6. Implementation Notes
- Practical considerations for PCB layout
- Component selection guidelines
- Testing and troubleshooting advice

Use proper engineering notation and be thorough yet concise in your analysis.`
        }]
      }]
    };

    // Call the Gemini API
    const response = await axios.post(
      `${endpoint}?key=${GEMINI_API_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the AI response
    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    // Parse the response into circuit engineering sections
    const parsedResult = parseCircuitResponse(aiResponse);
    
    // Store parsed result in session data
    sessionData.parsedResult = parsedResult;
    
    res.json({ 
      success: true, 
      message: aiResponse,
      input: circuitSpec
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error: ${error.message || 'An unknown error occurred'}`
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 