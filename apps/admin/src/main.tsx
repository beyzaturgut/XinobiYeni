import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AdminAccess from './AdminAccess.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {import.meta.env.PROD ? <AdminAccess><App /></AdminAccess> : <App />}
  </StrictMode>,
)
