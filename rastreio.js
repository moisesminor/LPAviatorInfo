(function () {
	'use strict';

	const EARTH_RADIUS_KM = 6371;

	const form = document.getElementById('track-form');
	const input = document.getElementById('flight-input');
	const button = document.getElementById('track-button');
	const errorEl = document.getElementById('track-error');
	const emptyEl = document.getElementById('track-empty');
	const resultEl = document.getElementById('track-result');
	const refreshButton = document.getElementById('radar-refresh');
	const featuredWrap = document.getElementById('featured-flights');
	const featuredList = document.getElementById('featured-flights-list');

	const STATUS_MAP = {
		scheduled: { label: 'Programado', className: 'bg-slate-500/80 text-white' },
		active: { label: 'Em voo', className: 'bg-emerald-500 text-white' },
		landed: { label: 'Pousou', className: 'bg-sky-500 text-white' },
		cancelled: { label: 'Cancelado', className: 'bg-rose-600 text-white' },
		incident: { label: 'Incidente', className: 'bg-rose-600 text-white' },
		diverted: { label: 'Desviado', className: 'bg-amber-500 text-[#102d55]' }
	};

	let map = null;
	let depMarker = null;
	let arrMarker = null;
	let planeMarker = null;
	let routeLine = null;
	let currentFlightCode = '';

	function toRad(value) {
		return (value * Math.PI) / 180;
	}

	function haversineKm(a, b) {
		if (!a || !b || a.lat == null || a.lon == null || b.lat == null || b.lon == null) return null;
		const dLat = toRad(b.lat - a.lat);
		const dLon = toRad(b.lon - a.lon);
		const lat1 = toRad(a.lat);
		const lat2 = toRad(b.lat);
		const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
		return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
	}

	function interpolate(a, b, fraction) {
		if (!a || !b) return null;
		return {
			lat: a.lat + (b.lat - a.lat) * fraction,
			lon: a.lon + (b.lon - a.lon) * fraction
		};
	}

	function cruiseProfileForDistance(totalKm) {
		if (totalKm < 300) return { altitudeFt: 20000, speedKmh: 550 };
		if (totalKm < 800) return { altitudeFt: 29000, speedKmh: 750 };
		if (totalKm < 2000) return { altitudeFt: 35000, speedKmh: 850 };
		return { altitudeFt: 39000, speedKmh: 900 };
	}

	function estimateFlightDynamics(elapsedMinutes, totalMinutes, totalKm) {
		if (!totalMinutes || totalMinutes <= 0) return null;
		const { altitudeFt: cruiseAlt, speedKmh: cruiseSpeed } = cruiseProfileForDistance(totalKm);

		let climbMinutes = Math.min(Math.max(totalMinutes * 0.25, 5), 20);
		let descentMinutes = Math.min(Math.max(totalMinutes * 0.25, 5), 20);
		if (climbMinutes + descentMinutes > totalMinutes * 0.9) {
			climbMinutes = totalMinutes * 0.45;
			descentMinutes = totalMinutes * 0.45;
		}

		if (elapsedMinutes <= climbMinutes) {
			const cf = climbMinutes > 0 ? elapsedMinutes / climbMinutes : 1;
			return { altitude_ft: cruiseAlt * cf, speed_kmh: cruiseSpeed * (0.35 + 0.65 * cf) };
		}

		if (elapsedMinutes >= totalMinutes - descentMinutes) {
			const df = descentMinutes > 0 ? Math.max(0, (totalMinutes - elapsedMinutes) / descentMinutes) : 0;
			return { altitude_ft: cruiseAlt * df, speed_kmh: cruiseSpeed * (0.35 + 0.65 * df) };
		}

		return { altitude_ft: cruiseAlt, speed_kmh: cruiseSpeed };
	}

	function bearing(a, b) {
		if (!a || !b) return 0;
		const lat1 = toRad(a.lat);
		const lat2 = toRad(b.lat);
		const dLon = toRad(b.lon - a.lon);
		const y = Math.sin(dLon) * Math.cos(lat2);
		const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
		return (Math.abs(Math.atan2(y, x) * (180 / Math.PI)) + 360) % 360;
	}

	function formatTime(isoString) {
		if (!isoString) return '—';
		const date = new Date(isoString);
		if (Number.isNaN(date.getTime())) return '—';
		return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
	}

	function formatDuration(ms) {
		if (ms == null || Number.isNaN(ms)) return '—';
		const totalMinutes = Math.round(ms / 60000);
		if (totalMinutes <= 0) return '0min';
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
	}

	function setError(message) {
		errorEl.textContent = message;
		errorEl.classList.toggle('hidden', !message);
	}

	function planeIcon(rotationDeg) {
		return L.divIcon({
			className: 'plane-marker',
			html: `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" style="transform:rotate(${rotationDeg}deg)"><path d="M2 12l8-2 6-8 2 1-4 8 6-1 2 2-7 4 1 5-2 1-3-6-6 3-1-2 4-4z"></path></svg>`,
			iconSize: [26, 26],
			iconAnchor: [13, 13]
		});
	}

	function airportIcon() {
		return L.divIcon({ className: 'airport-marker', iconSize: [10, 10], iconAnchor: [5, 5] });
	}

	function ensureMap() {
		if (map) return map;
		map = L.map('track-map', { zoomControl: true, attributionControl: true }).setView([-14, -55], 3);
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 19
		}).addTo(map);
		return map;
	}

	function updateMap({ dep, arr, planePos, planeBearing }) {
		const leafletMap = ensureMap();
		const bounds = [];

		if (dep) {
			const pos = [dep.lat, dep.lon];
			if (!depMarker) depMarker = L.marker(pos, { icon: airportIcon() }).addTo(leafletMap);
			else depMarker.setLatLng(pos);
			bounds.push(pos);
		}

		if (arr) {
			const pos = [arr.lat, arr.lon];
			if (!arrMarker) arrMarker = L.marker(pos, { icon: airportIcon() }).addTo(leafletMap);
			else arrMarker.setLatLng(pos);
			bounds.push(pos);
		}

		if (dep && arr) {
			const line = [[dep.lat, dep.lon], [arr.lat, arr.lon]];
			if (!routeLine) routeLine = L.polyline(line, { color: '#38bdf8', weight: 2, opacity: 0.6, dashArray: '6 8' }).addTo(leafletMap);
			else routeLine.setLatLngs(line);
		}

		if (planePos) {
			const pos = [planePos.lat, planePos.lon];
			if (!planeMarker) planeMarker = L.marker(pos, { icon: planeIcon(planeBearing) }).addTo(leafletMap);
			else {
				planeMarker.setLatLng(pos);
				planeMarker.setIcon(planeIcon(planeBearing));
			}
			bounds.push(pos);
		}

		if (bounds.length > 1) {
			leafletMap.fitBounds(bounds, { padding: [48, 48], maxZoom: 8 });
		} else if (bounds.length === 1) {
			leafletMap.setView(bounds[0], 6);
		}
	}

	async function fetchAirportCoords(code) {
		if (!code) return null;
		try {
			const response = await fetch(`/api/airport-coords/${encodeURIComponent(code)}`);
			if (!response.ok) return null;
			const data = await response.json();
			if (Number.isNaN(data.lat) || Number.isNaN(data.lon)) return null;
			return { lat: data.lat, lon: data.lon };
		} catch (error) {
			return null;
		}
	}

	function renderStatus(status) {
		const info = STATUS_MAP[status] || { label: 'Desconhecido', className: 'bg-slate-500/80 text-white' };
		const el = document.getElementById('info-status');
		el.textContent = info.label;
		el.className = `shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${info.className}`;
	}

	async function renderFlight(flight) {
		setError('');

		document.getElementById('info-airline').textContent = flight.airline || 'Companhia não identificada';
		document.getElementById('info-flight').textContent = [flight.airline_iata, flight.flight_iata || flight.flight_number].filter(Boolean).join(' ');
		renderStatus(flight.status);

		document.getElementById('info-dep-code').textContent = flight.departure.iata || '—';
		document.getElementById('info-dep-city').textContent = flight.departure.airport || '';
		document.getElementById('info-arr-code').textContent = flight.arrival.iata || '—';
		document.getElementById('info-arr-city').textContent = flight.arrival.airport || '';
		document.getElementById('info-dep-time').textContent = formatTime(flight.departure.scheduled);
		document.getElementById('info-arr-time').textContent = formatTime(flight.arrival.scheduled);

		const aircraft = flight.aircraft || {};
		const aircraftWrap = document.getElementById('info-aircraft-wrap');
		if (aircraft.registration || aircraft.iata || aircraft.icao) {
			aircraftWrap.classList.remove('hidden');
			aircraftWrap.classList.add('flex');
			document.getElementById('info-aircraft-airline').textContent = flight.airline || 'Aeronave';
			document.getElementById('info-aircraft-detail').textContent = [
				aircraft.iata && `Tipo ${aircraft.iata}`,
				aircraft.registration
			].filter(Boolean).join(' · ') || '—';
		} else {
			aircraftWrap.classList.add('hidden');
			aircraftWrap.classList.remove('flex');
		}

		const live = flight.live || {};

		const [dep, arr] = await Promise.all([
			fetchAirportCoords(flight.departure.icao || flight.departure.iata),
			fetchAirportCoords(flight.arrival.icao || flight.arrival.iata)
		]);

		const now = Date.now();
		const depTime = flight.departure.actual || flight.departure.scheduled;
		const arrTime = flight.arrival.scheduled;
		const depMs = depTime ? new Date(depTime).getTime() : null;
		const arrMs = arrTime ? new Date(arrTime).getTime() : null;

		let fraction = null;
		if (depMs && arrMs && arrMs > depMs) {
			fraction = Math.min(1, Math.max(0, (now - depMs) / (arrMs - depMs)));
		}
		if (flight.status === 'landed') fraction = 1;

		const hasLivePos = live.latitude != null && live.longitude != null;
		const livePos = hasLivePos ? { lat: live.latitude, lon: live.longitude } : null;
		const estimatedPos = !hasLivePos && dep && arr && fraction != null ? interpolate(dep, arr, fraction) : null;
		const planePos = livePos || estimatedPos;

		const totalKm = haversineKm(dep, arr);
		const coveredKm = hasLivePos ? haversineKm(dep, livePos) : (totalKm != null && fraction != null ? totalKm * fraction : null);
		const progressPct = totalKm && coveredKm != null ? Math.min(100, Math.max(0, (coveredKm / totalKm) * 100)) : (fraction != null ? fraction * 100 : null);

		const totalMinutes = depMs && arrMs ? (arrMs - depMs) / 60000 : null;
		const isInFlight = flight.status === 'active' && fraction != null && fraction > 0 && fraction < 1;
		const estimatedDynamics = !hasLivePos && isInFlight && totalKm != null && totalMinutes
			? estimateFlightDynamics(fraction * totalMinutes, totalMinutes, totalKm)
			: null;

		const altitudeFt = live.altitude_ft != null ? live.altitude_ft : estimatedDynamics?.altitude_ft;
		const speedKmh = live.speed_kmh != null ? live.speed_kmh : estimatedDynamics?.speed_kmh;
		const direction = live.direction != null ? live.direction : (estimatedDynamics && dep && arr ? bearing(dep, arr) : null);
		const isEstimatedDynamics = live.altitude_ft == null && Boolean(estimatedDynamics);

		document.getElementById('stat-altitude').textContent = altitudeFt != null ? `${isEstimatedDynamics ? '≈ ' : ''}${Math.round(altitudeFt)} ft` : '—';
		document.getElementById('stat-speed').textContent = speedKmh != null ? `${isEstimatedDynamics ? '≈ ' : ''}${Math.round(speedKmh)} km/h` : '—';
		document.getElementById('stat-direction').textContent = direction != null ? `${isEstimatedDynamics ? '≈ ' : ''}${Math.round(direction)}°` : '—';

		document.getElementById('info-timeline-fill').style.width = `${progressPct != null ? progressPct : 0}%`;
		document.getElementById('stat-progress').textContent = totalKm != null
			? `${progressPct != null ? Math.round(progressPct) : 0}% (${Math.round(coveredKm || 0)}/${Math.round(totalKm)} km)`
			: (progressPct != null ? `${Math.round(progressPct)}%` : '—');

		let remainingLabel = '—';
		if (arrMs) {
			const remainingMs = arrMs - now;
			remainingLabel = remainingMs > 0 ? formatDuration(remainingMs) : 'Chegando';
		}
		document.getElementById('stat-remaining').textContent = flight.status === 'landed' ? 'Pousou' : remainingLabel;

		const liveNote = document.getElementById('stat-live-note');
		if (hasLivePos) {
			liveNote.classList.add('hidden');
		} else if (isEstimatedDynamics) {
			liveNote.textContent = 'A API não fornece telemetria ao vivo (é preciso um plano AviationStack com Real-Time Flight Tracking). Os valores com "≈" são estimados pela fase do voo (subida/cruzeiro/descida) e pela rota entre os aeroportos.';
			liveNote.classList.remove('hidden');
		} else {
			liveNote.textContent = 'Altitude, velocidade e posição ao vivo requerem um plano AviationStack com Real-Time Flight Tracking. A posição no mapa é estimada pelo horário do voo.';
			liveNote.classList.remove('hidden');
		}

		const planeBearing = planePos && dep && arr ? bearing(dep, arr) : 0;
		updateMap({ dep, arr, planePos, planeBearing });
	}

	function updateRadarPanel() {
		document.getElementById('radar-updated').textContent = `Atualizado: ${new Date().toLocaleTimeString('pt-BR')}`;
	}

	async function trackFlight(code, options) {
		const silent = options && options.silent;
		const trigger = silent ? refreshButton : button;
		trigger.disabled = true;
		if (!silent) setError('');

		try {
			const response = await fetch(`/api/flights/search?flight_iata=${encodeURIComponent(code)}&limit=1`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Erro ao consultar o voo.');
			}

			const flight = Array.isArray(data.results) ? data.results[0] : null;

			if (!flight) {
				resultEl.classList.add('hidden');
				emptyEl.classList.remove('hidden');
				setError(`Nenhum voo encontrado para "${code}".`);
				return;
			}

			emptyEl.classList.add('hidden');
			resultEl.classList.remove('hidden');
			currentFlightCode = code;

			await renderFlight(flight);
			updateRadarPanel();
		} catch (error) {
			setError(error.message || 'Falha ao buscar o voo.');
		} finally {
			trigger.disabled = false;
		}
	}

	function renderFeaturedFlights(flights) {
		if (!flights || !flights.length) {
			featuredWrap.classList.add('hidden');
			return;
		}

		featuredList.innerHTML = '';
		flights.forEach((flight) => {
			const live = flight.live || {};
			const chip = document.createElement('button');
			chip.type = 'button';
			chip.className = 'flex items-center gap-1.5 rounded-full border border-[#1261bd]/25 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#102d55] shadow-sm transition hover:border-[#1261bd] hover:bg-[#eef5fe]';

			const label = document.createElement('span');
			label.textContent = `${flight.flight_iata} · ${flight.airline} · ${flight.dep_iata}→${flight.arr_iata}`;
			chip.appendChild(label);

			if (flight.status === 'active') {
				const badge = document.createElement('span');
				badge.className = 'inline-flex animate-pulse items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white';
				badge.textContent = live.is_live ? 'Ao vivo' : 'Em voo';
				chip.appendChild(badge);

				const details = [];
				if (live.altitude_ft != null) details.push(`${Math.round(live.altitude_ft)} ft`);
				if (live.speed_kmh != null) details.push(`${Math.round(live.speed_kmh)} km/h`);
				if (live.direction != null) details.push(`${Math.round(live.direction)}°`);
				if (details.length) {
					const meta = document.createElement('span');
					meta.className = 'text-[11px] font-normal text-[#48576b]';
					meta.textContent = details.join(' · ');
					chip.appendChild(meta);
				}
			}

			chip.addEventListener('click', () => {
				input.value = flight.flight_iata;
				setError('');
				trackFlight(flight.flight_iata);
			});
			featuredList.appendChild(chip);
		});
		featuredWrap.classList.remove('hidden');
		featuredWrap.classList.add('flex');
	}

	async function loadFeaturedFlights() {
		try {
			const response = await fetch('/api/flights/featured');
			if (!response.ok) return;
			const data = await response.json();
			renderFeaturedFlights(data.flights);
		} catch (error) {
			// Sem voos em destaque disponíveis; a busca manual continua funcionando.
		}
	}

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const code = input.value.trim().toUpperCase();
		if (!code) {
			setError('Informe um número de voo.');
			return;
		}
		trackFlight(code);
	});

	refreshButton.addEventListener('click', () => {
		if (currentFlightCode) trackFlight(currentFlightCode, { silent: true });
	});

	loadFeaturedFlights();
	setInterval(loadFeaturedFlights, 3 * 60 * 1000);
})();
