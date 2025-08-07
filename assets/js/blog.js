/**
 * Enhanced Blog System Component
 * Handles markdown-based blog system with bilingual support
 */

class BlogApp {
    constructor(mainApp) {
        this.mainApp = mainApp;
        this.posts = [];
        this.currentPost = null;
        
        // Initialize the blog system
        this.init();
    }
    
    /**
     * Initialize the blog system
     */
    async init() {
        try {
            await this.loadPostsMetadata();
        } catch (error) {
            console.error('Error initializing blog system:', error);
        }
    }
    
    /**
     * Load posts metadata from posts.json
     */
    async loadPostsMetadata() {
        try {
            const response = await fetch('posts/posts.json');
            if (!response.ok) {
                throw new Error('Failed to load posts metadata');
            }
            
            const data = await response.json();
            this.posts = data.posts || [];
            
            console.log(`Loaded metadata for ${this.posts.length} blog posts`);
        } catch (error) {
            console.error('Error loading posts metadata:', error);
            // Fallback: create sample posts
            this.posts = this.getSamplePosts();
        }
    }
    
    /**
     * Get sample posts when posts.json is not available
     */
    getSamplePosts() {
        return [
            {
                id: "medical-device-software",
                published: true,
                publishedDate: "2024-01-15",
                title: {
                    en: "The Future of Medical Device Software Validation",
                    de: "Die Zukunft der Validierung medizinischer Gerätesoftware"
                },
                excerpt: {
                    en: "Exploring emerging trends in medical software validation and their impact on patient care, drawing from hands-on experience with IEC 62304 compliance and device management.",
                    de: "Erforschung aufkommender Trends in der medizinischen Software-Validierung und deren Auswirkungen auf die Patientenversorgung, basierend auf praktischer Erfahrung mit IEC 62304-Konformität."
                },
                tags: ["Medical Software", "IEC 62304", "Validation", "Healthcare"],
                readingTime: 8,
                category: "technical"
            },
            {
                id: "python-healthcare",
                published: true,
                publishedDate: "2023-12-10",
                title: {
                    en: "Python in Healthcare: From Device Monitoring to Predictive Maintenance",
                    de: "Python im Gesundheitswesen: Von Gerätüberwachung bis zur prädiktiven Wartung"
                },
                excerpt: {
                    en: "How Python transformed medical device management in clinical environments, sharing practical examples and lessons learned from reducing device downtime by 40%.",
                    de: "Wie Python das Medizingeräte-Management in klinischen Umgebungen transformierte, mit praktischen Beispielen und Erkenntnissen aus der 40%igen Reduzierung von Geräteausfallzeiten."
                },
                tags: ["Python", "Healthcare", "Predictive Maintenance", "Programming"],
                readingTime: 12,
                category: "technical"
            },
            {
                id: "ar-medical-education",
                published: true,
                publishedDate: "2023-11-20",
                title: {
                    en: "Augmented Reality in Medical Education: A Unity 3D Implementation",
                    de: "Augmented Reality in der medizinischen Ausbildung: Eine Unity 3D-Implementierung"
                },
                excerpt: {
                    en: "Detailed case study of developing an AR platform for biomedical engineering education, achieving 90% grade and improving learning retention by 35%.",
                    de: "Detaillierte Fallstudie zur Entwicklung einer AR-Plattform für die biomedizintechnische Ausbildung mit 90% Note und 35% Verbesserung der Lernbindung."
                },
                tags: ["Augmented Reality", "Unity 3D", "Medical Education", "Research"],
                readingTime: 15,
                category: "research"
            }
        ];
    }
    
    /**
     * Load and display the blog post list
     */
    async loadBlogList() {
        const blogListElement = document.getElementById('blogList');
        if (!blogListElement) {
            console.error('Blog list element not found');
            return;
        }
        
        // Clear existing content
        blogListElement.innerHTML = '';
        
        if (this.posts.length === 0) {
            this.showNoPosts(blogListElement);
            return;
        }
        
        // Sort posts by date (newest first)
        const sortedPosts = this.posts.sort((a, b) => 
            new Date(b.publishedDate) - new Date(a.publishedDate)
        );
        
        // Create article cards for each post
        sortedPosts.forEach(post => {
            if (post.published) {  // Only show published posts
                const articleCard = this.createArticleCard(post);
                blogListElement.appendChild(articleCard);
            }
        });
    }
    
    /**
     * Create an article card for the blog list
     */
    createArticleCard(post) {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.setAttribute('data-post-id', post.id);
        
        // Get content in current language
        const currentLang = this.mainApp.currentLang;
        const title = post.title[currentLang] || post.title.en;
        const excerpt = post.excerpt[currentLang] || post.excerpt.en;
        
        // Format date according to current language
        const publishedDate = new Date(post.publishedDate);
        const dateOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = publishedDate.toLocaleDateString(
            currentLang === 'de' ? 'de-DE' : 'en-US', 
            dateOptions
        );
        
        // Calculate reading time
        const readingTime = post.readingTime || 5;
        const readingTimeText = currentLang === 'de' 
            ? `${readingTime} Min. Lesezeit` 
            : `${readingTime} min read`;
        
        card.innerHTML = `
            <h3>${title}</h3>
            <p class="article-excerpt">${excerpt}</p>
            <div class="article-meta">
                <span class="publish-date">${formattedDate}</span>
                <span class="reading-time">${readingTimeText}</span>
                ${post.tags ? `<span class="tags">${post.tags.slice(0, 3).join(', ')}</span>` : ''}
            </div>
            <div class="read-more">
                <span>${currentLang === 'de' ? 'Artikel lesen' : 'Read Article'}</span>
            </div>
        `;
        
        // Add click handler to navigate to full article
        card.addEventListener('click', () => {
            this.loadArticle(post.id);
        });
        
        return card;
    }
    
