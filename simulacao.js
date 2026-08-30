const apiBaseUrl = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

const MANEUVER_MINUTES = 30;
const MAX_SUGGESTIONS = 40;

const COUNTRIES = [
	{ slug: 'brasil', label: 'Brasil', flag: '🇧🇷' },
	{ slug: 'usa', label: 'Estados Unidos', flag: '🇺🇸' }
];

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

const originCountrySelect = document.getElementById('origin-country');
const destCountrySelect = document.getElementById('dest-country');
const manufacturerFilter = document.getElementById('manufacturer-filter');
const aircraftGrid = document.getElementById('aircraft-grid');
const simButton = document.getElementById('sim-button');
const simError = document.getElementById('sim-error');
const simResults = document.getElementById('sim-results');
const simResetButton = document.getElementById('sim-reset');

const aircraftModels = Array.isArray(window.AIRCRAFT_MODELS) ? window.AIRCRAFT_MODELS : [];
const airportsCache = new Map();

const state = {
	selectedAircraftIndex: null
};

function setError(message) {
	if (!message) {
		simError.textContent = '';
		simError.classList.add('hidden');
		return;
	}
	simError.textContent = message;
	simError.classList.remove('hidden');
}

function airportDisplayLabel(airport) {
	const code = airport.iata || airport.icao;
	return `${code ? `${code} — ` : ''}${airport.name} (${airport.city})`;
}

function airportMatchesQuery(airport, normalizedQuery) {
	if (!normalizedQuery) return true;
	const haystack = normalizeText(`${airport.iata} ${airport.icao} ${airport.name} ${airport.city}`);
	return haystack.includes(normalizedQuery);
}

function createAirportCombobox(inputEl, listEl) {
	let airports = [];
	let filtered = [];
	let activeIndex = -1;
	let selectedAirport = null;

	function closeList() {
		listEl.classList.add('hidden');
		listEl.innerHTML = '';
		inputEl.setAttribute('aria-expanded', 'false');
		activeIndex = -1;
	}

	function renderList(query) {
		const normalizedQuery = normalizeText(query);
		filtered = airports.filter((airport) => airportMatchesQuery(airport, normalizedQuery)).slice(0, MAX_SUGGESTIONS);

		listEl.innerHTML = '';

		if (!filtered.length) {
			const empty = document.createElement('p');
			empty.className = 'airport-combobox-empty';
			empty.textContent = airports.length ? 'Nenhum aeroporto encontrado.' : 'Carregando aeroportos...';
			listEl.appendChild(empty);
			listEl.classList.remove('hidden');
			inputEl.setAttribute('aria-expanded', 'true');
			return;
		}

		filtered.forEach((airport, index) => {
			const option = document.createElement('button');
			option.type = 'button';
			option.className = 'airport-option';
			option.setAttribute('role', 'option');
			option.dataset.index = String(index);
			const code = airport.iata || airport.icao;
			option.innerHTML = `<strong>${code}</strong> — ${airport.name} (${airport.city})`;
			option.addEventListener('mousedown', (event) => {
				event.preventDefault();
				selectAirport(airport);
			});
			listEl.appendChild(option);
		});

		activeIndex = -1;
		listEl.classList.remove('hidden');
		inputEl.setAttribute('aria-expanded', 'true');
	}

	function setActive(index) {
		const options = listEl.querySelectorAll('.airport-option');
		options.forEach((node) => node.classList.remove('is-active'));
		if (index >= 0 && index < options.length) {
			options[index].classList.add('is-active');
			options[index].scrollIntoView({ block: 'nearest' });
		}
		activeIndex = index;
	}

	function selectAirport(airport) {
		selectedAirport = airport;
		inputEl.value = airportDisplayLabel(airport);
		inputEl.classList.add('has-selection');
		closeList();
	}

	inputEl.addEventListener('input', () => {
		if (selectedAirport) {
			selectedAirport = null;
			inputEl.classList.remove('has-selection');
		}
		renderList(inputEl.value);
	});

	inputEl.addEventListener('focus', () => {
		if (!inputEl.disabled) renderList(inputEl.value);
	});

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
				selectAirport(filtered[activeIndex]);
			}
		} else if (event.key === 'Escape') {
			closeList();
		}
	});

	document.addEventListener('click', (event) => {
		if (!inputEl.contains(event.target) && !listEl.contains(event.target)) closeList();
	});

	return {
		setAirports(list) {
			airports = list;
			selectedAirport = null;
			inputEl.classList.remove('has-selection');
			inputEl.value = '';
			inputEl.disabled = !list.length;
			inputEl.placeholder = list.length
				? 'Pesquisar por cidade, nome ou código...'
				: 'Nenhum aeroporto disponível';
			closeList();
		},
		getSelectedAirport() {
			return selectedAirport;
		},
		reset() {
			selectedAirport = null;
			inputEl.value = '';
			inputEl.classList.remove('has-selection');
			closeList();
		}
	};
}

