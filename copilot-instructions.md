# **GitHub Copilot System Instructions \- AI Language Companion**

You are an expert AI developer and assistant configured for the **AI Language Companion** repository. This is an interactive, web-based language learning platform incorporating AI chat assistance, quizzes, interactive flashcards, progress tracking, and administrative controls.

Use the architectural guidelines, tech stack patterns, and project conventions defined below to guide all code suggestions, edits, and generation.

## **1\. Project Overview & Tech Stack**

This project is a multi-page web application featuring:

* **Frontend:** Vanilla HTML5, CSS3 (located in assets/css/ or custom stylesheets), and pure JavaScript (.js files) for dynamic interactions.  
* **Client-Side State & Logic:** Managed via interactive scripts (progress.js, data.js, and temporary files representing core interfaces).  
* **Backend:** Located inside the backend/ directory (node.js, python, or php depending on active files).  
* **Database / Local Data:** Handled by data.js for default mock structures and updated client-side via LocalStorage or backend API integrations.

## **2\. Directory & Component Mapping**

Be mindful of where files belong when making modifications:

* / (Root Directory):  
  * Landing & Entry: index.html  
  * Authentication: login.html, signup.html, logout.html  
  * Core User Views: dashboard.html, ai-chat.html, flashcards.html, quiz.html  
  * Admin Panels: admin.html, admin-login.html  
  * Dynamic Handlers: progress.js, data.js  
* assets/css/: Main styling modules.  
* backend/: Server-side API endpoints, database controllers, or authentication handlers.

## **3\. Key Design & Development Rules**

### **Client-side Logic (Vanilla JS)**

* **DOM Safety:** Always wrap DOM manipulation inside DOMContentLoaded event listeners.  
* **Clean State Management:** Keep application state declarative. If a file like data.js serves as a mock store, import or access it predictably.  
* **Responsive Web Design:** Optimize all elements (especially quizzes and chat bubbles in ai-chat.html) using fluid layouts, flexbox, and CSS grid to ensure perfect mobile rendering.  
* **Storage Strategy:** By default, persist local session data (like quiz scores or flashcard decks) in localStorage inside progress.js. If localStorage is unavailable or fails, implement a fallback mechanism using an in-memory store and notify the user of limited functionality.
  
  - **Error handling for storage failures:** Explicitly detect failures when accessing localStorage (e.g., QuotaExceededError or SecurityError). If an error occurs, fall back to an in-memory store for the session and surface a non-blocking user notification indicating limited persistence (e.g., "Persistent storage unavailable; progress will not be saved after this session"). Log the error to the console for debugging and, if available, send a diagnostic event to the backend for further analysis.

### **AI Integrations (ai-chat.html)**

* Handle chat messages asynchronously with graceful error fallbacks (e.g., displaying user-friendly error banners rather than blank panels if an API call fails).  
* Structure simulated or actual API calls using async/await syntax with retry blocks.

### **Code Style & Standards**

* Use modern ES6+ Javascript rules (e.g., const/let instead of var, arrow functions, template literals, and async array methods).  
* Write semantic HTML5 (e.g., \<main\>, \<section\>, \<article\>, \<header\>, \<footer\>, \<aside\> for dashboards).  
* Include comprehensive inline comments for complex game loops, progress calculation formulas, and state synchronization.

## **4\. Response Guidelines**

* Provide clean, production-ready, fully commented, and self-contained snippets.  
* When suggesting changes to .html files, clearly specify if the changes require corresponding CSS updates in assets/css/ or dynamic state updates in files like progress.js or data.js.  
* Always verify that paths are relative to the root unless explicitly requested.

# **Repository-Level Styling Guidelines for the AI Language Companion**

## **Responsive Layout and Sizing Rules**

* **Mobile-First Design:** All generated HTML and CSS layouts must follow a mobile-first, responsive design approach.  
* **No Absolute Sizing:** Never generate hardcoded layout dimensions in absolute pixels (px) for width, height, margin, or padding.  
* **Relative Units:** Use fluid, relative units (rem, em, vh, vw, or percentages) for all layout structures.  
* **Modern Layout Engines:** Use CSS Grid or Flexbox for layout grids; do not use float-based alignments or absolute positioning for structural elements.

## **Breakpoint Standards**

All media queries must use the following standard breakpoint variables:

* **Mobile (small viewports):** @media (max-width: 480px)  
* **Tablet (medium viewports):** @media (max-width: 768px)  
* **Desktop (large viewports):** @media (min-width: 1024px)

**Code Organization Tip:** Combine styles inside nested CSS blocks where appropriate to keep media queries clear and readable.

## **Touch Targets and Accessibility Requirements (WCAG 2.1 AA)**

### **1\. Touch Target Dimensions**

All interactive controls—including chat bubbles, quiz options, flashcards, inputs, and buttons—must support a minimum touch target size of 44 by 44 CSS pixels:

$$T\_{\\{target}} >= 44px * 44px$$

### **2\. Form & Control Labeling**

* Every HTML form input must have a corresponding semantic \<label\> or an aria-label attribute.  
* Ensure all custom responsive controls, such as mobile hamburger menus, include active screen-reader attributes (e.g., aria-expanded="false", aria-haspopup="true").

### **3\. Structure**

* Organize markup using logical, semantic HTML5 tags:  
  * \<header\>  
  * \<nav\>  
  * \<main\>  
  * \<section\>  
  * \<article\>  
  * \<footer\>