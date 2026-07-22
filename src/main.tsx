import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRouter } from './router'
import './styles/index.css'

// Import theme (Tailwind configuration is loaded via CSS)
// All components use Tailwind utilities from src/styles/index.css

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)
