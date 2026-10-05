import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import './App.css'
import Home from './Components/Home/Home'
import Login from './Components/Login'
import Navbar from './Components/Navbar'
import Signup from './Components/Signup'
import AfterLogin from "./Components/Home/AfterLogin"
import ProtectedRoute from "./Components/ProtectedRoute"
import Map from "./Components/Map"
import Reviews from "./Components/Reviews"
import Profile from "./Components/Profile"
import Settings from "./Components/Settings"
import TravelGuidance from "./Components/TravelGuidance"
import { useContext } from "react"
import { AuthContext } from "./Context/AuthContext"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

/* Ambient gradient mesh orbs floating in background */
function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Primary orb */}
      <div
        className="absolute rounded-full opacity-[0.06]"
        style={{
          width: '600px', height: '600px',
          top: '-200px', left: '-150px',
          background: 'radial-gradient(circle, #FF2D55 0%, transparent 70%)',
          animation: 'meshDrift 20s ease-in-out infinite',
        }}
      />
      {/* Accent orb */}
      <div
        className="absolute rounded-full opacity-[0.05]"
        style={{
          width: '500px', height: '500px',
          bottom: '-100px', right: '-100px',
          background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
          animation: 'meshDrift 25s ease-in-out infinite reverse',
        }}
      />
      {/* Secondary orb */}
      <div
        className="absolute rounded-full opacity-[0.04]"
        style={{
          width: '400px', height: '400px',
          top: '40%', left: '50%',
          background: 'radial-gradient(circle, #FF6B9D 0%, transparent 70%)',
          animation: 'meshDrift 30s ease-in-out infinite 5s',
        }}
      />
    </div>
  )
}

/* Page transition wrapper */
function PageWrapper({ children }) {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-enter flex-1 relative z-10">
      {children}
    </div>
  )
}

function AppContent() {
  const { auth } = useContext(AuthContext)

  return (
    <div className="gradient-mesh-bg flex flex-col min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      <PageWrapper>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Signup />} />
          <Route path='/HomePage'
            element={
              <ProtectedRoute>
                <AfterLogin />
              </ProtectedRoute>
            }
          />
          <Route path="/map" element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          } />
          <Route path="/reviews" element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/guidance" element={
            <ProtectedRoute>
              <TravelGuidance />
            </ProtectedRoute>
          } />
        </Routes>
      </PageWrapper>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App