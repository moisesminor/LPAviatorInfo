const airportGrid = document.getElementById('airport-grid');
const loadMoreButton = document.getElementById('load-more-btn');
const loadMoreError = document.getElementById('load-more-error');
const gridStatus = document.getElementById('grid-status');
const airportCount = document.getElementById('airport-count');
const airportSearchInput = document.getElementById('airport-search');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const filterButtons = document.querySelectorAll('.country-filter-btn');
const apiBaseUrl = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

const countryConfig = {
	brasil: {
		endpoint: 'brasil',
		title: 'Aeroportos do Brasil',
		subtitle: 'Códigos IATA e ICAO, localização, pistas e mapa de cada aeroporto brasileiro — dados atualizados para consulta rápida.',
		gridLabel: 'Lista de aeroportos brasileiros',
		emptyLabel: 'Nenhum aeroporto brasileiro encontrado no momento.',
		allLoadedLabel: 'Todos os aeroportos brasileiros foram exibidos'
	},
	usa: {
		endpoint: 'usa',
		title: 'Aeroportos dos Estados Unidos',
		subtitle: 'Códigos IATA e ICAO, localização, pistas e mapa de cada aeroporto dos Estados Unidos — dados atualizados para consulta rápida.',
		gridLabel: 'Lista de aeroportos dos Estados Unidos',
		emptyLabel: 'Nenhum aeroporto americano encontrado no momento.',
		allLoadedLabel: 'Todos os aeroportos dos Estados Unidos foram exibidos'
	}
};

const state = {
	country: 'brasil',
	offset: 0,
	total: 0,
	loading: false,
	allLoaded: false,
	firstLoad: true,
	search: ''
};

function getCountryConfig() {
	return countryConfig[state.country];
}

function debounce(fn, delay) {
	let timer;
	return (...args) => {
		window.clearTimeout(timer);
		timer = window.setTimeout(() => fn(...args), delay);
	};
}

const fallbackImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80';

function clearSkeletons() {
	airportGrid.querySelectorAll('[data-skeleton]').forEach((node) => node.remove());
}

function setStatus(message) {
	if (gridStatus) gridStatus.textContent = message;
}

function setError(message) {
	if (!loadMoreError) return;
	if (message) {
		loadMoreError.textContent = message;
		loadMoreError.classList.remove('hidden');
	} else {
		loadMoreError.textContent = '';
		loadMoreError.classList.add('hidden');
	}
}

function updateAirportCount() {
	if (!airportCount) return;
	if (state.total === 0) {
		airportCount.textContent = '';
		return;
	}
	airportCount.textContent = `Mostrando ${state.offset} de ${state.total} aeroportos`;
}

function buildAirportCard(airport) {
	const code = airport.iata_code || airport.iata || airport.icao || 'N/D';
	const icao = airport.ident || airport.icao || airport.local_code || 'N/D';
	const city = airport.municipality || airport.city || airport.name || 'Brasil';
	const country = airport.country === 'United States' ? 'Estados Unidos' : 'Brasil';
	const networkLabel = airport.country === 'United States' ? 'americana' : 'brasileira';
	const latitude = airport.latitude_deg ?? airport.latitude ?? '';
	const longitude = airport.longitude_deg ?? airport.longitude ?? '';
	const coordinates = latitude && longitude ? `${latitude}, ${longitude}` : 'Informação indisponível';
	const runwayList = Array.isArray(airport.runways) && airport.runways.length
		? airport.runways.map((runway) => `<li>${runway.le_ident || runway.he_ident || 'Pista'} · ${runway.length_ft ? `${Math.round(runway.length_ft / 3.28084)}m` : 'Comprimento não informado'}</li>`).join('')
		: '<li>Dados de pista indisponíveis no momento.</li>';
	const mapQuery = encodeURIComponent(`${airport.name || city} ${country}`);
	const image = airport.photo || fallbackImage;
	const airportName = airport.name || city;

	const card = document.createElement('article');
	card.className = 'airport-card group flex flex-col overflow-hidden rounded-2xl border border-slate-900/10 bg-white shadow-[0_8px_24px_rgba(16,45,85,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(16,45,85,0.14)]';
	card.dataset.open = 'false';
	card.innerHTML = `
		<div class="relative">
			<img class="h-48 w-full object-cover" src="${image}" alt="Aeroporto de ${airportName}" loading="lazy" decoding="async">
			<span class="absolute right-3 top-3 rounded-full border border-white/30 bg-slate-950/60 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">${icao}</span>
		</div>
		<div class="flex flex-1 flex-col p-6">
			<h2 class="line-clamp-2 min-h-[3.5rem] text-xl font-bold leading-snug text-[#102d55]">${airportName} <span class="font-semibold text-[#1261bd]">(${code})</span></h2>
			<p class="mt-2 line-clamp-2 min-h-[2.875rem] text-sm leading-relaxed text-[#18283b]">${airport.description || `Terminal em ${city} com atendimento a voos regionais e conexões para o restante do país.`}</p>
			<div class="mt-auto pt-5">
				<button type="button" class="details-toggle inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1261bd] px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-[#102d55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 active:scale-[0.98]" aria-expanded="false">
					<span class="details-toggle-label">Mostrar mais detalhes</span>
					<svg class="details-icon h-3.5 w-3.5 transition-transform duration-300" viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</button>
			</div>
		</div>
		<div class="details-wrap">
			<div class="details-inner">
				<div class="details-content border-t border-slate-200 bg-slate-50/70 px-6 py-5">
					<p class="leading-7 text-slate-700">${airportName} fica em ${city} e opera voos regulares dentro da rede aérea ${networkLabel}.</p>
					<p class="mt-3 text-sm leading-6 text-slate-600">
						<strong>Localização:</strong> ${city}, ${country}<br>
						<strong>Coordenadas:</strong> ${coordinates}<br>
						<strong>Altitude:</strong> ${airport.elevation_ft ? `${airport.elevation_ft} ft` : 'Não informada'}
					</p>
					<div class="mt-4">
						<p class="mb-2 text-sm font-bold uppercase tracking-[1.5px] text-slate-700">Pistas</p>
						<ul class="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">${runwayList}</ul>
					</div>
					<a class="mt-4 inline-block font-bold text-[#1261bd] underline" href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a>
					<iframe class="map-frame mt-4 h-44 w-full rounded-lg border-0 bg-slate-100" title="Localização do aeroporto ${airportName} no Google Maps" data-src="https://www.google.com/maps?q=${mapQuery}&output=embed" loading="lazy"></iframe>
				</div>
			</div>
		</div>
	`;

	const toggle = card.querySelector('.details-toggle');
	const mapFrame = card.querySelector('.map-frame');
	let closeTimer;

	toggle.addEventListener('click', () => {
		window.clearTimeout(closeTimer);
		const isOpen = card.dataset.open === 'true';

		if (isOpen) {
			card.dataset.open = 'false';
			toggle.setAttribute('aria-expanded', 'false');
			toggle.querySelector('.details-toggle-label').textContent = 'Mostrar mais detalhes';
			return;
		}

		if (mapFrame && !mapFrame.src && mapFrame.dataset.src) {
			mapFrame.src = mapFrame.dataset.src;
		}

		card.dataset.open = 'true';
		toggle.setAttribute('aria-expanded', 'true');
		toggle.querySelector('.details-toggle-label').textContent = 'Mostrar menos detalhes';
	});

	return card;
}

