/**
 * Portfolio Application - Main Logic Controller
 * 
 * This is the core application that manages state, translations, navigation,
 * and coordinates between different components. Think of this as the central
 * nervous system of your portfolio website.
 */

class PortfolioApp {
    constructor() {
        // Initialize application state
        this.currentLang = localStorage.getItem('portfolio-lang') || 'en';
        this.currentTheme = localStorage.getItem('portfolio-theme') || 'dark';
        this.translations = {};
        this.currentPath = window.location.hash.substring(1) || 'home';
        
        // DOM element references - caching for performance
        this.elements = {
            themeToggle: document.getElementById('themeToggle'),
            langToggle: document.getElementById('langToggle'),
            navCommands: document.querySelectorAll('.nav-command'),
            pages: document.querySelectorAll('.page'),
            bootSequence: document.getElementById('bootSequence')
        };
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize the application by setting up all components
     * This follows a specific order to ensure everything loads correctly
     */
    async init() {
        try {
            // Step 1: Load translations first (needed for everything else)
            await this.loadTranslations();
            
            // Step 2: Set up initial UI state
            this.initializeTheme();
            this.initializeLanguage();
            
            // Step 3: Set up event handlers
            this.initializeEventHandlers();
            
            // Step 4: Handle routing (if user came with a specific URL)
            this.initializeRouting();
            
            // Step 5: Start boot sequence animation
            this.startBootSequence();
            
            console.log('Portfolio application initialized successfully');
            
        } catch (error) {
            console.error('Error initializing application:', error);
            // Fallback: hide boot sequence and show main content
            this.elements.bootSequence.style.display = 'none';
        }
    }
    
    /**
     * Load translation files dynamically
     * This allows for easy addition of new languages without changing code
     */
    async loadTranslations() {
        const languages = ['en', 'de']; // Add more languages here as needed
        
        for (const lang of languages) {
            try {
                const response = await fetch(`translations/${lang}.json`);
                if (!response.ok) {
                    throw new Error(`Failed to load ${lang} translations`);
                }
                this.translations[lang] = await response.json();
            } catch (error) {
                console.error(`Error loading ${lang} translations:`, error);
                // Fallback: if translations fail to load, provide minimal structure
                if (!this.translations[lang]) {
                    this.translations[lang] = { nav: {}, home: {}, terminal: {} };
                }
            }
        }
    }
    
    /**
     * Set up the theme system
     * This handles both initial theme setup and the toggle functionality
     */
    initializeTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        this.elements.themeToggle.textContent = this.currentTheme === 'dark' ? '◐' : '◑';
    }
    
    /**
     * Set up the language system
     * This handles both initial language setup and translation updates
     */
    initializeLanguage() {
        document.body.setAttribute('data-lang', this.currentLang);
        this.elements.langToggle.textContent = this.currentLang.toUpperCase();
        this.updateAllTranslations();
    }
    
