import React from 'react';
import { createRoot } from 'react-dom/client';

const apiBase = (import.meta as any).env.VITE_PASSPORT_API_BASE_URL || 'http://localhost:8081';

function useAuthToken() {
	const [token, setToken] = React.useState<string | null>(() => localStorage.getItem('op_token'));
	const save = (t: string) => { localStorage.setItem('op_token', t); setToken(t); };
	const clear = () => { localStorage.removeItem('op_token'); setToken(null); };
	return { token, save, clear };
}

function Login({ onLogin }: { onLogin: (token: string) => void }) {
	const [apiKey, setApiKey] = React.useState('dev-operator-key');
	const [error, setError] = React.useState('');
	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setError('');
		const res = await fetch(`${apiBase}/v1/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ apiKey }) });
		if (!res.ok) { setError('Login failed'); return; }
		const { token } = await res.json();
		onLogin(token);
	}
	return (
		<form onSubmit={submit} style={{ padding: 24, display: 'grid', gap: 12 }}>
			<h1>Operator Login</h1>
			<input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key" />
			<button type="submit">Login</button>
			{error && <div style={{ color: 'red' }}>{error}</div>}
		</form>
	);
}

function List({ token, onSelect }: { token: string; onSelect: (id: string) => void }) {
	const [rows, setRows] = React.useState<any[]>([]);
	React.useEffect(() => { (async () => {
		const res = await fetch(`${apiBase}/v1/dpp?limit=50`, { headers: { authorization: `Bearer ${token}` } });
		const json = await res.json();
		setRows(json.items || []);
	})(); }, [token]);
	return (
		<div style={{ padding: 16 }}>
			<h2>DPPs</h2>
			<table>
				<thead><tr><th>Title</th><th>Brand</th><th>GTIN</th><th>SKU</th></tr></thead>
				<tbody>
					{rows.map(r => (
						<tr key={r.id} onClick={() => onSelect(r.id)} style={{ cursor: 'pointer' }}>
							<td>{r.title}</td><td>{r.brand}</td><td>{r.identifierGtin}</td><td>{r.identifierSku}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function Detail({ token, id, onBack }: { token: string; id: string; onBack: () => void }) {
	const [item, setItem] = React.useState<any>(null);
	const [file, setFile] = React.useState<File | null>(null);
	React.useEffect(() => { (async () => {
		const res = await fetch(`${apiBase}/v1/dpp/${id}`, { headers: { authorization: `Bearer ${token}` } });
		setItem(await res.json());
	})(); }, [id, token]);
	async function upload() {
		if (!file) return;
		const init = await fetch(`${apiBase}/v1/dpp/${id}/evidence`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream' }) });
		const { uploadUrl, key } = await init.json();
		await fetch(uploadUrl, { method: 'PUT', headers: { 'content-type': file.type || 'application/octet-stream' }, body: file });
		alert('Uploaded evidence key: ' + key);
	}
	if (!item) return <div style={{ padding: 16 }}>Loading…</div>;
	return (
		<div style={{ padding: 16 }}>
			<button onClick={onBack}>Back</button>
			<h2>{item.title}</h2>
			<p><strong>Brand:</strong> {item.brand}</p>
			<p><strong>Digital Link:</strong> {item.digitalLinkUri}</p>
			<div>
				<input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
				<button onClick={upload} disabled={!file}>Upload Evidence</button>
			</div>
		</div>
	);
}

function App() {
	const { token, save, clear } = useAuthToken();
	const [selected, setSelected] = React.useState<string | null>(null);
	if (!token) return <Login onLogin={save} />;
	if (selected) return <Detail token={token} id={selected} onBack={() => setSelected(null)} />;
	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: '#eee' }}>
				<strong>Operator Portal</strong>
				<button onClick={clear}>Logout</button>
			</div>
			<List token={token} onSelect={setSelected} />
		</div>
	);
}

createRoot(document.getElementById('root')!).render(<App />);