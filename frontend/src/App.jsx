import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ChatButton from './components/ChatButton';
import Home from './pages/Home';
import ClassPage from './pages/ClassPage';
import AIToolsPage from './pages/AIToolsPage';
import AdminPanel from './pages/AdminPanel';
import Login from './components/Admin/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/class/:classNumber" element={<ClassPage />} />
            <Route path="/ai-tools" element={<AIToolsPage />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
          <ChatButton />

          {/* Footer */}
          <footer className="mt-20 glass-card py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold gradient-text mb-2">EduHelp</h3>
                <p className="text-gray-600">
                  Мұғалімдерге арналған білім беру платформасы
                </p>
                <p className="text-gray-500 text-sm mt-4">
                  © 2024 EduHelp. Барлық құқықтар қорғалған.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