const originCombobox = createAirportCombobox(document.getElementById('origin-airport-input'), document.getElementById('origin-airport-list'));
const destCombobox = createAirportCombobox(document.getElementById('dest-airport-input'), document.getElementById('dest-airport-list'));

function populateCountrySelects() {
	[originCountrySelect, destCountrySelect].forEach((select) => {
		COUNTRIES.forEach((country) => {
			const option = document.createElement('option');
			option.value = country.slug;
			option.textContent = `${country.flag} ${country.label}`;
			select.appendChild(option);
		});
	});
	originCountrySelect.value = COUNTRIES[0].slug;
	destCountrySelect.value = COUNTRIES.length > 1 ? COUNTRIES[1].slug : COUNTRIES[0].slug;
}

async function fetchAirportsForCountry(slug) {
	if (airportsCache.has(slug)) return airportsCache.get(slug);

	const url = `${apiBaseUrl}/api/airports-list/${slug}`;
	const response = await fetch(url);
	if (!response.ok) throw new Error('Não foi possível carregar os aeroportos.');
	const data = await response.json();
	const airports = Array.isArray(data.airports) ? data.airports : [];
	airportsCache.set(slug, airports);
	return airports;
}

async function loadAirportsInto(countrySlug, combobox) {
	combobox.setAirports([]);

	try {
		const airports = await fetchAirportsForCountry(countrySlug);
		combobox.setAirports(airports);
	} catch (error) {
		setError(window.location.protocol === 'file:'
			? 'Não foi possível carregar os aeroportos. Abra a página via servidor local (npm start).'
			: 'Não foi possível carregar os aeroportos agora. Tente novamente em instantes.');
		console.error(error);
	}
}

function getCountryInfo(slug) {
	return COUNTRIES.find((country) => country.slug === slug) || { label: slug, flag: '' };
}

function populateManufacturerFilter() {
	const manufacturers = [];
	aircraftModels.forEach((model) => {
		if (!manufacturers.includes(model.manufacturer)) manufacturers.push(model.manufacturer);
	});

	const allOption = document.createElement('option');
	allOption.value = '';
	allOption.textContent = 'Todos';
	manufacturerFilter.appendChild(allOption);

	manufacturers.forEach((manufacturer) => {
		const option = document.createElement('option');
		option.value = manufacturer;
		option.textContent = manufacturer;
		manufacturerFilter.appendChild(option);
	});
}

