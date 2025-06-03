import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Auto-hide scrollbar functionality - Only show when scrolling
let scrollTimer;

const handleScroll = () => {
  // Add scrolling class to show scrollbar
  document.body.classList.add('scrolling');
  document.documentElement.classList.add('scrolling');
  
  // Clear existing timer
  clearTimeout(scrollTimer);
  
  // Hide scrollbar after user stops scrolling
  scrollTimer = setTimeout(() => {
    document.body.classList.remove('scrolling');
    document.documentElement.classList.remove('scrolling');
  }, 800); // Hide after 0.8 seconds of no scrolling
};

// Add scroll event listener
window.addEventListener('scroll', handleScroll, { passive: true });

// Handle scroll for dropdown menus
const handleDropdownScroll = (event) => {
  const element = event.target;
  if (element.classList.contains('dropdown-scroll')) {
    element.classList.add('scrolling');
    
    clearTimeout(element.scrollTimer);
    element.scrollTimer = setTimeout(() => {
      element.classList.remove('scrolling');
    }, 600); // Faster hide for dropdowns
  }
};

// Add global scroll listener for dropdowns
document.addEventListener('scroll', handleDropdownScroll, true);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
