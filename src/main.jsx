import React from "react"
import ReactDOM from "react-dom/client"
import App from "@/App.jsx"
import "@/index.css"
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
)

// Register service worker for offline caching
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")

      if ("sync" in registration) {
        await registration.sync.register("faithlight-background-sync")
      }
    } catch (error) {
      console.error("Service worker registration failed:", error)
    }
  })
}