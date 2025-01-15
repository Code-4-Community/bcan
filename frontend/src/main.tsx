import 'react-app-polyfill/ie11';  // For Internet Explorer 11 support
import 'react-app-polyfill/stable'; // For stable polyfills for older browsers
// Ideally Import React
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './context/auth/authContext'

const container = document.getElementById("root")
if (container) {
  const root = createRoot(container)
  root.render(
      <AuthProvider>
        <App />
      </AuthProvider>
  )
}
