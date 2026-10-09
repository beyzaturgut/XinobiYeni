import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AdminAccess from './AdminAccess.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* The server checks every panel call; the gate only signs in. Local UI tests that mock the API may switch it off. */}
    {import.meta.env.DEV && import.meta.env.VITE_ADMIN_ACCESS === 'off' ? <App /> : <AdminAccess><App /></AdminAccess>}
  </StrictMode>,
)