    /**
     * Show message when no posts are available
     */
    showNoPosts(container) {
        const noPosts = document.createElement('div');
        noPosts.className = 'no-posts-message';
        
        const currentLang = this.mainApp.currentLang;
        const title = currentLang === 'de' ? 'Noch keine Blog-Posts verfügbar' : 'No blog posts available yet';
        const message = currentLang === 'de' ? 
            'Schauen Sie bald wieder vorbei für Einblicke in Biomedizintechnik und Gesundheitstechnologie!' :
            'Check back soon for insights on biomedical engineering and healthcare technology!';
        
        noPosts.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
        container.appendChild(noPosts);
    }
    
    /**
     * Load and display a specific article
     */
    async loadArticle(postId) {
        try {
            // Find post metadata
            const post = this.posts.find(p => p.id === postId);
            if (!post) {
                throw new Error(`Post with ID ${postId} not found`);
            }
            
            // Update URL for shareable links
            window.location.hash = `post/${postId}`;
            
            // Navigate to reading view
            this.mainApp.navigateToPage('reading');
            
            // Load the markdown content
            const content = await this.loadMarkdownContent(post);
            
            // Render the article
            this.renderArticle(post, content);
            
            // Set up back navigation
            this.setupBackNavigation();
            
        } catch (error) {
            console.error('Error loading article:', error);
            this.showArticleError();
        }
    }
    
    /**
     * Load markdown content for a specific post
     */
    async loadMarkdownContent(post) {
        const currentLang = this.mainApp.currentLang;
        const filename = `${post.id}.${currentLang}.md`;
        
        try {
            const response = await fetch(`posts/${filename}`);
            if (!response.ok) {
                // Fallback to English if current language version not available
                if (currentLang !== 'en') {
                    const fallbackResponse = await fetch(`posts/${post.id}.en.md`);
                    if (fallbackResponse.ok) {
                        return await fallbackResponse.text();
                    }
                }
                throw new Error(`Failed to load ${filename}`);
            }
            
            return await response.text();
            
        } catch (error) {
            console.error('Error loading markdown content:', error);
            // Return sample content
            return this.getSampleContent(post.id);
        }
    }
    
    /**
     * Get sample content when markdown files are not available
     */
    getSampleContent(postId) {
        const currentLang = this.mainApp.currentLang;
        
        const sampleContent = {
            en: `# ${postId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

This is a sample blog post demonstrating the blog system functionality. In a real implementation, this content would be loaded from markdown files in the posts directory.

## Key Features

The blog system supports:
- Bilingual content (English/German)
- Markdown formatting
- Shareable URLs
- Responsive design
- Article metadata

## Technical Implementation

This blog system is built with:
- Vanilla JavaScript for lightweight performance
- Fetch API for content loading
- CSS Grid for responsive layout
- URL hash routing for shareability

## Next Steps

To complete the blog system:
1. Create markdown files in the posts/ directory
2. Add proper metadata in posts.json
3. Customize the styling to match your brand
4. Add more advanced features as needed`,
            
            de: `# ${postId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

Dies ist ein Beispiel-Blog-Post zur Demonstration der Blog-System-Funktionalität. In einer echten Implementierung würde dieser Inhalt aus Markdown-Dateien im Posts-Verzeichnis geladen werden.

## Hauptfunktionen

Das Blog-System unterstützt:
- Zweisprachiger Inhalt (Englisch/Deutsch)
- Markdown-Formatierung
- Teilbare URLs
- Responsives Design
- Artikel-Metadaten

## Technische Implementierung

Dieses Blog-System ist gebaut mit:
- Vanilla JavaScript für leichte Performance
- Fetch API für Content-Loading
- CSS Grid für responsives Layout
- URL Hash-Routing für Teilbarkeit

## Nächste Schritte

Um das Blog-System zu vervollständigen:
1. Markdown-Dateien im posts/ Verzeichnis erstellen
2. Korrekte Metadaten in posts.json hinzufügen
3. Styling an Ihre Marke anpassen
4. Weitere erweiterte Funktionen nach Bedarf hinzufügen`
        };
        
        return sampleContent[currentLang] || sampleContent.en;
    }
    
    /**
     * Convert markdown to HTML (simple implementation)
     */
    markdownToHtml(markdown) {
        let html = markdown;
        
        // Convert headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Convert paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>\s*<h/g, '<h');
        html = html.replace(/h>\s*<\/p>/g, 'h>');
        
        // Convert formatting
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Convert lists
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        return html;
    }
    
