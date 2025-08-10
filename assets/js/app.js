/**
 * Enhanced Portfolio Application - Main Logic Controller
 * Handles loading, routing, translations, and content management
 */

class PortfolioApp {
    
    constructor() {
        // Initialize application state
        this.currentLang = localStorage.getItem('portfolio-lang') || 'en';
        this.currentTheme = localStorage.getItem('portfolio-theme') || 'dark';
        this.translations = {};
        this.currentPath = window.location.hash.substring(1) || 'home';
        
        // Cache DOM elements for performance
        this.elements = {
            themeToggle: document.getElementById('themeToggle'),
            langToggle: document.getElementById('langToggle'),
            navCommands: document.querySelectorAll('.nav-command'),
            pages: document.querySelectorAll('.page'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            typedText: document.getElementById('typedText'),
            cursor: document.getElementById('cursor'),
            // Logo elements
            logoArt: document.getElementById('logoArt'),
            logoDark: document.getElementById('logoDark'),
            logoLight: document.getElementById('logoLight')
        };
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize the application with proper loading sequence
     */
    async init() {
        try {
            // Show loading spinner
            this.showLoadingSpinner();
            
            // Step 1: Initialize logo system
            this.initializeLogos();

            // Step 2: Load all resources in parallel for faster loading
            await Promise.all([
                this.loadTranslations(),
                this.preloadContent(),
                this.preloadLogos(), // Preload logo images
                this.simulateMinimumLoadTime() // Ensure smooth UX
            ]);
            
            // Step 3: Set up initial UI state
            this.initializeTheme();
            this.initializeLanguage();
            
            // Step 4: Set up event handlers
            this.initializeEventHandlers();
            
            // Step 5: Handle routing
            this.initializeRouting();
            
            // Step 6: Start typing animation
            this.startTypingAnimation();
            
            // Step 7: Hide loading spinner
            this.hideLoadingSpinner();
            
            console.log('Portfolio application initialized successfully');
            
        } catch (error) {
            console.error('Error initializing application:', error);
            this.hideLoadingSpinner();
        }
    }
    
    /**
     * Show loading spinner with smooth animation
     */
    showLoadingSpinner() {
        const spinner = this.elements.loadingSpinner;
        if (spinner) {
            spinner.style.display = 'flex';
            spinner.style.opacity = '1';
        }
    }
    
    /**
     * Hide loading spinner with smooth animation
     */
    hideLoadingSpinner() {
        const spinner = this.elements.loadingSpinner;
        if (spinner) {
            spinner.style.opacity = '0';
            setTimeout(() => {
                spinner.style.display = 'none';
            }, 500);
        }
    }
    
    /**
     * Simulate minimum load time for smooth UX
     */
    simulateMinimumLoadTime() {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
    

    /**
 * Initialize logo system
 */
initializeLogos() {
    if (!this.elements.logoDark || !this.elements.logoLight) {
        console.warn('Logo elements not found, skipping logo initialization');
        return;
    }
    
    // Set up logo error handling
    this.elements.logoDark.addEventListener('error', () => {
        console.error('Failed to load dark theme logo');
        this.handleLogoError('dark');
    });
    
    this.elements.logoLight.addEventListener('error', () => {
        console.error('Failed to load light theme logo');
        this.handleLogoError('light');
    });
    
    // Set up logo load events
    this.elements.logoDark.addEventListener('load', () => {
        this.elements.logoDark.classList.remove('loading');
    });
    
    this.elements.logoLight.addEventListener('load', () => {
        this.elements.logoLight.classList.remove('loading');
    });
    
    // Add loading class initially
    this.elements.logoDark.classList.add('loading');
    this.elements.logoLight.classList.add('loading');
}

/**
 * Preload logo images for better performance
 */
async preloadLogos() {
    const logoPromises = [];
    
    // Preload dark logo
    if (this.elements.logoDark && this.elements.logoDark.src) {
        logoPromises.push(this.preloadImage(this.elements.logoDark.src));
    }
    
    // Preload light logo
    if (this.elements.logoLight && this.elements.logoLight.src) {
        logoPromises.push(this.preloadImage(this.elements.logoLight.src));
    }
    
    try {
        await Promise.all(logoPromises);
        console.log('All logo images preloaded successfully');
    } catch (error) {
        console.warn('Some logo images failed to preload:', error);
    }
}

/**
 * Preload a single image
 */
preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Handle logo loading errors
 */
handleLogoError(theme) {
    console.warn(`${theme} theme logo failed to load, using fallback`);
    
    // Create fallback text logo
    const fallbackLogo = this.createFallbackLogo(theme);
    
    if (theme === 'dark' && this.elements.logoDark) {
        this.elements.logoDark.style.display = 'none';
        this.elements.logoDark.parentNode.appendChild(fallbackLogo);
    } else if (theme === 'light' && this.elements.logoLight) {
        this.elements.logoLight.style.display = 'none';
        this.elements.logoLight.parentNode.appendChild(fallbackLogo);
    }
}

/**
 * Create fallback text logo
 */
createFallbackLogo(theme) {
    const fallback = document.createElement('div');
    fallback.className = `logo-fallback logo-${theme}`;
    fallback.textContent = 'ABDULLAH';
    
    // Apply fallback styles
    fallback.style.cssText = `
        font-family: var(--font-mono);
        font-size: clamp(2rem, 5vw, 4rem);
        font-weight: bold;
        color: ${theme === 'dark' ? '#00ff41' : '#0969da'};
        text-align: center;
        padding: 1rem;
        letter-spacing: 0.2em;
        text-shadow: 0 0 20px ${theme === 'dark' ? 'rgba(0, 255, 65, 0.4)' : 'rgba(9, 105, 218, 0.4)'};
        transition: all 0.5s ease;
        opacity: ${theme === 'dark' && this.currentTheme === 'dark' ? '1' : theme === 'light' && this.currentTheme === 'light' ? '1' : '0'};
        visibility: ${theme === 'dark' && this.currentTheme === 'dark' ? 'visible' : theme === 'light' && this.currentTheme === 'light' ? 'visible' : 'hidden'};
    `;
    
    return fallback;
}

/**
 * Update logo visibility based on current theme
 */
updateLogoVisibility() {
    if (!this.elements.logoDark || !this.elements.logoLight) return;
    
    if (this.currentTheme === 'dark') {
        // Show dark logo, hide light logo
        this.elements.logoDark.style.opacity = '1';
        this.elements.logoDark.style.visibility = 'visible';
        this.elements.logoDark.style.display = 'block';
        this.elements.logoLight.style.opacity = '0';
        this.elements.logoLight.style.visibility = 'hidden';
        this.elements.logoLight.style.display = 'none';
    } else {
        // Show light logo, hide dark logo
        this.elements.logoLight.style.opacity = '1';
        this.elements.logoLight.style.visibility = 'visible';
        this.elements.logoLight.style.display = 'block';
        this.elements.logoDark.style.opacity = '0';
        this.elements.logoDark.style.visibility = 'hidden';
        this.elements.logoDark.style.display = 'none';
    }
    
    // Update fallback logos if they exist
    const fallbackLogos = document.querySelectorAll('.logo-fallback');
    fallbackLogos.forEach(fallback => {
        if (fallback.classList.contains(`logo-${this.currentTheme}`)) {
            fallback.style.opacity = '1';
            fallback.style.visibility = 'visible';
            fallback.style.display = 'block';
        } else {
            fallback.style.opacity = '0';
            fallback.style.visibility = 'hidden';
            fallback.style.display = 'none';
        }
    });
}

/**
 * Add logo interaction effects
 */
addLogoInteractions() {
    if (this.elements.logoDark) {
        this.elements.logoDark.addEventListener('click', () => {
            this.animateLogoClick('dark');
        });
    }
    
    if (this.elements.logoLight) {
        this.elements.logoLight.addEventListener('click', () => {
            this.animateLogoClick('light');
        });
    }
}

/**
 * Animate logo click effect
 */
animateLogoClick(theme) {
    const logo = theme === 'dark' ? this.elements.logoDark : this.elements.logoLight;
    if (!logo) return;
    
    // Add click animation
    logo.style.transform = 'translateX(-50%) scale(0.95)';
    logo.style.filter = theme === 'dark' 
        ? 'drop-shadow(0 0 40px rgba(0, 255, 65, 0.8))'
        : 'drop-shadow(0 0 40px rgba(9, 105, 218, 0.8))';
    
    setTimeout(() => {
        logo.style.transform = 'translateX(-50%) scale(1)';
        logo.style.filter = theme === 'dark'
            ? 'drop-shadow(0 0 20px rgba(0, 255, 65, 0.4))'
            : 'drop-shadow(0 0 20px rgba(9, 105, 218, 0.4))';
    }, 150);
}
    /**
     * Load translation files with error handling
     */
    async loadTranslations() {
        const languages = ['en', 'de'];
        
        for (const lang of languages) {
            try {
                const response = await fetch(`translations/${lang}.json`);
                if (!response.ok) {
                    throw new Error(`Failed to load ${lang} translations`);
                }
                this.translations[lang] = await response.json();
            } catch (error) {
                console.error(`Error loading ${lang} translations:`, error);
                // Provide fallback structure
                this.translations[lang] = this.getFallbackTranslations(lang);
            }
        }
    }
    
    /**
     * Preload critical content files
     */
    async preloadContent() {
        const contentFiles = ['about', 'experience', 'projects', 'contact'];
        
        // Preload content files in parallel
        const contentPromises = contentFiles.map(async (fileName) => {
            try {
                const response = await fetch(`content/${fileName}.json`);
                if (response.ok) {
                    return response.json();
                }
            } catch (error) {
                console.log(`Content file ${fileName}.json not found, will use fallback`);
            }
            return null;
        });
        
        await Promise.all(contentPromises);
    }
    
    /**
     * Get fallback translations for critical functionality
     */
    getFallbackTranslations(lang) {
        const fallbacks = {
            en: {
                nav: { home: "[ home ]", about: "[ about ]", experience: "[ experience ]", projects: "[ projects ]", blog: "[ blog ]", contact: "[ contact ]" },
                terminal: { welcome: "Welcome to Abdullah's portfolio!", help_prompt: "Type 'help' for commands." },
                home: { subtitle: "Köthen, Germany" }
            },
            de: {
                nav: { home: "[ startseite ]", about: "[ über mich ]", experience: "[ erfahrung ]", projects: "[ projekte ]", blog: "[ blog ]", contact: "[ kontakt ]" },
                terminal: { welcome: "Willkommen zu Abdullahs Portfolio!", help_prompt: "Geben Sie 'help' ein." },
                home: { subtitle: "Köthen, Deutschland" }
            }
        };
        return fallbacks[lang] || fallbacks.en;
    }
    
    /**
     * Initialize theme system
     */
    initializeTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        if (this.elements.themeToggle) {
            this.elements.themeToggle.textContent = this.currentTheme === 'dark' ? '◐' : '◑';
        }
        
        // Set initial logo visibility
        this.updateLogoVisibility();
    }
    
    /**
     * Initialize language system
     */
    initializeLanguage() {
        document.body.setAttribute('data-lang', this.currentLang);
        if (this.elements.langToggle) {
            this.elements.langToggle.textContent = this.currentLang.toUpperCase();
        }
        this.updateAllTranslations();
    }
    
   /**
 * Set up all event handlers
 */
initializeEventHandlers() {
    // Theme toggle
    this.elements.themeToggle?.addEventListener('click', () => {
        this.toggleTheme();
    });
    
    // Language toggle
    this.elements.langToggle?.addEventListener('click', () => {
        this.toggleLanguage();
    });
    
    // Navigation handlers
    this.elements.navCommands.forEach(command => {
        command.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = command.getAttribute('data-page');
            this.navigateToPage(targetPage);
        });
    });
    
    // Quick action handlers
    const quickBtns = document.querySelectorAll('.quick-btn[data-page]');
    quickBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = btn.getAttribute('data-page');
            this.navigateToPage(targetPage);
        });
    });
    
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        this.handleRouteChange(hash);
    });
    
    // Add logo interactions
    this.addLogoInteractions();
}
    
    /**
     * Handle routing initialization
     */
    initializeRouting() {
        if (this.currentPath.startsWith('post/')) {
            const articleId = this.currentPath.replace('post/', '');
            this.loadBlogPost(articleId);
        } else if (this.currentPath && this.currentPath !== 'home') {
            this.navigateToPage(this.currentPath);
        }
    }
    
    /**
     * Handle route changes
     */
    handleRouteChange(hash) {
        if (hash.startsWith('post/')) {
            const articleId = hash.replace('post/', '');
            this.loadBlogPost(articleId);
        } else if (hash) {
            this.navigateToPage(hash);
        } else {
            this.navigateToPage('home');
        }
    }
    
    /**
     * Navigate to a specific page
     */
    navigateToPage(pageName) {
        // Update URL
        if (pageName !== 'home') {
            window.location.hash = pageName;
        } else {
            history.replaceState(null, null, window.location.pathname);
        }
        
        // Update navigation state
        this.updateNavigationState(pageName);
        
        // Show the correct page
        this.showPage(pageName);
        
        // Load page content
        this.loadPageContent(pageName);
        
        // Restart typing animation if returning to home
        if (pageName === 'home') {
            setTimeout(() => this.startTypingAnimation(), 100);
        }
    }
    
    /**
     * Update navigation visual state
     */
    updateNavigationState(pageName) {
        this.elements.navCommands.forEach(cmd => cmd.classList.remove('active'));
        const activeNav = document.querySelector(`[data-page="${pageName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
    }
    
    /**
     * Show the correct page
     */
    showPage(pageName) {
        this.elements.pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }
    
    /**
     * Load page-specific content
     */
    async loadPageContent(pageName) {
        const contentLoaders = {
            'about': () => this.loadAboutContent(),
            'experience': () => this.loadExperienceContent(),
            'projects': () => this.loadProjectsContent(),
            'services': () => this.loadServicesContent(),
            'contact': () => this.loadContactContent(),
            'blog': () => this.loadBlogList()
        };
        
        const loader = contentLoaders[pageName];
        if (loader) {
            try {
                await loader();
            } catch (error) {
                console.error(`Error loading content for ${pageName}:`, error);
                this.showContentError(pageName);
            }
        }
    }
    
    /**
     * Load About page content
     */
    async loadAboutContent() {
        try {
            const response = await fetch('content/about.json');
            if (response.ok) {
                const data = await response.json();
                this.renderAboutContent(data);
            } else {
                this.renderDefaultAboutContent();
            }
        } catch (error) {
            console.error('Error loading about content:', error);
            this.renderDefaultAboutContent();
        }
    }
    
    /**
     * Render About content
     */
    renderAboutContent(data) {
        const container = document.getElementById('aboutContent');
        if (!container || !data) return;
        
        const currentLang = this.currentLang;
        const content = data[currentLang] || data.en || {};
        
        container.innerHTML = `
            <div class="content-section">
                <h3>${content.bio_title || 'Professional Summary'}</h3>
                ${content.bio_paragraphs ? content.bio_paragraphs.map(p => `<p>${p}</p>`).join('') : '<p>Loading content...</p>'}
            </div>
            
            <div class="content-section">
                <h3>${content.education_title || 'Education'}</h3>
                ${content.education ? content.education.map(edu => `
                    <div class="timeline-item">
                        <div class="timeline-date">${edu.period}</div>
                        <div class="timeline-title">${edu.degree}</div>
                        <div class="timeline-company">${edu.institution}</div>
                        <div class="timeline-description">${edu.description}</div>
                    </div>
                `).join('') : '<p>Loading content...</p>'}
            </div>
            
            <div class="content-section">
                <h3>${content.skills_title || 'Technical Skills'}</h3>
                ${content.skills ? Object.entries(content.skills).map(([category, skills]) => `
                    <div class="skill-category">
                        <h4>${category}</h4>
                        <div class="skills-list">
                            ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                `).join('') : '<p>Loading content...</p>'}
            </div>
        `;
    }
    
    /**
     * Render default About content when JSON fails to load
     */
    renderDefaultAboutContent() {
        const container = document.getElementById('aboutContent');
        if (!container) return;
        
        container.innerHTML = `
            <div class="content-section">
                <h3>Professional Summary</h3>
                <p>Biomedical Engineer currently pursuing Master's degree at Hochschule Anhalt, specializing in medical software development and healthcare technology.</p>
                <p>Experienced in medical device management, Python development, and regulatory compliance with a focus on improving patient care through innovative technology solutions.</p>
            </div>
        `;
    }
    
    /**
     * Load other content types with similar patterns
     */
    /**
     * Load Services page content
     */
    async loadServicesContent() {
        try {
            const response = await fetch('content/services.json');
            if (response.ok) {
                const data = await response.json();
                this.renderServicesContent(data);
            } else {
                this.renderDefaultServicesContent();
            }
        } catch (error) {
            console.error('Error loading services content:', error);
            this.renderDefaultServicesContent();
        }
    }
    
    /**
     * Render Services content
     */
    renderServicesContent(data) {
        const container = document.getElementById('servicesContent');
        if (!container || !data) return;
        
        const currentLang = this.currentLang;
        const content = data[currentLang] || data.en || {};
        
        let html = '';
        
        // Services overview
        if (content.services_overview) {
            html += `
                <div class="content-section">
                    <h3>${content.services_overview.title}</h3>
                    <p>${content.services_overview.description}</p>
                </div>
            `;
        }
        
        // Services list
        if (content.services && content.services.length > 0) {
            html += '<div class="services-grid">';
            content.services.forEach(service => {
                html += `
                    <div class="service-card">
                        <h4>${service.title}</h4>
                        <p class="service-description">${service.description}</p>
                        <div class="service-features">
                            <h5>What's included:</h5>
                            <ul>
                                ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="service-pricing">
                            <span class="price">${service.pricing}</span>
                            <span class="duration">${service.duration}</span>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Process section
        if (content.process) {
            html += `
                <div class="content-section">
                    <h3>${content.process.title}</h3>
                    <div class="process-steps">
                        ${content.process.steps.map((step, index) => `
                            <div class="process-step">
                                <div class="step-number">${index + 1}</div>
                                <div class="step-content">
                                    <h4>${step.title}</h4>
                                    <p>${step.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Contact CTA
        if (content.contact_cta) {
            html += `
                <div class="content-section cta-section">
                    <h3>${content.contact_cta.title}</h3>
                    <p>${content.contact_cta.description}</p>
                    <a href="#" class="cta-button" data-page="contact">${content.contact_cta.button_text}</a>
                </div>
            `;
        }
        
        container.innerHTML = html;
        
        // Add event listeners for CTA buttons
        const ctaButtons = container.querySelectorAll('.cta-button[data-page]');
        ctaButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = btn.getAttribute('data-page');
                this.navigateToPage(targetPage);
            });
        });
    }
    
    /**
     * Render default Services content
     */
    renderDefaultServicesContent() {
        const container = document.getElementById('servicesContent');
        if (!container) return;
        
        const isGerman = this.currentLang === 'de';
        
        container.innerHTML = `
            <div class="content-section">
                <h3>${isGerman ? 'Professionelle Dienstleistungen' : 'Professional Services'}</h3>
                <p>${isGerman ? 
                    'Ich biete spezialisierte Dienstleistungen in der Biomedizintechnik und Softwareentwicklung für Gesundheitseinrichtungen und Technologieunternehmen.' : 
                    'I offer specialized services in biomedical engineering and software development for healthcare facilities and technology companies.'
                }</p>
                
                <div class="services-grid">
                    <div class="service-card">
                        <h4>${isGerman ? 'Medizingeräte-Beratung' : 'Medical Device Consulting'}</h4>
                        <p>${isGerman ? 
                            'Expertenberatung zu Gerätewartung, Kalibrierung und Optimierung mit über 2 Jahren praktischer Erfahrung.' : 
                            'Expert consultation on device maintenance, calibration, and optimization with 2+ years of hands-on experience.'
                        }</p>
                        <div class="service-pricing">
                            <span class="price">${isGerman ? 'Ab €75/Stunde' : 'From €75/hour'}</span>
                        </div>
                    </div>
                    
                    <div class="service-card">
                        <h4>${isGerman ? 'Softwareentwicklung' : 'Software Development'}</h4>
                        <p>${isGerman ? 
                            'Maßgeschneiderte Lösungen für medizinische Anwendungen mit vollständiger regulatorischer Konformität.' : 
                            'Custom solutions for medical applications with full regulatory compliance.'
                        }</p>
                        <div class="service-pricing">
                            <span class="price">€2,500 - €15,000</span>
                        </div>
                    </div>
                    
                    <div class="service-card">
                        <h4>${isGerman ? 'Schulung & Training' : 'Training & Education'}</h4>
                        <p>${isGerman ? 
                            'Technische Schulungsprogramme für medizinische Fachkräfte und Technikerteams.' : 
                            'Technical training programs for medical professionals and technical teams.'
                        }</p>
                        <div class="service-pricing">
                            <span class="price">${isGerman ? '€500/Tag' : '€500/day'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="cta-section">
                    <h3>${isGerman ? 'Interesse an einer Zusammenarbeit?' : 'Interested in Working Together?'}</h3>
                    <p>${isGerman ? 
                        'Lassen Sie uns über Ihr Projekt sprechen und wie ich Ihnen bei der Erreichung Ihrer Ziele helfen kann.' : 
                        'Let\'s discuss your project and how I can help you achieve your goals.'
                    }</p>
                    <a href="#" class="cta-button" data-page="contact">${isGerman ? 'Kontakt aufnehmen' : 'Get In Touch'}</a>
                </div>
            </div>
        `;
        
        // Add event listeners
        const ctaButtons = container.querySelectorAll('.cta-button[data-page]');
        ctaButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = btn.getAttribute('data-page');
                this.navigateToPage(targetPage);
            });
        });
    }

    async loadExperienceContent() {
        // Similar implementation for experience
        const container = document.getElementById('experienceContent');
        if (container) {
            container.innerHTML = '<div class="content-section"><p>Loading professional experience...</p></div>';
        }
    }
    
    async loadProjectsContent() {
        // Similar implementation for projects
        const container = document.getElementById('projectsContent');
        if (container) {
            container.innerHTML = '<div class="content-section"><p>Loading projects...</p></div>';
        }
    }
    
    /**
     * Load Contact page content
     */
    async loadContactContent() {
    try {
        console.log('Loading contact content...'); // Debug line
        const response = await fetch('content/contact.json');
        console.log('Response:', response); // Debug line
        
        if (response.ok) {
            const data = await response.json();
            console.log('Contact data loaded:', data); // Debug line
            this.renderContactContent(data);
        } else {
            console.log('Failed to load contact.json, using default content');
            this.renderDefaultContactContent();
        }
    } catch (error) {
        console.error('Error loading contact content:', error);
        this.renderDefaultContactContent();
    }
}

    /**
     * Render Contact content
     */
    renderContactContent(data) {
        const container = document.getElementById('contactContent');
        if (!container || !data) return;
        
        const currentLang = this.currentLang;
        const content = data[currentLang] || data.en || {};
        
        const html = `
            <div class="contact-layout">
                <!-- Contact Information -->
                <div class="contact-info-section">
                    <div class="contact-card">
                        <h3>Get In Touch</h3>
                        <div class="contact-methods">
                            <div class="contact-method">
                                <div class="contact-icon icon-email"></div>
                                <div class="contact-details">
                                    <h4>Email</h4>
                                    <a href="mailto:${content.contact_info?.email || 'Abdullah.Hemdan@outlook.com'}">${content.contact_info?.email || 'Abdullah.Hemdan@outlook.com'}</a>
                                    <p>Best for detailed project discussions</p>
                                </div>
                            </div>
                            
                            <div class="contact-method">
                                <div class="contact-icon icon-phone"></div>
                                <div class="contact-details">
                                    <h4>Phone</h4>
                                    <a href="tel:${content.contact_info?.phone || '+4915207547899'}">${content.contact_info?.phone || '+49 152 07547899'}</a>
                                    <p>Available for urgent matters</p>
                                </div>
                            </div>
                            
                            <div class="contact-method">
                                <div class="contact-icon icon-location"></div>
                                <div class="contact-details">
                                    <h4>Location</h4>
                                    <span>${content.contact_info?.location || 'Köthen, Sachsen-Anhalt, Germany'}</span>
                                    <p>Open to remote collaboration</p>
                                </div>
                            </div>
                            
                            <div class="contact-method">
                                <div class="contact-icon icon-clock"></div>
                                <div class="contact-details">
                                    <h4>Response Time</h4>
                                    <span>Within 24 hours</span>
                                    <p>Monday-Friday, 9:00-17:00 CET</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Social Links -->
                    <div class="contact-card">
                        <h3>Connect With Me</h3>
                        <div class="social-connect">
                            <a href="${content.contact_info?.linkedin || 'https://linkedin.com/in/abdullah-hemdan'}" class="social-connect-link" target="_blank">
                                <div class="social-icon icon-linkedin"></div>
                                <div class="social-details">
                                    <h4>LinkedIn</h4>
                                    <p>Professional networking</p>
                                </div>
                            </a>
                            
                            <a href="${content.contact_info?.xing || 'https://xing.com/profile/Abdullah_Hemdan'}" class="social-connect-link" target="_blank">
                                <div class="social-icon icon-xing"></div>
                                <div class="social-details">
                                    <h4>XING</h4>
                                    <p>German professional network</p>
                                </div>
                            </a>
                            
                            <a href="${content.contact_info?.github || 'https://github.com/AbdullahHemdan'}" class="social-connect-link" target="_blank">
                                <div class="social-icon icon-github"></div>
                                <div class="social-details">
                                    <h4>GitHub</h4>
                                    <p>View my code repositories</p>
                                </div>
                            </a>
                        </div>
                    </div>
                    
                    <!-- Specializations -->
                    ${content.specializations ? `
                    <div class="contact-card">
                        <h3>Specializations</h3>
                        <div class="specializations-list">
                            ${content.specializations.map(spec => `
                                <div class="specialization-item">
                                    <h4>${spec.title}</h4>
                                    <p>${spec.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Availability -->
                    <div class="contact-card availability-card">
                        <h3>Current Availability</h3>
                        <div class="availability-status">
                            <div class="status-indicator available"></div>
                            <span>${content.contact_info?.availability || 'Available for opportunities'}</span>
                        </div>
                        ${content.opportunities ? `
                        <div class="availability-details">
                            ${content.opportunities.types.map(type => `
                                <div class="availability-item">
                                    <div class="availability-icon ${type.type.includes('Internship') || type.type.includes('Praktikum') ? 'icon-education' : type.type.includes('Working') || type.type.includes('Werkstudent') ? 'icon-work' : 'icon-research'}"></div>
                                    <div class="availability-content">
                                        <h4>${type.type}</h4>
                                        <p>${type.description}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Contact Form -->
                <div class="contact-form-section">
                    <div class="contact-form-card">
                        <h3>Send Me a Message</h3>
                        <p class="form-description">Have a project in mind? Let's discuss how we can work together to bring your ideas to life.</p>
                        
                        <form id="contactForm" class="contact-form" novalidate>
                            <div class="form-group">
                                <label for="fullName">Full Name *</label>
                                <input type="text" id="fullName" name="fullName" required>
                                <span class="error-message" id="fullNameError"></span>
                            </div>
                            
                            <div class="form-group">
                                <label for="email">Email Address *</label>
                                <input type="email" id="email" name="email" required>
                                <span class="error-message" id="emailError"></span>
                            </div>
                            
                            <div class="form-group">
                                <label for="company">Company/Organization</label>
                                <input type="text" id="company" name="company">
                            </div>
                            
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" name="phone">
                            </div>
                            
                            <div class="form-group">
                                <label for="projectType">Project Type *</label>
                                <select id="projectType" name="projectType" required>
                                    <option value="">Select project type</option>
                                    <option value="internship">Internship Opportunity</option>
                                    <option value="working-student">Working Student Position</option>
                                    <option value="consulting">Medical Device Consulting</option>
                                    <option value="software-development">Software Development</option>
                                    <option value="training">Training & Education</option>
                                    <option value="research">Research Collaboration</option>
                                    <option value="other">Other</option>
                                </select>
                                <span class="error-message" id="projectTypeError"></span>
                            </div>
                            
                            <div class="form-group">
                                <label for="budget">Budget Range</label>
                                <select id="budget" name="budget">
                                    <option value="">Select budget range</option>
                                    <option value="under-5k">Under €5,000</option>
                                    <option value="5k-15k">€5,000 - €15,000</option>
                                    <option value="15k-30k">€15,000 - €30,000</option>
                                    <option value="30k-plus">€30,000+</option>
                                    <option value="negotiable">Negotiable</option>
                                    <option value="na">Not Applicable</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="timeline">Project Timeline</label>
                                <select id="timeline" name="timeline">
                                    <option value="">Select timeline</option>
                                    <option value="asap">As soon as possible</option>
                                    <option value="1-month">Within 1 month</option>
                                    <option value="2-3-months">2-3 months</option>
                                    <option value="3-6-months">3-6 months</option>
                                    <option value="6-plus-months">6+ months</option>
                                    <option value="flexible">Flexible</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="message">Project Description *</label>
                                <textarea id="message" name="message" rows="6" required placeholder="Please describe your project, requirements, and any specific goals you'd like to achieve..."></textarea>
                                <span class="error-message" id="messageError"></span>
                            </div>
                            
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="newsletter" name="newsletter">
                                    <span class="checkmark"></span>
                                    I'd like to receive occasional updates about your work and insights
                                </label>
                            </div>
                            
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="privacy" name="privacy" required>
                                    <span class="checkmark"></span>
                                    I agree to the processing of my personal data for communication purposes *
                                </label>
                                <span class="error-message" id="privacyError"></span>
                            </div>
                            
                            <button type="submit" class="submit-btn" id="submitBtn">
                                <span class="btn-text">Send Message</span>
                                <span class="btn-loading" style="display: none;">
                                    <span class="loading-spinner"></span>
                                    Sending...
                                </span>
                            </button>
                            
                            <div class="form-status" id="formStatus" style="display: none;"></div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Initialize contact form after content is loaded
        this.initializeContactForm();
    }

    /**
     * Render default Contact content when JSON fails to load
     */
    renderDefaultContactContent() {
        const container = document.getElementById('contactContent');
        if (!container) return;
        
        const isGerman = this.currentLang === 'de';
        
        container.innerHTML = `
            <div class="contact-layout">
                <div class="contact-info-section">
                    <div class="contact-card">
                        <h3>${isGerman ? 'Kontakt aufnehmen' : 'Get In Touch'}</h3>
                        <div class="contact-methods">
                            <div class="contact-method">
                                <div class="contact-icon icon-email"></div>
                                <div class="contact-details">
                                    <h4>Email</h4>
                                    <a href="mailto:Abdullah.Hemdan@outlook.com">Abdullah.Hemdan@outlook.com</a>
                                    <p>${isGerman ? 'Am besten für detaillierte Projektdiskussionen' : 'Best for detailed project discussions'}</p>
                                </div>
                            </div>
                            
                            <div class="contact-method">
                                <div class="contact-icon icon-phone"></div>
                                <div class="contact-details">
                                    <h4>${isGerman ? 'Telefon' : 'Phone'}</h4>
                                    <a href="tel:+4915207547899">+49 152 07547899</a>
                                    <p>${isGerman ? 'Verfügbar für dringende Angelegenheiten' : 'Available for urgent matters'}</p>
                                </div>
                            </div>
                            
                            <div class="contact-method">
                                <div class="contact-icon icon-location"></div>
                                <div class="contact-details">
                                    <h4>${isGerman ? 'Standort' : 'Location'}</h4>
                                    <span>${isGerman ? 'Köthen, Sachsen-Anhalt, Deutschland' : 'Köthen, Sachsen-Anhalt, Germany'}</span>
                                    <p>${isGerman ? 'Offen für Remote-Zusammenarbeit' : 'Open to remote collaboration'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="contact-card availability-card">
                        <h3>${isGerman ? 'Aktuelle Verfügbarkeit' : 'Current Availability'}</h3>
                        <div class="availability-status">
                            <div class="status-indicator available"></div>
                            <span>${isGerman ? 'Verfügbar für Gelegenheiten' : 'Available for opportunities'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="contact-form-section">
                    <div class="contact-form-card">
                        <h3>${isGerman ? 'Nachricht senden' : 'Send Me a Message'}</h3>
                        <p class="form-description">${isGerman ? 'Haben Sie ein Projekt im Kopf? Lassen Sie uns besprechen, wie wir zusammenarbeiten können.' : 'Have a project in mind? Let\'s discuss how we can work together.'}</p>
                        
                        <form id="contactForm" class="contact-form">
                            <div class="form-group">
                                <label for="fullName">${isGerman ? 'Vollständiger Name' : 'Full Name'} *</label>
                                <input type="text" id="fullName" name="fullName" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="email">${isGerman ? 'E-Mail-Adresse' : 'Email Address'} *</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="message">${isGerman ? 'Nachricht' : 'Message'} *</label>
                                <textarea id="message" name="message" rows="6" required placeholder="${isGerman ? 'Beschreiben Sie Ihr Projekt...' : 'Describe your project...'}"></textarea>
                            </div>
                            
                            <button type="submit" class="submit-btn">
                                ${isGerman ? 'Nachricht senden' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize contact form after content is loaded
        this.initializeContactForm();
    }

    /**
     * Initialize contact form functionality
     */
    initializeContactForm() {
        const contactForm = document.getElementById('contactForm');
        
        if (contactForm) {
            // Remove existing event listeners to prevent duplicates
            const newForm = contactForm.cloneNode(true);
            contactForm.parentNode.replaceChild(newForm, contactForm);
            
            // Add new event listener
            newForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Basic form handling
                const formStatus = document.getElementById('formStatus');
                if (formStatus) {
                    formStatus.textContent = 'Thank you for your message! I\'ll get back to you within 24 hours.';
                    formStatus.className = 'form-status success';
                    formStatus.style.display = 'block';
                    
                    // Reset form
                    newForm.reset();
                    
                    // Hide message after 5 seconds
                    setTimeout(() => {
                        formStatus.style.display = 'none';
                    }, 5000);
                }
            });
        }
    }
    
    /**
     * Load blog list
     */
    async loadBlogList() {
        if (window.BlogApp) {
            window.blogApp = new BlogApp(this);
            await window.blogApp.loadBlogList();
        }
    }
    
    /**
     * Load specific blog post
     */
    async loadBlogPost(articleId) {
        this.navigateToPage('reading');
        if (window.blogApp) {
            await window.blogApp.loadArticle(articleId);
        }
    }
    
    /**
     * Show content loading error
     */
    showContentError(pageName) {
        const pageElement = document.getElementById(pageName);
        if (pageElement) {
            const container = pageElement.querySelector('[id$="Content"]');
            if (container) {
                container.innerHTML = `
                    <div class="content-section">
                        <h3>Content Loading Error</h3>
                        <p>Sorry, there was an error loading the content for this page. Please try refreshing the page.</p>
                    </div>
                `;
            }
        }
    }
    
    /**
     * Toggle theme with animation
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', this.currentTheme);
        this.elements.themeToggle.textContent = this.currentTheme === 'dark' ? '◐' : '◑';
        
        localStorage.setItem('portfolio-theme', this.currentTheme);
        
        // Update logo visibility
        this.updateLogoVisibility();
        
        // Update terminal if active
        const terminal = window.terminalApp;
        if (terminal && document.getElementById('home').classList.contains('active')) {
            terminal.addToTerminal(`Theme switched to ${this.currentTheme}`);
        }
    }
    
    /**
     * Toggle language with full update
     */
    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'de' : 'en';
        
        document.body.setAttribute('data-lang', this.currentLang);
        this.elements.langToggle.textContent = this.currentLang.toUpperCase();
        
        this.updateAllTranslations();
        this.updateResumeLinks();
        
        localStorage.setItem('portfolio-lang', this.currentLang);
        
        // Restart typing animation with new language
        if (document.getElementById('home').classList.contains('active')) {
            this.startTypingAnimation();
        }
        
        // Update terminal
        const terminal = window.terminalApp;
        if (terminal && document.getElementById('home').classList.contains('active')) {
            terminal.addToTerminal(`Language switched to ${this.currentLang.toUpperCase()}`);
            terminal.refreshWelcomeMessages();
        }
        
        // Reload current page content in new language
        const currentPageElement = document.querySelector('.page.active');
        if (currentPageElement) {
            const pageName = currentPageElement.id;
            this.loadPageContent(pageName);
        }
    }
    
    /**
     * Update all elements with translations
     */
    updateAllTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });
    }
    
    /**
     * Update resume links based on language
     */
    updateResumeLinks() {
        const resumeLinks = document.querySelectorAll('a[href*="resume"]');
        resumeLinks.forEach(link => {
            const newHref = `documents/resume-${this.currentLang}.pdf`;
            link.setAttribute('href', newHref);
        });
    }
    
    /**
     * Get translation by key
     */
    getTranslation(key) {
        const keys = key.split('.');
        let current = this.translations[this.currentLang] || {};
        
        for (const k of keys) {
            current = current[k];
            if (!current) {
                // Fallback to English
                current = this.translations['en'] || {};
                for (const fallbackKey of keys) {
                    current = current[fallbackKey];
                    if (!current) return key; // Return key as fallback
                }
                break;
            }
        }
        
        return current;
    }
    
    /**
     * Typing animation for homepage slogan
     */
    startTypingAnimation() {
        if (!this.elements.typedText || !this.elements.cursor) return;
        
        const messages = this.currentLang === 'de' ? [
            'Willkommen zu meinem Portfolio',
            'Biomedizin-Ingenieur',
            'Software-Entwickler',
            'Innovationen im Gesundheitswesen'
        ] : [
            'Welcome to my portfolio',
            'Biomedical Engineer',
            'Software Developer', 
            'Healthcare Innovation'
        ];
        
        let messageIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const typeSpeed = 100;
        const deleteSpeed = 50;
        const pauseBetweenMessages = 2000;
        
        const type = () => {
            const currentMessage = messages[messageIndex];
            
            if (isDeleting) {
                this.elements.typedText.textContent = currentMessage.substring(0, charIndex - 1);
                charIndex--;
            } else {
                this.elements.typedText.textContent = currentMessage.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let speed = isDeleting ? deleteSpeed : typeSpeed;
            
            if (!isDeleting && charIndex === currentMessage.length) {
                speed = pauseBetweenMessages;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                messageIndex = (messageIndex + 1) % messages.length;
            }
            
            setTimeout(type, speed);
        };
        
        // Clear existing text and start animation
        this.elements.typedText.textContent = '';
        charIndex = 0;
        messageIndex = 0;
        isDeleting = false;
        
        setTimeout(type, 500);
    }
    
    /**
     * Initialize terminal when home page is active
     */
    initializeTerminal() {
        if (window.TerminalApp) {
            window.terminalApp = new TerminalApp(this);
        }
    }
}

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
});

/**
 * Initialize terminal when home page becomes active
 */
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const homeElement = document.getElementById('home');
            if (homeElement && homeElement.classList.contains('active')) {
                if (window.portfolioApp && !window.terminalApp) {
                    setTimeout(() => {
                        window.portfolioApp.initializeTerminal();
                    }, 100);
                }
            }
        });
    });
    
    const homeElement = document.getElementById('home');
    if (homeElement) {
        observer.observe(homeElement, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });
        
        // Initialize terminal if home is active on load
        if (homeElement.classList.contains('active')) {
            setTimeout(() => {
                window.portfolioApp.initializeTerminal();
            }, 1500);
        }
    }
});