import { useState } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-orange-500">MiniWallet</h1>
            <p className="text-gray-500 mt-1">Tu billetera virtual</p>
          </div>
          <Register onLogin={setToken} />
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-gray-400">o</span></div>
          </div>
          <Login onLogin={setToken} />
        </div>
      </div>
    );
  }

  return <Dashboard token={token} onLogout={() => { localStorage.removeItem('token'); setToken(null); }} />;
}

export default App;