    /**
     * Render the complete article in the reading view
     */
    renderArticle(post, markdownContent) {
        const articleContainer = document.getElementById('articleContent');
        if (!articleContainer) {
            console.error('Article container not found');
            return;
        }
        
        // Get localized content
        const currentLang = this.mainApp.currentLang;
        const title = post.title[currentLang] || post.title.en;
        
        // Convert markdown to HTML
        const htmlContent = this.markdownToHtml(markdownContent);
        
        // Format publication date
        const publishedDate = new Date(post.publishedDate);
        const dateOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = publishedDate.toLocaleDateString(
            currentLang === 'de' ? 'de-DE' : 'en-US', 
            dateOptions
        );
        
        // Create article header with metadata
        const articleHeader = `
            <div class="article-meta">
                <h3>${currentLang === 'de' ? 'Artikel-Info' : 'Article Info'}</h3>
                <div class="meta-item">
                    <strong>${currentLang === 'de' ? 'Veröffentlicht:' : 'Published:'}</strong> 
                    ${formattedDate}
                </div>
                ${post.readingTime ? `
                    <div class="meta-item">
                        <strong>${currentLang === 'de' ? 'Lesezeit:' : 'Reading time:'}</strong> 
                        ${post.readingTime} ${currentLang === 'de' ? 'Minuten' : 'minutes'}
                    </div>
                ` : ''}
                ${post.tags ? `
                    <div class="meta-item">
                        <strong>${currentLang === 'de' ? 'Themen:' : 'Topics:'}</strong> 
                        ${post.tags.join(', ')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Combine header, metadata, and content
        articleContainer.innerHTML = articleHeader + htmlContent;
        
        // Store current post reference
        this.currentPost = post;
        
        // Scroll to top of article
        articleContainer.scrollTop = 0;
        
        // Enhance article content
        this.enhanceArticleContent(articleContainer);
    }
    
    /**
     * Enhance article content with interactive elements
     */
    enhanceArticleContent(container) {
        // Make external links open in new tab
        const links = container.querySelectorAll('a[href^="http"]');
        links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
        
        // Style images
        const images = container.querySelectorAll('img');
        images.forEach(img => {
            img.setAttribute('loading', 'lazy');
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.margin = '2rem 0';
        });
        
        // Style code blocks
        const codeBlocks = container.querySelectorAll('code');
        codeBlocks.forEach(code => {
            if (!code.parentElement.tagName.toLowerCase() === 'pre') {
                code.style.background = 'var(--border)';
                code.style.padding = '0.2rem 0.4rem';
                code.style.borderRadius = '4px';
                code.style.fontSize = '0.9rem';
            }
        });
    }
    
    /**
     * Set up back navigation from article to blog list
     */
    setupBackNavigation() {
        const backButton = document.getElementById('backToBlog');
        if (backButton) {
            // Remove existing event listeners by cloning
            const newBackButton = backButton.cloneNode(true);
            backButton.parentNode.replaceChild(newBackButton, backButton);
            
            // Add click handler
            newBackButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateBackToBlog();
            });
        }
    }
    
    /**
     * Navigate back to the blog list
     */
    navigateBackToBlog() {
        // Clear the hash to remove post URL
        window.location.hash = 'blog';
        
        // Navigate to blog page
        this.mainApp.navigateToPage('blog');
        
        // Reload blog list to ensure it's current
        this.loadBlogList();
    }
    
    /**
     * Show error message when article fails to load
     */
    showArticleError() {
        const articleContainer = document.getElementById('articleContent');
        if (articleContainer) {
            const currentLang = this.mainApp.currentLang;
            const errorTitle = currentLang === 'de' ? 'Artikel nicht gefunden' : 'Article Not Found';
            const errorMessage = currentLang === 'de' 
                ? 'Entschuldigung, dieser Artikel konnte nicht geladen werden.' 
                : 'Sorry, this article could not be loaded.';
            const backButtonText = currentLang === 'de' ? 'Zurück zur Blog-Liste' : 'Back to Blog List';
            
            articleContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h2>${errorTitle}</h2>
                    <p>${errorMessage}</p>
                    <button onclick="window.portfolioApp.navigateToPage('blog')" class="error-back-button">
                        ${backButtonText}
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * Search functionality (for future enhancement)
     */
    searchPosts(query) {
        if (!query.trim()) return this.posts;
        
        const lowerQuery = query.toLowerCase();
        return this.posts.filter(post => {
            const currentLang = this.mainApp.currentLang;
            const title = (post.title[currentLang] || post.title.en).toLowerCase();
            const excerpt = (post.excerpt[currentLang] || post.excerpt.en).toLowerCase();
            const tags = post.tags ? post.tags.join(' ').toLowerCase() : '';
            
            return title.includes(lowerQuery) || 
                   excerpt.includes(lowerQuery) || 
                   tags.includes(lowerQuery);
        });
    }
}

/**
 * Export for use by the main application
 */
if (typeof window !== 'undefined') {
    window.BlogApp = BlogApp;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogApp;
}