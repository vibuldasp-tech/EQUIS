import React from 'react';
import { createRoot } from 'react-dom/client';

const apiBase = (import.meta as any).env.VITE_PASSPORT_API_BASE_URL || 'http://localhost:8081';

function App() {
	const [data, setData] = React.useState<any>(null);
	const path = window.location.pathname;
	// Route: /dpp/:id or /scan/01/:gtin
	React.useEffect(() => {
		(async () => {
			const parts = path.split('/').filter(Boolean);
			if (parts[0] === 'dpp' && parts[1]) {
				const res = await fetch(`${apiBase}/v1/dpp/${parts[1]}/public`);
				setData(await res.json());
			} else if (parts[0] === 'scan' && parts[1] === '01' && parts[2]) {
				// fallback: resolve GTIN to id
				const resolve = await fetch(`${apiBase}/internal/resolve?gtin=${parts[2]}`);
				if (resolve.ok) {
					const { id } = await resolve.json();
					window.location.replace(`/dpp/${id}`);
				}
			}
		})();
	}, [path]);

	if (!data) return <div style={{ padding: 16 }}>Loading…</div>;
	return (
		<div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Inter, Arial' }}>
			<h1>{data.title}</h1>
			<p><strong>Brand:</strong> {data.brand}</p>
			{data.composition && (
				<div>
					<h2>Composition</h2>
					<ul>
						{data.composition.map((c: any, i: number) => (
							<li key={i}>{c.material} – {c.percentage}% {c.recycled ? `(recycled ${c.recycledContentPct || 0}%)` : ''}</li>
						))}
					</ul>
				</div>
			)}
			{data.circularity?.careInstructions && (
				<p><strong>Care:</strong> {data.circularity.careInstructions}</p>
			)}
			{data.circularity?.endOfLife && (
				<p><strong>End-of-life:</strong> {data.circularity.endOfLife}</p>
			)}
			{data.compliance?.certifications && (
				<div>
					<h2>Certifications</h2>
					<ul>
						{data.compliance.certifications.map((c: any, i: number) => (
							<li key={i}>{c.scheme} {c.id} valid until {c.validUntil}</li>
						))}
					</ul>
				</div>
			)}
			<p><a href="#" aria-disabled>View operator details (operators only)</a></p>
		</div>
	);
}

createRoot(document.getElementById('root')!).render(<App />);