import React from 'react'
import ReactDOM from 'react-dom/client'
import { CICProvider } from './CIC-App.jsx'
import App from './CIC-LiquidGlass.jsx'

// Restaura sessão do localStorage ao inicializar
import { getToken, getUser, getCurrentCampaign } from './api/client.js'
import useAppStore from './store/useAppStore.js'

const token    = getToken()
const user     = getUser()
const campaign = getCurrentCampaign()

if (token && user) {
  useAppStore.setState({ user, token, isLoggedIn: true })
  if (campaign) useAppStore.setState({ currentCampaign: campaign })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CICProvider>
      <App />
    </CICProvider>
  </React.StrictMode>
)
