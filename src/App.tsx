import { Routes, Route } from 'react-router'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Models from './pages/Models'
import Pipeline from './pages/Pipeline'
import Docs from './pages/Docs'

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/models" element={<Models />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </main>
    </div>
  )
}
