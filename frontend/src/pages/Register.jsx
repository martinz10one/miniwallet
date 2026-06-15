import { useState } from 'react';

export default function Register({ onLogin }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password }),
    });

    const data = await res.json();
    if (!res.ok) { setLoading(false); return setError(data.error); }

    const loginRes = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();
    if (loginRes.ok) {
      localStorage.setItem('token', loginData.token);
      onLogin(loginData.token);
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Crear cuenta</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
        <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
        <button type="submit" disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition duration-200 disabled:opacity-50">
          {loading ? 'Creando...' : 'Crear cuenta'}
        </button>
      </form>
      {error && <p className="mt-3 text-red-500 text-sm text-center">{error}</p>}
      <p className="mt-3 text-xs text-gray-400 text-center">Recibes <strong>$100,000 COP</strong> al registrarte</p>
    </div>
  );
}
