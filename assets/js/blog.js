/**
 * Blog System Component
 * 
 * This component handles the markdown-based blog system with bilingual support.
 * It manages blog post loading, rendering, and navigation between posts and the blog list.
 * 
 * Key Features:
 * - Bilingual support with .en.md/.de.md files
 * - Markdown to HTML conversion
 * - SEO-friendly URLs with hash routing
 * - Responsive reading experience
 * - Automatic metadata extraction
 * 
 * Design Philosophy:
 * The blog system treats content as data, separating it from presentation.
 * This allows for easy content management and consistent rendering across languages.
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
     * This sets up the basic configuration and loads the post metadata
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
     * This file contains information about all available blog posts
     * 
     * The metadata approach allows us to:
     * - Control which posts are published
     * - Set publication dates and categories
     * - Provide multilingual titles and descriptions
     * - Control the order of posts
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
            // Fallback: create empty posts array
            this.posts = [];
        }
    }
    
    /**
     * Load and display the blog post list
     * This creates the main blog page with all available posts
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
     * Each card represents one blog post with preview information
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
        
        // Calculate reading time (rough estimate: 200 words per minute)
        const wordCount = excerpt.split(' ').length * 4; // Estimate full article length
        const readingTime = Math.ceil(wordCount / 200);
        const readingTimeText = currentLang === 'de' 
            ? `${readingTime} Min. Lesezeit` 
            : `${readingTime} min read`;
        
        card.innerHTML = `
            <h3>${title}</h3>
            <p class="article-excerpt">${excerpt}</p>
            <div class="article-meta">
                <span class="publish-date">${formattedDate}</span>
                <span class="reading-time">${readingTimeText}</span>
                ${post.tags ? `<span class="tags">${post.tags.join(', ')}</span>` : ''}
            </div>
        `;
        
        // Add click handler to navigate to full article
        card.addEventListener('click', () => {
            this.loadArticle(post.id);
        });
        
        // Add hover effects for better UX
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
        
        return card;
    }
    
    /**
     * Show message when no posts are available
     * Provides helpful feedback instead of empty space
     */
    showNoPosts(container) {
        const noPosts = document.createElement('div');
        noPosts.className = 'no-posts-message';
        noPosts.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem;">
                <h3>No blog posts available yet</h3>
                <p>Check back soon for insights on biomedical engineering and healthcare technology!</p>
            </div>
        `;
        container.appendChild(noPosts);
    }
    
    /**
     * Load and display a specific article
     * This handles the full article reading view
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
     * This handles the bilingual file system (.en.md/.de.md)
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
            // Return error content instead of breaking the page
            return this.getErrorContent();
        }
    }
    
    /**
     * Convert markdown to HTML
     * This is a simplified markdown parser - in production, you might use a library like marked.js
     * 
     * For educational purposes, I'm showing how basic markdown parsing works:
     * - Headers are identified by # symbols
     * - Paragraphs are separated by double line breaks
     * - Bold text is wrapped in **
     * - Links use [text](url) format
     */
    markdownToHtml(markdown) {
        let html = markdown;
        
        // Convert headers (##, ###, etc.)
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Convert paragraphs (double line breaks)
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>\s*<h/g, '<h');
        html = html.replace(/h>\s*<\/p>/g, 'h>');
        
        // Convert bold text
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic text
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Convert code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Convert inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        return html;
    }
    
    /**
     * Render the complete article in the reading view
     * This creates the full reading experience with metadata and content
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
                ${post.tags ? `
                    <div class="meta-item">
                        <strong>${currentLang === 'de' ? 'Themen:' : 'Topics:'}</strong> 
                        ${post.tags.join(', ')}
                    </div>
                ` : ''}
                ${post.readingTime ? `
                    <div class="meta-item">
                        <strong>${currentLang === 'de' ? 'Lesezeit:' : 'Reading time:'}</strong> 
                        ${post.readingTime} ${currentLang === 'de' ? 'Minuten' : 'minutes'}
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
        
        // Add any additional enhancements
        this.enhanceArticleContent(articleContainer);
    }
    
    /**
     * Enhance article content with interactive elements
     * This adds polish and improves the reading experience
     */
    enhanceArticleContent(container) {
        // Make external links open in new tab
        const links = container.querySelectorAll('a[href^="http"]');
        links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
        
        // Add copy code functionality to code blocks
        const codeBlocks = container.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            this.addCopyButton(block);
        });
        
        // Lazy load images if any
        const images = container.querySelectorAll('img');
        images.forEach(img => {
            img.setAttribute('loading', 'lazy');
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
        });
    }
    
    /**
     * Add copy button to code blocks
     * Improves developer experience when reading technical posts
     */
    addCopyButton(codeBlock) {
        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.innerHTML = '<i class="fas fa-copy"></i>';
        button.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: var(--accent);
            color: var(--bg-dark);
            border: none;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
        `;
        
        // Make parent relative for absolute positioning
        codeBlock.parentElement.style.position = 'relative';
        codeBlock.parentElement.appendChild(button);
        
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeBlock.textContent);
                button.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy code:', err);
            }
        });
    }
    
    /**
     * Set up back navigation from article to blog list
     * This ensures users can easily navigate back
     */
    setupBackNavigation() {
        const backButton = document.getElementById('backToBlog');
        if (backButton) {
            // Remove any existing event listeners
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
     * Updates URL and shows blog list page
     */
    navigateBackToBlog() {
        // Clear the hash to remove post URL
        window.location.hash = 'writing';
        
        // Navigate to blog page
        this.mainApp.navigateToPage('writing');
        
        // Reload blog list to ensure it's current
        this.loadBlogList();
    }
    
    /**
     * Show error message when article fails to load
     * Provides helpful feedback instead of broken page
     */
    showArticleError() {
        const articleContainer = document.getElementById('articleContent');
        if (articleContainer) {
            const currentLang = this.mainApp.currentLang;
            const errorMessage = currentLang === 'de' 
                ? 'Entschuldigung, dieser Artikel konnte nicht geladen werden.' 
                : 'Sorry, this article could not be loaded.';
            
            articleContainer.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem;">
                    <h2>Article Not Found</h2>
                    <p>${errorMessage}</p>
                    <button onclick="window.portfolioApp.navigateToPage('writing')" 
                            style="margin-top: 2rem; padding: 0.8rem 1.5rem; background: var(--accent); color: var(--bg-dark); border: none; border-radius: 4px; cursor: pointer;">
                        ${currentLang === 'de' ? 'Zurück zur Blog-Liste' : 'Back to Blog List'}
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * Get error content when markdown file fails to load
     * Provides fallback content instead of empty page
     */
    getErrorContent() {
        const currentLang = this.mainApp.currentLang;
        return currentLang === 'de' 
            ? '# Artikel nicht verfügbar\n\nEntschuldigung, dieser Artikel konnte nicht geladen werden. Bitte versuchen Sie es später erneut.'
            : '# Article Unavailable\n\nSorry, this article could not be loaded. Please try again later.';
    }
    
    /**
     * Search functionality (for future enhancement)
     * This provides a foundation for adding search capabilities
     */
    searchPosts(query) {
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