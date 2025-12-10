const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Domain extensions supported
const DOMAIN_EXTENSIONS = [
  '.net', '.cloud', '.dev', '.online', '.is.dev', 
  '.app', '.tech', '.studio', '.digital', '.world',
  '.space', '.site', '.store', '.shop', '.blog',
  '.io', '.ai', '.co', '.me', '.xyz'
];

// Route to get available domain extensions
app.get('/api/domains/extensions', (req, res) => {
  res.json({ extensions: DOMAIN_EXTENSIONS });
});

// Route to validate subdomain
app.post('/api/domains/validate', (req, res) => {
  const { subdomain, extension } = req.body;
  
  if (!subdomain || !extension) {
    return res.status(400).json({ error: 'Subdomain and extension are required' });
  }

  // Basic validation
  const errors = [];
  
  if (subdomain.length < 3) {
    errors.push('Subdomain must be at least 3 characters long');
  }
  
  if (subdomain.length > 63) {
    errors.push('Subdomain must be less than 64 characters');
  }
  
  if (!/^[a-zA-Z0-9-]+$/.test(subdomain)) {
    errors.push('Subdomain can only contain letters, numbers, and hyphens');
  }
  
  if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
    errors.push('Subdomain cannot start or end with a hyphen');
  }

  if (!DOMAIN_EXTENSIONS.includes(extension)) {
    errors.push('Unsupported domain extension');
  }

  if (errors.length > 0) {
    return res.json({ valid: false, errors });
  }

  // Simulate availability check (in real app, this would query DNS APIs)
  const isAvailable = Math.random() > 0.3; // 70% chance of being available
  
  res.json({
    valid: true,
    available: isAvailable,
    domain: `${subdomain}${extension}`,
    message: isAvailable ? 'Domain is available' : 'Domain may be taken'
  });
});

// Route to generate DNS forwarding configuration
app.post('/api/dns/generate', (req, res) => {
  const { subdomain, extension, targetUrl, type } = req.body;
  
  if (!subdomain || !extension || !targetUrl) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const domain = `${subdomain}${extension}`;
  
  const dnsConfig = {
    domain: domain,
    records: [
      {
        type: 'CNAME',
        name: '@',
        value: 'cname.render.com',
        ttl: 3600
      },
      {
        type: 'CNAME',
        name: 'www',
        value: 'cname.render.com',
        ttl: 3600
      }
    ],
    forwarding: {
      type: type || '301',
      from: domain,
      to: targetUrl
    }
  };

  if (type === 'path') {
    dnsConfig.pathForwarding = {
      source: `/${subdomain}`,
      destination: targetUrl
    };
  }

  res.json(dnsConfig);
});

// Route to get subdomain suggestions
app.get('/api/domains/suggestions', (req, res) => {
  const { keyword, extension } = req.query;
  
  const suggestions = [];
  const prefixes = ['my', 'app', 'get', 'go', 'the', 'best', 'top', 'pro'];
  const suffixes = ['app', 'hub', 'zone', 'space', 'lab', 'pro', 'tech', 'io'];
  
  if (keyword) {
    suggestions.push(`${keyword}${extension}`);
    suggestions.push(`${keyword}-app${extension}`);
    suggestions.push(`my-${keyword}${extension}`);
  }
  
  // Generate random suggestions
  for (let i = 0; i < 5; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    suggestions.push(`${prefix}-${suffix}${extension}`);
  }
  
  res.json({ suggestions: suggestions.slice(0, 8) });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Subdomain Creator Server running on port ${PORT}`);
});

module.exports = app;