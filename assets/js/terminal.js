/**
 * Terminal Application Component
 * 
 * This component simulates a real terminal interface with proper command handling,
 * history, and visual feedback. The key challenge here is making it feel authentic
 * while being web-browser friendly.
 * 
 * Design Philosophy:
 * - Real terminals process commands and provide feedback
 * - Visual cues should feel immediate and responsive  
 * - Command history allows users to explore efficiently
 * - Error handling should be helpful, not frustrating
 */

class TerminalApp {
    constructor(mainApp) {
        // Reference to the main application for access to translations and navigation
        this.mainApp = mainApp;
        
        // Terminal state management
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentInput = '';
        
        // DOM element references for performance optimization
        this.elements = {
            input: document.getElementById('terminalInput'),
            output: document.getElementById('terminalOutput'),
            container: document.querySelector('.terminal-container')
        };
        
        // Initialize terminal functionality
        this.init();
    }
    
    /**
     * Initialize terminal functionality
     * Sets up event handlers and ensures proper focus management
     */
    init() {
        if (!this.elements.input) return; // Safety check
        
        this.setupEventHandlers();
        this.setupFocusManagement();
        this.showWelcomeMessage();
    }
    
    /**
     * Set up all terminal event handlers
     * This handles keyboard input, command processing, and history navigation
     */
    setupEventHandlers() {
        // Main command input handler
        this.elements.input.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Prevent form submission if input is inside a form
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
        
        // Handle input changes for real-time feedback
        this.elements.input.addEventListener('input', (e) => {
            this.currentInput = e.target.value;
        });
    }
    
