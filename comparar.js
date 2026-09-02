const AIRCRAFT = Array.isArray(window.AIRCRAFT_MODELS) ? window.AIRCRAFT_MODELS : [];

const ACCENT_MAP = {
	á: 'a', à: 'a', â: 'a', ã: 'a', ä: 'a',
	é: 'e', è: 'e', ê: 'e', ë: 'e',
	í: 'i', ì: 'i', î: 'i', ï: 'i',
	ó: 'o', ò: 'o', ô: 'o', õ: 'o', ö: 'o',
	ú: 'u', ù: 'u', û: 'u', ü: 'u',
	ç: 'c', ñ: 'n'
};

function normalizeText(value) {
	return String(value || '')
		.toLowerCase()
		.trim()
		.replace(/[áàâãäéèêëíìîïóòôõöúùûüçñ]/g, (char) => ACCENT_MAP[char] || char);
}

function parseKm(value) {
	const digits = String(value || '').replace(/[^\d]/g, '');
	return digits ? parseInt(digits, 10) : 0;
}

function formatNumber(value) {
	return value.toLocaleString('pt-BR');
}

// angle em graus, 0deg = direita, 90deg = baixo (convenção de tela do SVG).
// axisLabel é a versão curta usada no gráfico (pouco espaço); label é a
// versão completa usada na tabela, onde há espaço de sobra.
const AXES = [
	{ key: 'autonomia', label: 'Autonomia', axisLabel: 'Autonomia', unit: 'km', angle: -90, get: (a) => parseKm(a.autonomia), format: (v) => `${formatNumber(v)} km` },
	{ key: 'passageiros', label: 'Capacidade', axisLabel: 'Capacidade', unit: 'pax', angle: 30, get: (a) => parseInt(a.passageiros, 10) || 0, format: (v) => `${formatNumber(v)} pax` },
	{ key: 'velocidade', label: 'Velocidade de cruzeiro', axisLabel: 'Velocidade', unit: 'km/h', angle: 150, get: (a) => a.velocidadeKmh || 0, format: (v) => `${formatNumber(v)} km/h` }
];

// Arredonda para cima até o próximo número "redondo" (1/1.2/1.5/2/2.5/3/4/5/6/8/10 x 10^n),
// para as escalas dos eixos ficarem com folga em vez de terminar exatamente no valor máximo.
function niceCeil(value) {
	if (value <= 0) return 1;
	const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
	const normalized = value / magnitude;
	const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
	const nice = steps.find((s) => s >= normalized - 1e-9) || 10;
	return nice * magnitude;
}

function aircraftMeta(model) {
	return `${model.manufacturer} • ${model.tipo}`;
}

function aircraftMatchesQuery(model, normalizedQuery) {
	if (!normalizedQuery) return true;
	const haystack = normalizeText(`${model.name} ${model.manufacturer} ${model.tipo}`);
	return haystack.includes(normalizedQuery);
}

