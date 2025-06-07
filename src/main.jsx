import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext'
import './index.css'
import App from './App.jsx'

let scrollTimer;

const handleScroll = () => {
  document.body.classList.add('scrolling');
  document.documentElement.classList.add('scrolling');
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    document.body.classList.remove('scrolling');
    document.documentElement.classList.remove('scrolling');
  }, 800);
};

window.addEventListener('scroll', handleScroll, { passive: true });

const handleDropdownScroll = (event) => {
  const element = event?.target;

  if (element && element.classList && element.classList.contains('dropdown-scroll')) {
    element.classList.add('scrolling');
    clearTimeout(element.scrollTimer);
    element.scrollTimer = setTimeout(() => {
      if (element.classList) {
        element.classList.remove('scrolling');
      }
    }, 600);
  }
};
document.addEventListener('scroll', handleDropdownScroll, true);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