    /**
     * Set up focus management for the terminal
     * This ensures the terminal always feels "active" and ready for input
     */
    setupFocusManagement() {
        // Click anywhere on terminal to focus input
        this.elements.container?.addEventListener('click', (e) => {
            // Only focus if we're not clicking on a link or button
            if (!e.target.closest('a, button')) {
                this.elements.input.focus();
            }
        });
        
        // Focus terminal when home page becomes active
        const homeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const homeElement = document.getElementById('home');
                if (homeElement && homeElement.classList.contains('active')) {
                    // Slight delay to ensure page transition is complete
                    setTimeout(() => {
                        this.elements.input.focus();
                    }, 100);
                }
            });
        });
        
        // Observe changes to page visibility
        const homeElement = document.getElementById('home');
        if (homeElement) {
            homeObserver.observe(homeElement, { 
                attributes: true, 
                attributeFilter: ['class'] 
            });
        }
        
        // Global click handler to maintain focus
        document.addEventListener('click', (e) => {
            // If we're on home page and didn't click a navigation element
            const homeElement = document.getElementById('home');
            if (homeElement && homeElement.classList.contains('active')) {
                if (!e.target.closest('.nav-container, .quick-actions')) {
                    setTimeout(() => {
                        this.elements.input.focus();
                    }, 10);
                }
            }
        });
    }
    
    /**
     * Handle keyboard input with support for command history and special keys
     * This is where the terminal magic happens - processing user input
     */
    handleKeyPress(e) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                this.processCommand(this.elements.input.value.trim());
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory('up');
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory('down');
                break;
                
            case 'Tab':
                e.preventDefault();
                this.handleTabCompletion();
                break;
                
            case 'Escape':
                e.preventDefault();
                this.clearInput();
                break;
        }
    }
    
    /**
     * Process a terminal command
     * This is the heart of the terminal - it interprets commands and provides responses
     */
    processCommand(command) {
        // Add command to display (with prompt)
        this.addToTerminal(`$ ${command}`, 'user-input');
        
        // Add to history if not empty
        if (command.trim()) {
            this.commandHistory.push(command);
            this.historyIndex = this.commandHistory.length;
        }
        
        // Clear input
        this.elements.input.value = '';
        this.currentInput = '';
        
        // Process the command
        this.executeCommand(command.toLowerCase());
        
        // Auto-scroll to bottom
        this.scrollToBottom();
    }
    
    /**
     * Execute a specific command
     * This function maps user commands to actual actions
     */
    executeCommand(command) {
        const [cmd, ...args] = command.split(' ');
        
        // Command routing - this is where we define what each command does
        const commands = {
            'help': () => this.showHelp(),
            'clear': () => this.clearTerminal(),
            'about': () => this.navigateWithFeedback('about'),
            'engineering': () => this.navigateWithFeedback('engineering'),
            'software': () => this.navigateWithFeedback('software'),
            'blog': () => this.navigateWithFeedback('writing'),
            'services': () => this.navigateWithFeedback('services'),
            'contact': () => this.navigateWithFeedback('contact'),
            'theme': () => this.toggleTheme(),
            'lang': () => this.toggleLanguage(),
            'social': () => this.showSocialLinks(),
            'whoami': () => this.showWhoAmI(),
            'pwd': () => this.showCurrentPath(),
            'ls': () => this.listAvailableCommands(),
            'echo': () => this.echoCommand(args),
            'date': () => this.showDate(),
            'history': () => this.showCommandHistory()
        };
        
        const commandFunction = commands[cmd];
        
        if (commandFunction) {
            commandFunction();
        } else if (cmd === '') {
            // Empty command - just show new prompt
            return;
        } else {
            this.showCommandNotFound(cmd);
        }
    }
    
    /**
     * Navigate to a page with terminal feedback
     * This provides visual confirmation that the command worked
     */
    navigateWithFeedback(pageName) {
        const translatedMessage = this.mainApp.getTranslation('terminal.navigating_to');
        this.addToTerminal(`${translatedMessage} ${pageName}...`, 'system-response');
        
        // Add realistic delay to simulate processing
        setTimeout(() => {
            this.mainApp.navigateToPage(pageName);
        }, 800);
    }
    
    /**
     * Show help information
     * This is crucial for user discovery - it tells them what's possible
     */
    showHelp() {
        const helpText = this.mainApp.getTranslation('terminal.help_output');
        this.addToTerminal(helpText, 'system-response');
    }
    
    /**
     * Clear the terminal output
     * Provides a clean slate while maintaining the welcome message
     */
    clearTerminal() {
        this.elements.output.innerHTML = '';
        this.showWelcomeMessage();
    }
    
    /**
     * Show welcome message
     * This sets the tone and provides initial guidance
     */
    showWelcomeMessage() {
        const welcomeMsg = this.mainApp.getTranslation('terminal.welcome');
        const helpMsg = this.mainApp.getTranslation('terminal.help_prompt');
        
        this.addToTerminal(welcomeMsg, 'system-info');
        this.addToTerminal(helpMsg, 'system-info');
    }
    
    /**
     * Refresh welcome messages (used when language changes)
     * This ensures the terminal stays in sync with language changes
     */
    refreshWelcomeMessages() {
        this.clearTerminal();
    }
    
    /**
     * Toggle theme through terminal
     * Provides terminal-based theme switching with feedback
     */
    toggleTheme() {
        this.mainApp.toggleTheme();
        // Feedback is handled by the main app
    }
    
    /**
     * Toggle language through terminal
     * Provides terminal-based language switching with feedback
     */
    toggleLanguage() {
        this.mainApp.toggleLanguage();
        // Feedback is handled by the main app
    }
    
    /**
     * Show social media links
     * Provides easy access to professional profiles
     */
    showSocialLinks() {
        const socialText = this.mainApp.getTranslation('terminal.social_links');
        this.addToTerminal(socialText, 'system-response');
    }
    
    /**
     * Show "who am I" information
     * Fun terminal command that provides quick profile summary
     */
    showWhoAmI() {
        this.addToTerminal('Abdullah Hemdan - Biomedical Engineer & Software Developer', 'system-response');
        this.addToTerminal('Currently pursuing MSc at Hochschule Anhalt, Germany', 'system-response');
        this.addToTerminal('Specialized in medical software development and healthcare IoT', 'system-response');
    }
    
    /**
     * Show current "path" (current page)
     * Mimics Unix pwd command in the context of website navigation
     */
    showCurrentPath() {
        const activePage = document.querySelector('.page.active');
        const pageName = activePage ? activePage.id : 'home';
        this.addToTerminal(`/portfolio/${pageName}`, 'system-response');
    }
    
    /**
     * List available commands
     * Alternative way to discover functionality
     */
    listAvailableCommands() {
        const commands = ['help', 'about', 'engineering', 'software', 'blog', 'services', 'contact', 'theme', 'lang', 'social', 'clear'];
        this.addToTerminal('Available commands:', 'system-response');
        commands.forEach(cmd => {
            this.addToTerminal(`  ${cmd}`, 'system-response');
        });
    }
    
    /**
     * Echo command (repeats input)
     * Classic terminal command for testing and fun
     */
    echoCommand(args) {
        const message = args.join(' ') || '';
        this.addToTerminal(message, 'system-response');
    }
    
    /**
     * Show current date and time
     * Useful utility command
     */
    showDate() {
        const now = new Date();
        const dateStr = now.toLocaleString(this.mainApp.currentLang === 'de' ? 'de-DE' : 'en-US');
        this.addToTerminal(dateStr, 'system-response');
    }
    
    /**
     * Show command history
     * Helps users remember what they've tried
     */
    showCommandHistory() {
        if (this.commandHistory.length === 0) {
            this.addToTerminal('No command history available.', 'system-response');
            return;
        }
        
        this.addToTerminal('Command History:', 'system-response');
        this.commandHistory.forEach((cmd, index) => {
            this.addToTerminal(`  ${index + 1}. ${cmd}`, 'system-response');
        });
    }
    
    /**
     * Show command not found error
     * Provides helpful feedback when commands don't exist
     */
    showCommandNotFound(command) {
        const errorMsg = this.mainApp.getTranslation('terminal.command_not_found');
        this.addToTerminal(errorMsg, 'error');
        
        // Provide helpful suggestions
        const suggestions = this.findSimilarCommands(command);
        if (suggestions.length > 0) {
            this.addToTerminal(`Did you mean: ${suggestions.join(', ')}?`, 'suggestion');
        }
    }
    
    /**
     * Find similar commands for helpful error messages
     * Uses simple string similarity to suggest alternatives
     */
    findSimilarCommands(input) {
        const availableCommands = ['help', 'about', 'engineering', 'software', 'blog', 'services', 'contact', 'clear', 'theme', 'lang', 'social'];
        
        return availableCommands.filter(cmd => {
            // Simple similarity check - starts with same letter or contains similar substring
            return cmd.toLowerCase().startsWith(input.toLowerCase().charAt(0)) || 
                   cmd.toLowerCase().includes(input.toLowerCase()) ||
                   input.toLowerCase().includes(cmd.toLowerCase());
        }).slice(0, 3); // Limit to 3 suggestions
    }
    
    /**
     * Handle tab completion
     * Provides auto-completion for commands
     */
    handleTabCompletion() {
        const currentInput = this.elements.input.value;
        const availableCommands = ['help', 'about', 'engineering', 'software', 'blog', 'services', 'contact', 'clear', 'theme', 'lang', 'social'];
        
        const matches = availableCommands.filter(cmd => 
            cmd.toLowerCase().startsWith(currentInput.toLowerCase())
        );
        
        if (matches.length === 1) {
            // Complete the command
            this.elements.input.value = matches[0];
        } else if (matches.length > 1) {
            // Show available options
            this.addToTerminal(`Possible completions: ${matches.join(' ')}`, 'system-info');
        }
    }
    
    /**
     * Navigate command history
     * Allows users to reuse previous commands
     */
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        if (direction === 'up') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
            }
        } else if (direction === 'down') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
            } else {
                this.historyIndex = this.commandHistory.length;
                this.elements.input.value = '';
                return;
            }
        }
        
        if (this.historyIndex >= 0 && this.historyIndex < this.commandHistory.length) {
            this.elements.input.value = this.commandHistory[this.historyIndex];
        }
    }
    
    /**
     * Clear current input
     * Quick way to start over
     */
    clearInput() {
        this.elements.input.value = '';
        this.currentInput = '';
    }
    
    /**
     * Add text to terminal output
     * This is the core function for displaying terminal responses
     */
    addToTerminal(text, type = 'default') {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        
        // Create prompt and text elements
        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = '$';
        
        const content = document.createElement('span');
        content.className = 'terminal-content';
        content.textContent = text;
        
        // For user input, don't add another prompt
        if (type === 'user-input') {
            line.innerHTML = `<span class="terminal-content">${text}</span>`;
        } else {
            line.appendChild(prompt);
            line.appendChild(content);
        }
        
        this.elements.output.appendChild(line);
        this.scrollToBottom();
    }
    
    /**
     * Auto-scroll terminal to bottom
     * Ensures new content is always visible
     */
    scrollToBottom() {
        if (this.elements.output) {
            this.elements.output.scrollTop = this.elements.output.scrollHeight;
        }
    }
}

/**
 * Export for use by the main application
 * This allows the main app to initialize the terminal when needed
 */
if (typeof window !== 'undefined') {
    window.TerminalApp = TerminalApp;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerminalApp;
}