function renderAircraftGrid(filterManufacturer) {
	aircraftGrid.innerHTML = '';

	aircraftModels.forEach((aircraft, index) => {
		if (filterManufacturer && aircraft.manufacturer !== filterManufacturer) return;

		const card = document.createElement('button');
		card.type = 'button';
		card.className = 'aircraft-pick';
		card.setAttribute('role', 'radio');
		card.setAttribute('aria-pressed', String(state.selectedAircraftIndex === index));
		card.setAttribute('aria-checked', String(state.selectedAircraftIndex === index));
		card.innerHTML = `
			<span class="aircraft-pick-name">${aircraft.name}</span>
			<span class="aircraft-pick-meta">Velocidade: ${aircraft.velocidadeKmh} km/h</span>
			<span class="aircraft-pick-meta">Raio: ${aircraft.tipo}</span>
		`;
		card.addEventListener('click', () => {
			state.selectedAircraftIndex = index;
			aircraftGrid.querySelectorAll('.aircraft-pick').forEach((node) => {
				node.setAttribute('aria-pressed', 'false');
				node.setAttribute('aria-checked', 'false');
			});
			card.setAttribute('aria-pressed', 'true');
			card.setAttribute('aria-checked', 'true');
		});

		aircraftGrid.appendChild(card);
	});
}

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
	const toRad = (value) => (value * Math.PI) / 180;
	const earthRadiusKm = 6371;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return earthRadiusKm * c;
}

function formatDuration(totalMinutes) {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = Math.round(totalMinutes % 60);
	if (hours <= 0) return `${minutes} Minutos`;
	if (minutes === 0) return `${hours} Hora${hours === 1 ? '' : 's'}`;
	return `${hours} Hora${hours === 1 ? '' : 's'} e ${minutes} Minutos`;
}

async function runSimulation() {
	setError(null);

	const origin = originCombobox.getSelectedAirport();
	const destination = destCombobox.getSelectedAirport();

	if (!origin || !destination) {
		setError('Selecione o aeroporto de origem e o de destino na lista de sugestões.');
		return;
	}

	if (state.selectedAircraftIndex === null) {
		setError('Selecione um modelo de aeronave.');
		return;
	}

	if (origin.icao === destination.icao) {
		setError('Escolha aeroportos de origem e destino diferentes.');
		return;
	}

	const aircraft = aircraftModels[state.selectedAircraftIndex];
	const distanceKm = haversineDistanceKm(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
	const cruiseMinutes = (distanceKm / aircraft.velocidadeKmh) * 60;
	const totalMinutes = cruiseMinutes + MANEUVER_MINUTES;

	const originCountryInfo = getCountryInfo(originCountrySelect.value);
	const destCountryInfo = getCountryInfo(destCountrySelect.value);

	document.getElementById('result-origin-flag').textContent = originCountryInfo.flag;
	document.getElementById('result-origin-code').textContent = origin.iata || origin.icao;
	document.getElementById('result-origin-city').textContent = origin.city;

	document.getElementById('result-dest-flag').textContent = destCountryInfo.flag;
	document.getElementById('result-dest-code').textContent = destination.iata || destination.icao;
	document.getElementById('result-dest-city').textContent = destination.city;

	document.getElementById('result-time').textContent = formatDuration(totalMinutes);
	document.getElementById('result-distance').textContent = `~${Math.round(distanceKm).toLocaleString('pt-BR')} km`;
	document.getElementById('result-aircraft').textContent = `${aircraft.name} (${aircraft.velocidadeKmh} km/h)`;
	document.getElementById('result-cruise-time').textContent = formatDuration(cruiseMinutes);
	document.getElementById('result-maneuver-time').textContent = `+ ${MANEUVER_MINUTES}m`;

	simResults.classList.remove('hidden');
	simResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetSimulation() {
	simResults.classList.add('hidden');
	setError(null);
}

originCountrySelect.addEventListener('change', () => {
	loadAirportsInto(originCountrySelect.value, originCombobox);
});

destCountrySelect.addEventListener('change', () => {
	loadAirportsInto(destCountrySelect.value, destCombobox);
});

manufacturerFilter.addEventListener('change', () => {
	renderAircraftGrid(manufacturerFilter.value);
});

simButton.addEventListener('click', runSimulation);
simResetButton.addEventListener('click', resetSimulation);

populateCountrySelects();
populateManufacturerFilter();
renderAircraftGrid('');
loadAirportsInto(originCountrySelect.value, originCombobox);
loadAirportsInto(destCountrySelect.value, destCombobox);