    /**
     * Set up all event handlers
     * Organizing event handlers in one place makes the code more maintainable
     */
    initializeEventHandlers() {
        // Theme toggle handler
        this.elements.themeToggle?.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Language toggle handler  
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
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.handleRouteChange(hash);
            }
        });
        
        // Handle hash changes (for shareable URLs)
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            this.handleRouteChange(hash);
        });
    }
    
    /**
     * Handle routing - this enables shareable URLs and proper navigation
     * This is what makes URLs like yoursite.com/#about work correctly
     */
    initializeRouting() {
        if (this.currentPath.startsWith('post/')) {
            // Handle blog post URLs
            const articleId = this.currentPath.replace('post/', '');
            this.loadBlogPost(articleId);
        } else if (this.currentPath && this.currentPath !== 'home') {
            // Handle page navigation
            this.navigateToPage(this.currentPath);
        }
    }
    
    /**
     * Handle route changes (when URL hash changes)
     * This ensures the correct content is shown based on the URL
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
     * This is the core navigation function used throughout the app
     */
    navigateToPage(pageName) {
        // Update URL without reloading the page
        if (pageName !== 'home') {
            window.location.hash = pageName;
        } else {
            // For home page, clear the hash
            history.replaceState(null, null, window.location.pathname);
        }
        
        // Update navigation visual state
        this.updateNavigationState(pageName);
        
        // Show the correct page
        this.showPage(pageName);
        
        // Load page-specific content if needed
        this.loadPageContent(pageName);
    }
    
    /**
     * Update navigation visual state (which nav item is active)
     */
    updateNavigationState(pageName) {
        // Remove active class from all navigation items
        this.elements.navCommands.forEach(cmd => cmd.classList.remove('active'));
        
        // Add active class to current navigation item
        const activeNav = document.querySelector(`[data-page="${pageName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
    }
    
    /**
     * Show the correct page by managing visibility
     * This implements the single-page application behavior
     */
    showPage(pageName) {
        // Hide all pages
        this.elements.pages.forEach(page => page.classList.remove('active'));
        
        // Show target page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }
    
    /**
     * Load page-specific content dynamically
     * This enables content to be managed in separate files
     */
    async loadPageContent(pageName) {
        const contentLoaders = {
            'engineering': () => this.loadEngineeringContent(),
            'software': () => this.loadSoftwareContent(),
            'services': () => this.loadServicesContent(),
            'contact': () => this.loadContactContent(),
            'writing': () => this.loadBlogList()
        };
        
        const loader = contentLoaders[pageName];
        if (loader) {
            try {
                await loader();
            } catch (error) {
                console.error(`Error loading content for ${pageName}:`, error);
            }
        }
    }
    
    /**
     * Toggle between dark and light themes
     * This provides a smooth, animated transition between themes
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update the UI
        document.body.setAttribute('data-theme', this.currentTheme);
        this.elements.themeToggle.textContent = this.currentTheme === 'dark' ? '◐' : '◑';
        
        // Save preference
        localStorage.setItem('portfolio-theme', this.currentTheme);
        
        // Update terminal if it exists and is visible
        const terminal = window.terminalApp;
        if (terminal && document.getElementById('home').classList.contains('active')) {
            terminal.addToTerminal(`${this.getTranslation('terminal.theme_switched')} ${this.currentTheme}`);
        }
    }
    
    /**
     * Toggle between languages
     * This switches the entire interface language and updates all text content
     */
    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'de' : 'en';
        
        // Update the UI
        document.body.setAttribute('data-lang', this.currentLang);
        this.elements.langToggle.textContent = this.currentLang.toUpperCase();
        
        // Update all translations
        this.updateAllTranslations();
        
        // Save preference
        localStorage.setItem('portfolio-lang', this.currentLang);
        
        // Update terminal if it exists and is visible
        const terminal = window.terminalApp;
        if (terminal && document.getElementById('home').classList.contains('active')) {
            terminal.addToTerminal(`${this.getTranslation('terminal.lang_switched')} ${this.currentLang.toUpperCase()}`);
            // Also refresh the terminal welcome messages
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
     * This finds all elements with data-i18n attributes and updates their content
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
        
        // Update resume links with correct language version
        this.updateResumeLinks();
    }
    
    /**
     * Update resume links based on current language
     * This ensures users get the resume in their preferred language
     */
    updateResumeLinks() {
        const resumeLinks = document.querySelectorAll('a[href*="resume"]');
        resumeLinks.forEach(link => {
            const currentHref = link.getAttribute('href');
            if (currentHref.includes('resume')) {
                const newHref = `documents/resume-${this.currentLang}.pdf`;
                link.setAttribute('href', newHref);
            }
        });
    }
    
    /**
     * Get a translation by key (supports nested keys like "terminal.welcome")
     * This is the core function that retrieves translated text
     */
    getTranslation(key) {
        const keys = key.split('.');
        let current = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (current && current[k]) {
                current = current[k];
            } else {
                // Fallback to English if translation not found
                current = this.translations['en'];
                for (const fallbackKey of keys) {
                    if (current && current[fallbackKey]) {
                        current = current[fallbackKey];
                    } else {
                        return null;
                    }
                }
                break;
            }
        }
        
        return current;
    }
    
    /**
     * Start the boot sequence animation
     * This creates the terminal-style startup animation
     */
    startBootSequence() {
        const bootMessages = [
            'Initializing system...',
            'Loading profile...',
            'Abdullah Hemdan',
            '> Biomedical Engineer',
            '> Software Developer',
            '> Graduate Student', 
            '> Ready for innovation.'
        ];
        
        let messageIndex = 0;
        const bootText = document.getElementById('bootText');
        const bootSequence = this.elements.bootSequence;
        
        // Function to simulate typing animation
        const typeMessage = (message, callback) => {
            bootText.textContent = '';
            bootText.classList.add('typing');
            let charIndex = 0;
            
            const typeInterval = setInterval(() => {
                bootText.textContent += message[charIndex];
                charIndex++;
                if (charIndex === message.length) {
                    clearInterval(typeInterval);
                    bootText.classList.remove('typing');
                    setTimeout(callback, 500);
                }
            }, 50);
        };
        
        // Function to show next message
        const nextMessage = () => {
            if (messageIndex < bootMessages.length) {
                typeMessage(bootMessages[messageIndex], () => {
                    messageIndex++;
                    setTimeout(nextMessage, 300);
                });
            } else {
                // Boot sequence complete, show main interface
                setTimeout(() => {
                    bootSequence.style.opacity = '0';
                    setTimeout(() => {
                        bootSequence.style.display = 'none';
                        // Initialize terminal if we're on the home page
                        if (document.getElementById('home').classList.contains('active')) {
                            this.initializeTerminal();
                        }
                    }, 500);
                }, 1000);
            }
        };
        
        // Start the boot sequence
        setTimeout(nextMessage, 500);
    }
    
    /**
     * Initialize the terminal component
     * This connects the main app with the terminal functionality
     */
    initializeTerminal() {
        if (window.TerminalApp) {
            window.terminalApp = new TerminalApp(this);
        }
    }
    
    /**
     * Content loading functions
     * These will load content from separate JSON files
     */
    async loadEngineeringContent() {
        // Implementation will load from content/engineering.json
        console.log('Loading engineering content...');
    }
    
    async loadSoftwareContent() {
        // Implementation will load from content/software.json
        console.log('Loading software content...');
    }
    
    async loadServicesContent() {
        // Implementation will load from content/services.json
        console.log('Loading services content...');
    }
    
    async loadContactContent() {
        // Implementation will load from content/contact.json
        console.log('Loading contact content...');
    }
    
    async loadBlogList() {
        // Implementation will load blog posts list
        if (window.BlogApp) {
            window.blogApp = new BlogApp(this);
            await window.blogApp.loadBlogList();
        }
    }
    
    async loadBlogPost(articleId) {
        // Navigate to reading view and load specific post
        this.navigateToPage('reading');
        if (window.blogApp) {
            await window.blogApp.loadArticle(articleId);
        }
    }
}

/**
 * Initialize the application when the DOM is fully loaded
 * This ensures all HTML elements exist before we try to use them
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.portfolioApp = new PortfolioApp();
});

/**
 * Export for use by other modules
 * This allows other JavaScript files to access the main app instance
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioApp;
}