import { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) { setLoading(false); return setError(data.error); }

    localStorage.setItem('token', data.token);
    onLogin(data.token);
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
        <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
        <button type="submit" disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition duration-200 disabled:opacity-50">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      {error && <p className="mt-3 text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
