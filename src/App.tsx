import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LandingPage } from './presentation/pages/LandingPage'
import { WatchPage } from './presentation/pages/WatchPage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/watch" element={<WatchPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
