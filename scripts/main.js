class SubdomainCreator {
    constructor() {
        this.domainExtensions = [];
        this.currentDomain = null;
        this.init();
    }

    async init() {
        await this.loadDomainExtensions();
        this.setupEventListeners();
        this.setupSmoothScroll();
    }

    async loadDomainExtensions() {
        try {
            const response = await fetch('/api/domains/extensions');
            const data = await response.json();
            this.domainExtensions = data.extensions;
            this.populateExtensionSelect();
        } catch (error) {
            console.error('Error loading domain extensions:', error);
            this.showError('Failed to load domain extensions');
        }
    }

    populateExtensionSelect() {
        const select = document.getElementById('extension');
        select.innerHTML = '<option value="">Select an extension</option>';
        
        this.domainExtensions.forEach(ext => {
            const option = document.createElement('option');
            option.value = ext;
            option.textContent = ext;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        // Check availability button
        document.getElementById('checkBtn').addEventListener('click', () => {
            this.checkAvailability();
        });

        // Enter key on subdomain input
        document.getElementById('subdomain').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAvailability();
            }
        });

        // Generate DNS config button
        document.getElementById('generateDnsBtn').addEventListener('click', () => {
            this.generateDnsConfig();
        });

        // Real-time subdomain validation
        document.getElementById('subdomain').addEventListener('input', (e) => {
            this.validateSubdomainInput(e.target);
        });

        // Extension change
        document.getElementById('extension').addEventListener('change', () => {
            this.hideAvailabilityResult();
            this.hideSuggestions();
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    validateSubdomainInput(input) {
        const value = input.value.trim();
        const errors = [];

        if (value.length > 0) {
            if (value.length < 3) {
                errors.push('Too short (min 3 characters)');
            }
            
            if (value.length > 63) {
                errors.push('Too long (max 63 characters)');
            }
            
            if (!/^[a-zA-Z0-9-]+$/.test(value)) {
                errors.push('Invalid characters');
            }
            
            if (value.startsWith('-') || value.endsWith('-')) {
                errors.push('Cannot start/end with hyphen');
            }
        }

        this.updateInputValidation(input, errors);
        return errors.length === 0;
    }

    updateInputValidation(input, errors) {
        input.style.borderColor = errors.length > 0 ? 'var(--danger-color)' : 'var(--border-color)';
        
        // Update or create error message
        let errorDiv = input.parentNode.querySelector('.validation-error');
        if (errors.length > 0) {
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'validation-error';
                errorDiv.style.cssText = 'color: var(--danger-color); font-size: 0.875rem; margin-top: 0.25rem;';
                input.parentNode.appendChild(errorDiv);
            }
            errorDiv.textContent = errors.join(', ');
        } else if (errorDiv) {
            errorDiv.remove();
        }
    }

    async checkAvailability() {
        const subdomain = document.getElementById('subdomain').value.trim();
        const extension = document.getElementById('extension').value;

        if (!subdomain || !extension) {
            this.showError('Please enter both subdomain and select an extension');
            return;
        }

        if (!this.validateSubdomainInput(document.getElementById('subdomain'))) {
            return;
        }

        const btn = document.getElementById('checkBtn');
        this.setButtonLoading(btn, true);

        try {
            const response = await fetch('/api/domains/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subdomain, extension })
            });

            const data = await response.json();
            
            if (!data.valid) {
                this.showValidationErrors(data.errors);
            } else {
                this.showAvailabilityResult(data);
                if (!data.available) {
                    await this.loadSuggestions(subdomain, extension);
                }
            }
        } catch (error) {
            console.error('Error checking availability:', error);
            this.showError('Failed to check domain availability');
        } finally {
            this.setButtonLoading(btn, false);
        }
    }

    async loadSuggestions(subdomain, extension) {
        try {
            const response = await fetch(`/api/domains/suggestions?keyword=${subdomain}&extension=${extension}`);
            const data = await response.json();
            this.displaySuggestions(data.suggestions);
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }

    displaySuggestions(suggestions) {
        const container = document.getElementById('suggestions');
        const list = container.querySelector('.suggestion-list');
        
        list.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <span class="suggestion-domain">${suggestion}</span>
                <span class="suggestion-status">Click to check</span>
            `;
            
            item.addEventListener('click', () => {
                const parts = suggestion.split('.');
                const newSubdomain = parts.slice(0, -1).join('.');
                const newExtension = '.' + parts[parts.length - 1];
                
                document.getElementById('subdomain').value = newSubdomain;
                document.getElementById('extension').value = newExtension;
                
                this.checkAvailability();
            });
            
            list.appendChild(item);
        });
        
        container.style.display = 'block';
    }

    showAvailabilityResult(data) {
        const resultDiv = document.getElementById('availabilityResult');
        resultDiv.style.display = 'block';
        
        if (data.available) {
            resultDiv.className = 'result-box success';
            resultDiv.innerHTML = `
                <h3><i class="fas fa-check-circle"></i> Domain Available!</h3>
                <p><strong>${data.domain}</strong> is available for registration.</p>
                <p>You can proceed with DNS configuration.</p>
            `;
            this.currentDomain = data.domain;
        } else {
            resultDiv.className = 'result-box warning';
            resultDiv.innerHTML = `
                <h3><i class="fas fa-exclamation-triangle"></i> Domain May Be Taken</h3>
                <p><strong>${data.domain}</strong> appears to be taken or unavailable.</p>
                <p>Check the suggestions below for alternatives.</p>
            `;
        }
    }

    showValidationErrors(errors) {
        const resultDiv = document.getElementById('availabilityResult');
        resultDiv.style.display = 'block';
        resultDiv.className = 'result-box error';
        resultDiv.innerHTML = `
            <h3><i class="fas fa-times-circle"></i> Validation Errors</h3>
            <ul>
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
    }

    async generateDnsConfig() {
        const subdomain = document.getElementById('subdomain').value.trim();
        const extension = document.getElementById('extension').value;
        const targetUrl = document.getElementById('targetUrl').value.trim();
        const forwardType = document.querySelector('input[name="forwardType"]:checked').value;

        if (!subdomain || !extension) {
            this.showError('Please first check domain availability');
            return;
        }

        if (!targetUrl) {
            this.showError('Please enter a target URL');
            return;
        }

        // Validate URL
        try {
            new URL(targetUrl);
        } catch {
            this.showError('Please enter a valid URL (e.g., https://your-app.render.com)');
            return;
        }

        const btn = document.getElementById('generateDnsBtn');
        this.setButtonLoading(btn, true);

        try {
            const response = await fetch('/api/dns/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    subdomain, 
                    extension, 
                    targetUrl, 
                    type: forwardType 
                })
            });

            const data = await response.json();
            this.displayDnsConfig(data);
        } catch (error) {
            console.error('Error generating DNS config:', error);
            this.showError('Failed to generate DNS configuration');
        } finally {
            this.setButtonLoading(btn, false);
        }
    }

    displayDnsConfig(config) {
        const resultDiv = document.getElementById('dnsResult');
        resultDiv.style.display = 'block';
        
        let forwardingInfo = '';
        if (config.forwarding) {
            forwardingInfo = `
                <div class="dns-record">
                    <h4><i class="fas fa-arrow-right"></i> Forwarding Configuration</h4>
                    <p><strong>Type:</strong> ${config.forwarding.type} Redirect</p>
                    <p><strong>From:</strong> <code>${config.forwarding.from}</code></p>
                    <p><strong>To:</strong> <code>${config.forwarding.to}</code></p>
                </div>
            `;
        }

        if (config.pathForwarding) {
            forwardingInfo += `
                <div class="dns-record">
                    <h4><i class="fas fa-route"></i> Path Forwarding</h4>
                    <p><strong>Source:</strong> <code>${config.pathForwarding.source}</code></p>
                    <p><strong>Destination:</strong> <code>${config.pathForwarding.destination}</code></p>
                </div>
            `;
        }

        resultDiv.innerHTML = `
            <h3><i class="fas fa-cog"></i> DNS Configuration for ${config.domain}</h3>
            
            <div class="dns-record">
                <h4><i class="fas fa-globe"></i> DNS Records</h4>
                ${config.records.map(record => `
                    <p><strong>${record.type} ${record.name}:</strong> <code>${record.value}</code> (TTL: ${record.ttl})</p>
                `).join('')}
            </div>
            
            ${forwardingInfo}
            
            <div class="dns-record">
                <h4><i class="fas fa-info-circle"></i> Setup Instructions</h4>
                <ol>
                    <li>Go to your domain registrar's DNS management</li>
                    <li>Add the CNAME records listed above</li>
                    <li>In Render dashboard, add custom domain: <code>${config.domain}</code></li>
                    <li>Wait for DNS propagation (5-30 minutes)</li>
                    <li>Verify SSL certificate is issued</li>
                </ol>
            </div>
            
            <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(\`${this.formatDnsConfig(config)}\`)">
                <i class="fas fa-copy"></i> Copy Configuration
            </button>
        `;
    }

    formatDnsConfig(config) {
        let text = `DNS Configuration for ${config.domain}\n`;
        text += `=====================================\n\n`;
        text += `DNS Records:\n`;
        config.records.forEach(record => {
            text += `${record.type} ${record.name}: ${record.value} (TTL: ${record.ttl})\n`;
        });
        
        if (config.forwarding) {
            text += `\nForwarding:\n`;
            text += `Type: ${config.forwarding.type} Redirect\n`;
            text += `From: ${config.forwarding.from}\n`;
            text += `To: ${config.forwarding.to}\n`;
        }
        
        return text;
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            button.innerHTML = '<span class="spinner"></span> Processing...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            // Restore original button content
            if (button.id === 'checkBtn') {
                button.innerHTML = '<i class="fas fa-search"></i> Check Availability';
            } else if (button.id === 'generateDnsBtn') {
                button.innerHTML = '<i class="fas fa-cog"></i> Generate DNS Config';
            }
        }
    }

    showError(message) {
        const resultDiv = document.getElementById('availabilityResult');
        resultDiv.style.display = 'block';
        resultDiv.className = 'result-box error';
        resultDiv.innerHTML = `
            <h3><i class="fas fa-exclamation-circle"></i> Error</h3>
            <p>${message}</p>
        `;
    }

    hideAvailabilityResult() {
        document.getElementById('availabilityResult').style.display = 'none';
    }

    hideSuggestions() {
        document.getElementById('suggestions').style.display = 'none';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SubdomainCreator();
});

// Add some utility functions
window.utils = {
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // Show success message
            const toast = document.createElement('div');
            toast.className = 'toast success';
            toast.textContent = 'Copied to clipboard!';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--secondary-color);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: var(--shadow-lg);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
};

// Add additional animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);