function createAircraftCombobox(inputEl, listEl, panelEl, previewEl, opts) {
	let filtered = [];
	let activeIndex = -1;
	let selected = null;

	function closeList() {
		listEl.classList.add('hidden');
		listEl.innerHTML = '';
		inputEl.setAttribute('aria-expanded', 'false');
		activeIndex = -1;
	}

	function currentPool() {
		const excluded = opts.getExcludedName ? opts.getExcludedName() : null;
		return excluded ? AIRCRAFT.filter((m) => m.name !== excluded) : AIRCRAFT;
	}

	function renderList(query) {
		const normalizedQuery = normalizeText(query);
		filtered = currentPool().filter((m) => aircraftMatchesQuery(m, normalizedQuery)).slice(0, 40);

		listEl.innerHTML = '';

		if (!filtered.length) {
			const empty = document.createElement('p');
			empty.className = 'cmp-empty';
			empty.textContent = 'Nenhum modelo encontrado.';
			listEl.appendChild(empty);
			listEl.classList.remove('hidden');
			inputEl.setAttribute('aria-expanded', 'true');
			return;
		}

		filtered.forEach((model, index) => {
			const option = document.createElement('button');
			option.type = 'button';
			option.className = 'cmp-option';
			option.setAttribute('role', 'option');
			option.dataset.index = String(index);
			option.innerHTML = `<strong>${model.name}</strong> — ${model.manufacturer}`;
			option.addEventListener('mousedown', (event) => {
				event.preventDefault();
				selectModel(model);
			});
			listEl.appendChild(option);
		});

		activeIndex = -1;
		listEl.classList.remove('hidden');
		inputEl.setAttribute('aria-expanded', 'true');
	}

	function setActive(index) {
		const options = listEl.querySelectorAll('.cmp-option');
		options.forEach((node) => node.classList.remove('is-active'));
		if (index >= 0 && index < options.length) {
			options[index].classList.add('is-active');
			options[index].scrollIntoView({ block: 'nearest' });
		}
		activeIndex = index;
	}

	function renderPreview() {
		if (!selected) {
			previewEl.classList.add('hidden');
			previewEl.innerHTML = '';
			panelEl.classList.remove('has-pick');
			return;
		}
		previewEl.innerHTML = `
			<img src="${selected.image}" alt="${selected.alt || selected.name}" loading="lazy">
			<div>
				<p class="cmp-preview-name">${selected.name}</p>
				<p class="cmp-preview-meta">${aircraftMeta(selected)}</p>
			</div>
		`;
		previewEl.classList.remove('hidden');
		panelEl.classList.add('has-pick');
	}

	function selectModel(model) {
		selected = model;
		inputEl.value = model.name;
		renderPreview();
		closeList();
		if (opts.onChange) opts.onChange();
	}

	inputEl.addEventListener('input', () => {
		if (selected) {
			selected = null;
			renderPreview();
			if (opts.onChange) opts.onChange();
		}
		renderList(inputEl.value);
	});

	inputEl.addEventListener('focus', () => renderList(inputEl.value));

	inputEl.addEventListener('keydown', (event) => {
		if (listEl.classList.contains('hidden') && event.key !== 'Escape') return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			setActive(Math.min(activeIndex + 1, filtered.length - 1));
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			setActive(Math.max(activeIndex - 1, 0));
		} else if (event.key === 'Enter') {
			if (activeIndex >= 0 && filtered[activeIndex]) {
				event.preventDefault();
				selectModel(filtered[activeIndex]);
			}
		} else if (event.key === 'Escape') {
			closeList();
		}
	});

	document.addEventListener('click', (event) => {
		if (!inputEl.contains(event.target) && !listEl.contains(event.target)) closeList();
	});

	return {
		getSelected() { return selected; },
		refreshIfOpen() { if (!listEl.classList.contains('hidden')) renderList(inputEl.value); },
		reset() {
			selected = null;
			inputEl.value = '';
			renderPreview();
			closeList();
		}
	};
}

const cmpButton = document.getElementById('cmp-button');
const cmpError = document.getElementById('cmp-error');
const cmpResults = document.getElementById('compare-results');
const cmpReset = document.getElementById('cmp-reset');
const cmpRadarSvg = document.getElementById('cmp-radar');

let combo1;
let combo2;

function onSelectionChange() {
	cmpError.classList.add('hidden');
	cmpButton.disabled = !(combo1.getSelected() && combo2.getSelected());
	combo1.refreshIfOpen();
	combo2.refreshIfOpen();
}

combo1 = createAircraftCombobox(
	document.getElementById('cmp-input-1'),
	document.getElementById('cmp-list-1'),
	document.querySelector('.cmp-panel[data-slot="1"]'),
	document.getElementById('cmp-preview-1'),
	{ getExcludedName: () => combo2 && combo2.getSelected() ? combo2.getSelected().name : null, onChange: onSelectionChange }
);

combo2 = createAircraftCombobox(
	document.getElementById('cmp-input-2'),
	document.getElementById('cmp-list-2'),
	document.querySelector('.cmp-panel[data-slot="2"]'),
	document.getElementById('cmp-preview-2'),
	{ getExcludedName: () => combo1 && combo1.getSelected() ? combo1.getSelected().name : null, onChange: onSelectionChange }
);

const SERIES_1_COLOR = '#2a78d6';
const SERIES_2_COLOR = '#eb6834';

