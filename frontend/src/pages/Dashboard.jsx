import { useState, useEffect } from 'react';

export default function Dashboard({ token, onLogout }) {
  const [saldo, setSaldo] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [receptor, setReceptor] = useState('');
  const [monto, setMonto] = useState('');

  function formatearNumero(valor) {
    const soloDigitos = valor.replace(/\D/g, '');
    if (!soloDigitos) return '';
    return Number(soloDigitos).toLocaleString('es-CO');
  }

  function handleMontoChange(e) {
    const raw = e.target.value.replace(/\./g, '').replace(/\D/g, '');
    setMonto(raw);
  }
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [tab, setTab] = useState('saldo');
  const [factura, setFactura] = useState(null);

  useEffect(() => {
    fetchBalance();
    fetchUsers();
    fetchTransactions();
  }, []);

  async function fetchBalance() {
    const res = await fetch('/api/balance', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSaldo(data);
  }

  async function fetchUsers() {
    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data);
  }

  async function fetchTransactions() {
    const res = await fetch('/api/transactions', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTransactions(data);
  }

  async function handleTransfer(e) {
    e.preventDefault();
    setError('');
    setExito('');

    const res = await fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ receptor_email: receptor, monto: parseFloat(monto || 0) }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    setFactura(data.transaccion);
    setMonto('');
    setReceptor('');
    fetchBalance();
    fetchTransactions();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-blue-600 text-white p-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">MiniWallet</h1>
          <button onClick={onLogout} className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 -mt-10">
        {saldo && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <p className="text-gray-500 text-sm">Hola, <span className="font-semibold text-gray-800">{saldo.nombre}</span></p>
            <div className="mt-2">
              <p className="text-3xl font-bold text-orange-500">${Number(saldo.saldo).toLocaleString()}</p>
              <p className="text-gray-400 text-sm">{saldo.moneda}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <button onClick={() => setTab('transferir')}
            className={`flex-1 py-3 rounded-xl font-medium transition ${tab === 'transferir' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'}`}>
            Enviar dinero
          </button>
          <button onClick={() => setTab('historial')}
            className={`flex-1 py-3 rounded-xl font-medium transition ${tab === 'historial' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'}`}>
            Historial
          </button>
        </div>

        {tab === 'transferir' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enviar dinero</h3>
            <form onSubmit={handleTransfer} className="space-y-4">
              <select value={receptor} onChange={e => setReceptor(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50">
                <option value="">Selecciona destinatario</option>
                {users.map(u => (
                  <option key={u.id} value={u.email}>{u.nombre} — {u.email}</option>
                ))}
              </select>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400 font-medium">$</span>
                <input type="text" inputMode="numeric" placeholder="0" value={formatearNumero(monto)} onChange={handleMontoChange} required
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" />
              </div>
              <button type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition">
                Enviar
              </button>
            </form>
            {error && <p className="mt-3 text-red-500 text-sm text-center">{error}</p>}
            {exito && <p className="mt-3 text-green-500 text-sm text-center">{exito}</p>}
          </div>
        )}

        {tab === 'historial' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial</h3>
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay transacciones aún</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-500">{new Date(t.fecha).toLocaleDateString()}</p>
                      <p className="font-medium text-gray-800">{t.emisor} → {t.receptor}</p>
                    </div>
                    <p className="font-bold text-orange-500">${Number(t.monto).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {factura && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Transferencia exitosa</h2>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Factura N°</span>
                <span className="font-semibold text-gray-800">#{factura.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fecha</span>
                <span className="font-semibold text-gray-800">
                  {new Date(factura.fecha).toLocaleDateString('es-CO')}
                </span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">De</span>
                <span className="font-semibold text-gray-800">{factura.emisor_nombre}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Para</span>
                <span className="font-semibold text-gray-800">{factura.receptor_nombre}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-700">Monto</span>
                <span className="font-bold text-orange-500 text-lg">
                  ${Number(factura.monto).toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estado</span>
                <span className="text-green-600 font-semibold">Exitosa</span>
              </div>
            </div>

            <button onClick={() => setFactura(null)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
