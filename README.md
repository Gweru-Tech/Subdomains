# Subdomain Creator - Deploy on Render.com

A comprehensive web application for creating custom subdomains with automatic DNS forwarding configuration, specifically designed for deployment on Render.com.

## ✨ Features

- **Subdomain Availability Checker**: Check if your desired subdomain is available
- **Multiple Domain Extensions**: Support for 20+ domain extensions including:
  - `.net`, `.cloud`, `.dev`, `.online`, `.is.dev`
  - `.app`, `.tech`, `.studio`, `.digital`, `.world`
  - `.space`, `.site`, `.store`, `.shop`, `.blog`
  - `.io`, `.ai`, `.co`, `.me`, `.xyz`
- **DNS Configuration Generator**: Automatically generate DNS records for Render.com
- **Forwarding Options**: Support for 301, 302 redirects and path forwarding
- **Smart Suggestions**: Get alternative subdomain suggestions if your choice is taken
- **Real-time Validation**: Instant feedback on subdomain input
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **One-Click Deployment**: Ready to deploy with a single click on Render.com

## 🚀 Quick Start

### Option 1: Deploy to Render.com (Recommended)

1. **Fork this repository** on GitHub
2. **Go to Render.com** and connect your GitHub account
3. **Select this repository** and click "New Web Service"
4. **Keep the default settings** (Node.js, Free plan)
5. **Click "Create Web Service"**
6. **Wait for deployment** (usually takes 2-3 minutes)
7. **Visit your app** at the provided URL

### Option 2: Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/subdomain-creator.git
   cd subdomain-creator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

## 📋 How to Use

### 1. Check Subdomain Availability

1. Enter your desired subdomain name (3-63 characters)
2. Select a domain extension from the dropdown
3. Click "Check Availability"
4. View results and get suggestions if needed

### 2. Generate DNS Configuration

1. After checking availability, enter your target URL (e.g., `https://your-app.render.com`)
2. Select a forwarding type:
   - **301 Permanent Redirect**: Best for SEO, tells search engines the move is permanent
   - **302 Temporary Redirect**: For temporary moves
   - **Path Forwarding**: Forward specific paths to different destinations
3. Click "Generate DNS Config"
4. Copy the DNS records and add them to your domain registrar

### 3. Deploy with Custom Domain

1. Add your custom domain in Render dashboard
2. Update DNS records with the generated configuration
3. Wait for SSL certificate issuance (5-30 minutes)
4. Your custom domain is now live!

## 🔧 DNS Configuration Examples

### Basic Setup
```
Type: CNAME
Name: @
Value: cname.render.com
TTL: 3600

Type: CNAME  
Name: www
Value: cname.render.com
TTL: 3600
```

### Subdomain Setup
```
Type: CNAME
Name: app
Value: cname.render.com
TTL: 3600
```

## 🌐 Supported Domain Extensions

| Extension | Best For | Notes |
|-----------|----------|-------|
| .net | Networks, tech | Classic TLD |
| .cloud | Cloud services | Modern tech |
| .dev | Developers | Requires HTTPS |
| .online | Online presence | Generic purpose |
| .is.dev | Development projects | Subdomain-style |
| .app | Applications | Requires HTTPS |
| .tech | Technology | Tech-focused |
| .io | Startups | Popular with devs |
| .ai | AI projects | Growing fast |
| .co | Companies | Alternative to .com |

## 🛠 Customization

### Adding New Domain Extensions

Edit `src/server.js` and add to the `DOMAIN_EXTENSIONS` array:

```javascript
const DOMAIN_EXTENSIONS = [
  '.net', '.cloud', '.dev', '.online', '.is.dev',
  '.your-extension' // Add your new extension here
];
```

### Custom Styling

Modify `styles/main.css` to change colors, fonts, and layout:

```css
:root {
  --primary-color: #5e72e4;  /* Change primary color */
  --secondary-color: #2dce89; /* Change secondary color */
}
```

### API Integration

To integrate with real domain APIs, modify the validation endpoint in `src/server.js`:

```javascript
// Replace the mock validation with real API calls
app.post('/api/domains/validate', async (req, res) => {
  // Call your domain provider API here
  const response = await fetch(`https://api.provider.com/check?domain=${domain}`);
  const data = await response.json();
  res.json(data);
});
```

## 🔒 Security Features

- **CORS Protection**: Configured for secure cross-origin requests
- **Helmet.js**: Security headers for XSS protection
- **Input Validation**: Client and server-side validation
- **HTTPS Required**: Secure connection enforced
- **Rate Limiting**: Optional rate limiting configuration

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)  
- Mobile (320px - 767px)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [FAQ](#faq) section below
2. Search existing [GitHub Issues](https://github.com/yourusername/subdomain-creator/issues)
3. Create a new issue with detailed information

## FAQ

### Q: Why do I get "Domain may be taken" even when it's available?
A: The app uses simulated availability checking. For production, integrate with real DNS APIs.

### Q: How long does DNS propagation take?
A: Usually 5-30 minutes, but can take up to 48 hours in rare cases.

### Q: Can I use this for other hosting providers?
A: Yes, but you'll need to modify the DNS record values in the configuration generator.

### Q: Is SSL automatically configured?
A: Yes, Render.com automatically provides SSL certificates for custom domains.

### Q: What's the difference between 301 and 302 redirects?
A: 301 is permanent (better for SEO), 302 is temporary (preserves original URL in search results).

## 🌟 Star this Project

If you find this project helpful, please star it on GitHub!

---

Built with ❤️ for the Render.com community