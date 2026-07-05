# Garvotsav Tuition Classes

A premium, responsive, and modern website built for **Garvotsav Tuition Classes**, offering concept-based education for Grades 8 to 10 in Mathematics and Science. 

This website serves as a landing page to showcase courses, testimonials, an image gallery, and a direct registration portal connected to a custom Google Apps Script backend.

## 🌟 Key Features

- **Modern Glassmorphism UI:** Built with sleek, dark-mode aesthetics using glass-like panels, gradients, and a premium color palette.
- **Fully Responsive:** Optimized for desktops, tablets, and mobile devices (including dynamic hero images and collapsible navbars).
- **Interactive Animations:** Uses AOS (Animate On Scroll) for smooth reveal animations as the user navigates down the page.
- **Dynamic Registration & Contact Forms:** Includes custom frontend validation and sends data seamlessly to a Google Sheet.
- **Success Popups:** Beautiful, animated modal popups confirm to the user when they successfully register or submit a contact message.

## 🛠️ Technology Stack

- **Frontend Core:** HTML5, Vanilla JavaScript, Vanilla CSS (`style.css`).
- **Styling Framework:** Bootstrap 5 (for grid layout and utility classes).
- **Icons & Graphics:** Font Awesome 6.
- **Animations:** AOS (Animate On Scroll).
- **Backend/Database:** Google Apps Script (`backend.gs`) linked to a private Google Sheet.

## 📁 Project Structure

- `index.html` — The main landing/home page.
- `pages/` — Contains all other pages:
  - `about.html` — Information about the institute.
  - `courses.html` — Breakdown of classes and subjects offered.
  - `contact.html` — Contact form and Google Maps embed.
  - `register.html` — The primary student admission portal.
  - `gallery.html`, `faqs.html`, `blog.html`, `materials.html`, `test-series.html`
- `assets/`
  - `css/style.css` — The primary global stylesheet including all custom theme variables, animations, and responsive breakpoints.
  - `js/main.js` — Global scripts (navbar scrolling, component loading).
  - `js/api.js` — The API layer that communicates with Google Apps Script.
  - `js/register.js` — Form handling, validation, and success popups for the admission form.
  - `images/` — Graphics and assets used across the site.
- `backend.gs` — The Google Apps Script code required to run the backend server.

## 🚀 Setup Instructions

### 1. Local Development
Simply open `index.html` in any modern web browser to view the site locally. For best results (especially when testing form submissions), serve the project via a local web server (e.g., VS Code Live Server).

### 2. Backend Deployment (Google Apps Script)
To connect the forms to your own Google Sheet:
1. Create a new Google Sheet and copy its ID from the URL.
2. Go to **Extensions > Apps Script**.
3. Paste the contents of `backend.gs` into the editor.
4. Replace `SHEET_ID` with your actual Google Sheet ID.
5. Click **Deploy > New deployment**, select **Web App**, set access to **Anyone**, and deploy.
6. Copy the resulting Web App URL and paste it into `assets/js/api.js` as the `APPS_SCRIPT_URL` variable.

#