async function loadMoreAirports() {
	if (state.loading || state.allLoaded) return;
	state.loading = true;
	loadMoreButton.disabled = true;
	loadMoreButton.textContent = 'Carregando...';
	setError(null);
	setStatus('Carregando aeroportos...');

	const config = getCountryConfig();

	try {
		const searchParam = state.search ? `&search=${encodeURIComponent(state.search)}` : '';
		const url = `${apiBaseUrl}/api/airports/${config.endpoint}?offset=${state.offset}&limit=20${searchParam}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Não foi possível carregar os aeroportos.');
		}
		const data = await response.json();
		const airports = Array.isArray(data.airports) ? data.airports : [];

		clearSkeletons();

		if (state.firstLoad && airports.length === 0) {
			const empty = document.createElement('p');
			empty.className = 'col-span-full text-center text-base text-slate-600';
			empty.textContent = state.search
				? `Nenhum aeroporto encontrado para "${state.search}".`
				: config.emptyLabel;
			airportGrid.appendChild(empty);
		}

		airports.forEach((airport) => {
			airportGrid.appendChild(buildAirportCard(airport));
		});

		state.offset += airports.length;
		state.total = data.total || state.offset;
		state.allLoaded = state.offset >= state.total;
		state.firstLoad = false;

		updateAirportCount();
		loadMoreButton.textContent = state.allLoaded ? config.allLoadedLabel : 'Carregar mais 20';
		loadMoreButton.disabled = state.allLoaded;
		setStatus(`${state.offset} de ${state.total} aeroportos carregados.`);
	} catch (error) {
		loadMoreButton.textContent = 'Tentar novamente';
		loadMoreButton.disabled = false;
		const message = window.location.protocol === 'file:'
			? 'Não foi possível carregar os aeroportos. Abra a página via servidor local (npm start).'
			: 'Não foi possível carregar os aeroportos agora. Tente novamente em instantes.';
		setError(message);
		setStatus(message);
		console.error(error);
	} finally {
		state.loading = false;
	}
}

function resetGrid() {
	state.offset = 0;
	state.total = 0;
	state.allLoaded = false;
	state.firstLoad = true;
	airportGrid.innerHTML = '';
	setError(null);
	loadMoreButton.disabled = false;
	loadMoreButton.textContent = 'Carregar mais 20';
}

if (airportSearchInput) {
	const handleSearchInput = debounce(() => {
		state.search = airportSearchInput.value.trim();
		resetGrid();
		loadMoreAirports();
	}, 350);

	airportSearchInput.addEventListener('input', handleSearchInput);
}

function applyCountryUi() {
	const config = getCountryConfig();
	if (pageTitle) pageTitle.textContent = config.title;
	if (pageSubtitle) pageSubtitle.textContent = config.subtitle;
	document.title = `${config.title} | Aviator Info`;
	airportGrid.setAttribute('aria-label', config.gridLabel);
	filterButtons.forEach((btn) => {
		btn.setAttribute('aria-pressed', String(btn.dataset.country === state.country));
	});
}

filterButtons.forEach((btn) => {
	btn.addEventListener('click', () => {
		const country = btn.dataset.country;
		if (state.loading || country === state.country || !countryConfig[country]) return;
		state.country = country;
		applyCountryUi();
		resetGrid();
		loadMoreAirports();
	});
});

loadMoreButton.addEventListener('click', loadMoreAirports);
applyCountryUi();
loadMoreAirports();