function buildRadar(a1, a2) {
	const cx = 200;
	const cy = 200;
	const R = 95;
	const labelR = R + 38;
	const angles = AXES.map((ax) => ax.angle);

	const domains = AXES.map((ax) => {
		const v1 = ax.get(a1);
		const v2 = ax.get(a2);
		return { v1, v2, max: niceCeil(Math.max(v1, v2, 1)) };
	});

	function pt(ratio, angleDeg, radius) {
		const rad = (angleDeg * Math.PI) / 180;
		const r = radius * Math.max(0, Math.min(1, ratio));
		return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
	}

	function anchorFor(angleDeg) {
		const rad = (angleDeg * Math.PI) / 180;
		const cos = Math.cos(rad);
		if (cos > 0.3) return 'start';
		if (cos < -0.3) return 'end';
		return 'middle';
	}

	const rings = [1 / 3, 2 / 3, 1].map((level) => {
		const points = angles.map((angle) => pt(1, angle, R * level).join(',')).join(' ');
		return `<polygon points="${points}" fill="none" stroke="#e2e8f0" stroke-width="1"></polygon>`;
	}).join('');

	const spokes = angles.map((angle) => {
		const [x, y] = pt(1, angle, R);
		return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#cbd5e1" stroke-width="1"></line>`;
	}).join('');

	const axisLabels = AXES.map((ax, i) => {
		const [x, y] = pt(1, angles[i], labelR);
		const anchor = anchorFor(angles[i]);
		return `
			<text x="${x}" y="${y - 4}" text-anchor="${anchor}" font-size="12" font-weight="800" fill="#102d55">${ax.axisLabel}</text>
			<text x="${x}" y="${y + 11}" text-anchor="${anchor}" font-size="10" fill="#7c8aa0">(${ax.unit})</text>
		`;
	}).join('');

	function seriesPolygon(pick, color) {
		const points = domains.map((d, i) => pt(pick(d) / d.max, angles[i], R).join(',')).join(' ');
		return `<polygon points="${points}" fill="${color}" fill-opacity="0.16" stroke="${color}" stroke-width="2" stroke-linejoin="round"></polygon>`;
	}

	function seriesDots(pick, color) {
		return domains.map((d, i) => {
			const [x, y] = pt(pick(d) / d.max, angles[i], R);
			return `<circle cx="${x}" cy="${y}" r="4" fill="${color}" stroke="#ffffff" stroke-width="2"></circle>`;
		}).join('');
	}

	// Os valores exatos ficam na tabela abaixo do gráfico (mais legível que
	// espremer números perto de cada vértice, onde colidiriam com os rótulos
	// dos eixos).
	cmpRadarSvg.innerHTML = `
		<title id="cmp-radar-title">Gráfico radar comparando ${a1.name} e ${a2.name}</title>
		${rings}
		${spokes}
		${seriesPolygon((d) => d.v2, SERIES_2_COLOR)}
		${seriesPolygon((d) => d.v1, SERIES_1_COLOR)}
		${seriesDots((d) => d.v2, SERIES_2_COLOR)}
		${seriesDots((d) => d.v1, SERIES_1_COLOR)}
		${axisLabels}
	`;

	return domains;
}

function updateLegendAndTable(a1, a2, domains) {
	document.getElementById('cmp-legend').innerHTML = `
		<span class="inline-flex items-center gap-2"><span class="cmp-legend-swatch" style="background:${SERIES_1_COLOR};"></span>${a1.name}</span>
		<span class="inline-flex items-center gap-2"><span class="cmp-legend-swatch" style="background:${SERIES_2_COLOR};"></span>${a2.name}</span>
	`;

	document.getElementById('cmp-th-1').textContent = a1.name;
	document.getElementById('cmp-th-2').textContent = a2.name;

	document.getElementById('cmp-table-body').innerHTML = domains.map((d, i) => {
		const ax = AXES[i];
		let winnerCell;
		if (d.v1 === d.v2) {
			winnerCell = '<span class="cmp-winner-badge" style="color:#64748b;">Empate</span>';
		} else if (d.v1 > d.v2) {
			winnerCell = `<span class="cmp-winner-badge" style="color:${SERIES_1_COLOR};">● ${a1.name}</span>`;
		} else {
			winnerCell = `<span class="cmp-winner-badge" style="color:${SERIES_2_COLOR};">● ${a2.name}</span>`;
		}
		return `
			<tr>
				<td>${ax.label}</td>
				<td>${ax.format(d.v1)}</td>
				<td>${ax.format(d.v2)}</td>
				<td>${winnerCell}</td>
			</tr>
		`;
	}).join('');
}

cmpButton.addEventListener('click', () => {
	const a1 = combo1.getSelected();
	const a2 = combo2.getSelected();
	if (!a1 || !a2) {
		cmpError.textContent = 'Escolha as duas aeronaves antes de comparar.';
		cmpError.classList.remove('hidden');
		return;
	}
	cmpError.classList.add('hidden');
	const domains = buildRadar(a1, a2);
	updateLegendAndTable(a1, a2, domains);
	cmpResults.classList.remove('hidden');
	cmpResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

cmpReset.addEventListener('click', () => {
	combo1.reset();
	combo2.reset();
	cmpButton.disabled = true;
	cmpResults.classList.add('hidden');
	document.getElementById('cmp-input-1').focus();
});
