const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const airportDetailsCache = new Map();
const flightSearchCache = new Map();
const FLIGHT_SEARCH_CACHE_TTL_MS = 1000 * 60 * 5;
const featuredFlightsCache = new Map();
const FEATURED_FLIGHTS_CACHE_TTL_MS = 1000 * 60 * 3;
const allAirportsRawCache = { data: null, loadedAt: 0 };
const airportsByCountryCache = new Map();
const resolvedAirportsByCountryCache = new Map();
const RESOLVED_CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const PHOTO_RESOLUTION_CONCURRENCY = 10;
const COUNTRY_BY_SLUG = {
  brasil: 'Brazil',
  usa: 'United States'
};
const airportPhotoMap = {
  GRU: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
  GIG: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Aeroporto_galeao_rj_ME.jpg',
  CGH: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Aeroporto_de_Congonhas_-_Aeronaves.jpg',
  BSB: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Brasilia_airport_terminal.jpg',
  REC: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Recife_airport.jpg',
  SSA: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Salvador_Bahia_Airport_-_SSA.jpg',
  POA: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Aeroporto_Salgado_Filho_de_Porto_Alegre.jpg',
  FOR: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Vista_do_Aeroporto_Internacional_de_Fortaleza_Pinto_Martins.jpg/1280px-Vista_do_Aeroporto_Internacional_de_Fortaleza_Pinto_Martins.jpg',
  MAO: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Manaus_International_Airport.jpg',
  BEL: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/A330-200_TAP_%28CS-TOH%29_Star_Alliance_scheme%2C_arriving_in_Belem_PA.jpg',
  PVH: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Aeroporto_Internacional_de_Porto_Velho.jpg',
  RBR: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Riobranco_aeroporto.jpg',
  MCP: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Aeroporto_Internacional_de_Macap%C3%A1.jpg',
  BVB: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Entrada_do_Aeroporto_Internacional_de_Boa_Vista_-_Atlas_Brasil_Cantanhede%2C_Boa_Vista_RR.jpg',
  MCZ: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=1200&q=80',
  VIX: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Novo_Aeroporto_de_VIX.png',
  GYN: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Aeroporto_Santa_Genoveva%2C_Goi%C3%A2nia%2C_agosto_de_2018.jpg',
  SLZ: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Terminal_do_Aeroporto_Cunha_Machado.JPG',
  CGB: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Aeroporto_de_Cuiab%C3%A101.JPG',
  CGR: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Aeroporto_Internacional_de_Campo_Grande_MS%2C_20-07-2025.jpg',
  JPA: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Presidente_Castro_Pinto_International_Airport.jpg',
  CWB: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Aeroporto_Internacional_Afonso_Pena_S%C3%A3o_Jos%C3%A9_dos_Pinhais_Paran%C3%A1_Brasil.jpg',
  THE: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Aeroporto_de_Teresina_Senador_Petr%C3%B4nio_Portella_.jpg',
  NAT: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Aeroporto_S%C3%A3o_Gon%C3%A7alo_guich%C3%AAs.jpg',
  FLN: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1200&q=80',
  AJU: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Sagu%C3%A3o_do_Aeroporto_de_Aracaju.jpg',
  PMW: 'https://afnoticias.com.br/static/cache/2026/438a56df5e0d09bd4abbcaf5327294c4.jpg'
};
const genericAirportImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80';
const wikipediaPhotoCache = new Map();

async function fetchWikipediaAirportPhoto(airportName) {
  const query = String(airportName || '').trim();
  if (!query) return null;

  if (wikipediaPhotoCache.has(query)) {
    return wikipediaPhotoCache.get(query);
  }

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=800&origin=*`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'AviatorInfo/1.0 (https://github.com/moisesminor)' }
    });

    if (!response.ok) {
      wikipediaPhotoCache.set(query, null);
      return null;
    }

    const data = await response.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
    const source = pages[0]?.thumbnail?.source || null;
    const isLowQuality = source && (/\/svg\//i.test(source) || /logo|diagram|map|seal|emblem|chart|locator|sign/i.test(source));
    const photo = isLowQuality ? null : source;

    wikipediaPhotoCache.set(query, photo);
    return photo;
  } catch (error) {
    wikipediaPhotoCache.set(query, null);
    return null;
  }
}

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

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.replace(/^"|"$/g, '').trim());
}

async function getAllAirportsRaw() {
  const now = Date.now();

  if (allAirportsRawCache.data && now - allAirportsRawCache.loadedAt < 1000 * 60 * 60 * 12) {
    return allAirportsRawCache.data;
  }

  const response = await fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat');

  if (!response.ok) {
    throw new Error('Não foi possível carregar a base de aeroportos');
  }

  const text = await response.text();
  const rows = text.split('\n').filter(Boolean).map((line) => parseCsvLine(line));

  allAirportsRawCache.data = rows;
  allAirportsRawCache.loadedAt = now;
  return rows;
}

async function getAirportsListByCountry(countryName) {
  const now = Date.now();
  const cached = airportsByCountryCache.get(countryName);

  if (cached && now - cached.loadedAt < 1000 * 60 * 60 * 12) {
    return cached.data;
  }

  const rows = await getAllAirportsRaw();
  const airports = rows
    .filter((cols) => cols.length >= 14 && cols[3] === countryName)
    .filter((cols) => cols[5] && cols[5] !== '\\N')
    .map((cols) => ({
      id: Number(cols[0]) || null,
      name: cols[1] || 'Aeroporto',
      city: cols[2] || countryName,
      country: cols[3] || countryName,
      iata: cols[4] && cols[4] !== '\\N' ? cols[4] : '',
      icao: cols[5] || '',
      latitude: Number(cols[6]) || null,
      longitude: Number(cols[7]) || null,
      altitude: Number(cols[8]) || null
    }))
    .filter((airport) => airport.icao)
    .sort((a, b) => a.name.localeCompare(b.name));

  airportsByCountryCache.set(countryName, { data: airports, loadedAt: now });
  return airports;
}

const airportCoordsCache = new Map();

async function findAirportCoordsByCode(code) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (!normalizedCode) return null;

  if (airportCoordsCache.has(normalizedCode)) {
    return airportCoordsCache.get(normalizedCode);
  }

  const rows = await getAllAirportsRaw();
  const match = rows.find((cols) => cols.length >= 8 && (cols[4] === normalizedCode || cols[5] === normalizedCode));

  const result = match
    ? {
        name: match[1] || null,
        city: match[2] || null,
        iata: match[4] && match[4] !== '\\N' ? match[4] : null,
        icao: match[5] || null,
        lat: Number(match[6]),
        lon: Number(match[7])
      }
    : null;

  const coords = result && !Number.isNaN(result.lat) && !Number.isNaN(result.lon) ? result : null;
  airportCoordsCache.set(normalizedCode, coords);
  return coords;
}

async function fetchAirportDetailsByIcao(icao) {
  const normalizedIcao = String(icao).trim().toUpperCase();
  if (!normalizedIcao) return null;

  if (airportDetailsCache.has(normalizedIcao)) {
    return airportDetailsCache.get(normalizedIcao);
  }

  const apiToken = process.env.AIRPORTDB_API_TOKEN;

  if (!apiToken) {
    return null;
  }

  try {
    const response = await fetch(`https://airportdb.io/api/v1/airport/${normalizedIcao}?apiToken=${apiToken}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    airportDetailsCache.set(normalizedIcao, data);
    return data;
  } catch (error) {
    return null;
  }
}

function normalizeFlightData(flight = {}) {
  const departure = flight.departure || {};
  const arrival = flight.arrival || {};
  const airline = flight.airline || {};
  const live = flight.live || {};
  const aircraft = flight.aircraft || {};

  return {
    flight_date: flight.flight_date || null,
    flight_number: flight.flight?.number || null,
    flight_iata: flight.flight?.iata || null,
    flight_icao: flight.flight?.icao || null,
    airline: airline.name || null,
    airline_iata: airline.iata || null,
    airline_icao: airline.icao || null,
    aircraft: {
      registration: aircraft.registration || null,
      iata: aircraft.iata || null,
      icao: aircraft.icao || null,
      icao24: aircraft.icao24 || null
    },
    departure: {
      airport: departure.airport || departure.airport_name || null,
      iata: departure.iata || departure.airport_iata || null,
      icao: departure.icao || null,
      scheduled: departure.scheduled || departure.estimated || null,
      actual: departure.actual || departure.estimated || null,
      timezone: departure.timezone || null
    },
    arrival: {
      airport: arrival.airport || arrival.airport_name || null,
      iata: arrival.iata || arrival.airport_iata || null,
      icao: arrival.icao || null,
      scheduled: arrival.scheduled || arrival.estimated || null,
      actual: arrival.actual || arrival.estimated || null,
      timezone: arrival.timezone || null
    },
    status: flight.flight_status || 'unknown',
    live: {
      is_live: Boolean(live && Object.keys(live).length),
      latitude: live.latitude ?? null,
      longitude: live.longitude ?? null,
      altitude_ft: live.altitude ?? null,
      speed_kmh: live.speed_horizontal ?? null,
      direction: live.direction ?? null,
      updated_at: live.updated || null
    }
  };
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

async function resolveAirportPhoto(airport, details) {
  const code = String((airport?.iata || airport?.iata_code || airport?.icao || '')).toUpperCase();
  const ident = String((details?.ident || airport?.icao || '')).toUpperCase();
  const photo = details?.photo || details?.image || details?.image_url || details?.thumbnail || null;

  if (photo) return photo;
  if (airportPhotoMap[code]) return airportPhotoMap[code];
  if (airportPhotoMap[ident]) return airportPhotoMap[ident];

  const wikipediaPhoto = await fetchWikipediaAirportPhoto(details?.name || airport?.name);
  if (wikipediaPhoto) return wikipediaPhoto;

  return genericAirportImage;
}

app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/airport/:icao', async (req, res) => {
  const { icao } = req.params;
  const apiToken = process.env.AIRPORTDB_API_TOKEN;

  if (apiToken) {
    try {
      const response = await fetch(`https://airportdb.io/api/v1/airport/${icao.toUpperCase()}?apiToken=${apiToken}`);

      if (response.ok) {
        return res.json(await response.json());
      }
    } catch (error) {
      // AirportDB indisponível: cai para o fallback OpenFlights abaixo.
    }
  }

  try {
    const coords = await findAirportCoordsByCode(icao);

    if (!coords) {
      return res.status(404).json({ error: 'Aeroporto não encontrado.' });
    }

    return res.json({
      ident: coords.icao || String(icao).toUpperCase(),
      icao_code: coords.icao || String(icao).toUpperCase(),
      iata_code: coords.iata || null,
      name: coords.name,
      municipality: coords.city,
      latitude_deg: coords.lat,
      longitude_deg: coords.lon,
      elevation_ft: null,
      runways: [],
      source: 'openflights'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Falha ao buscar dados do aeroporto.',
      details: error.message
    });
  }
});

async function resolveCountryAirports(countryName) {
  const now = Date.now();
  const cached = resolvedAirportsByCountryCache.get(countryName);

  if (cached && now - cached.loadedAt < RESOLVED_CACHE_TTL_MS) {
    return cached.data;
  }

  const airportsBase = await getAirportsListByCountry(countryName);

  const resolved = await mapWithConcurrency(airportsBase, PHOTO_RESOLUTION_CONCURRENCY, async (airport) => {
    const details = await fetchAirportDetailsByIcao(airport.icao);
    const photo = await resolveAirportPhoto(airport, details);

    return {
      ...airport,
      name: details?.name || airport.name,
      municipality: details?.municipality || airport.city,
      city: details?.municipality || airport.city,
      iata_code: details?.iata_code || airport.iata,
      icao: details?.ident || airport.icao,
      latitude_deg: details?.latitude_deg ?? airport.latitude,
      longitude_deg: details?.longitude_deg ?? airport.longitude,
      elevation_ft: details?.elevation_ft ?? airport.altitude,
      runways: details?.runways || [],
      photo,
      description: details?.description || `Terminal estratégico em ${airport.city || countryName}`
    };
  });

  const orderedAirports = resolved.sort((a, b) => {
    const aHasPhoto = a.photo && a.photo !== genericAirportImage ? 1 : 0;
    const bHasPhoto = b.photo && b.photo !== genericAirportImage ? 1 : 0;
    return bHasPhoto - aHasPhoto || a.name.localeCompare(b.name);
  });

  resolvedAirportsByCountryCache.set(countryName, { data: orderedAirports, loadedAt: now });
  return orderedAirports;
}

async function buildAirportsResponse(countryName, req) {
  const offset = Number(req.query.offset) || 0;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const search = normalizeText(req.query.search || '');
  let airports = await resolveCountryAirports(countryName);

  if (search) {
    airports = airports.filter((airport) =>
      normalizeText(airport.city).includes(search) || normalizeText(airport.name).includes(search)
    );
  }

  const total = airports.length;
  const page = airports.slice(offset, offset + limit);

  return { total, offset, limit, airports: page };
}

app.get('/api/airport-coords/:code', async (req, res) => {
  try {
    const coords = await findAirportCoordsByCode(req.params.code);

    if (!coords) {
      return res.status(404).json({ error: 'Aeroporto não encontrado.' });
    }

    return res.json(coords);
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao buscar coordenadas do aeroporto.',
      details: error.message
    });
  }
});

app.get('/api/airports/brasil', async (req, res) => {
  try {
    return res.json(await buildAirportsResponse(COUNTRY_BY_SLUG.brasil, req));
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao carregar os aeroportos brasileiros.',
      details: error.message
    });
  }
});

app.get('/api/airports/usa', async (req, res) => {
  try {
    return res.json(await buildAirportsResponse(COUNTRY_BY_SLUG.usa, req));
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao carregar os aeroportos dos Estados Unidos.',
      details: error.message
    });
  }
});

app.get('/api/airports-list/:slug', async (req, res) => {
  const countryName = COUNTRY_BY_SLUG[req.params.slug];

  if (!countryName) {
    return res.status(404).json({ error: 'País não suportado.' });
  }

  try {
    const airports = await getAirportsListByCountry(countryName);
    return res.json({ country: req.params.slug, total: airports.length, airports });
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao carregar a lista de aeroportos.',
      details: error.message
    });
  }
});

app.get('/api/flights/search', async (req, res) => {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;

  if (!apiKey) {
    return res.status(400).json({
      error: 'AVIATIONSTACK_API_KEY não configurado. Adicione a chave no arquivo .env.'
    });
  }

  const query = {
    access_key: apiKey,
    limit: Math.min(Math.max(Number(req.query.limit) || 10, 1), 20)
  };

  const flightIata = String(req.query.flight_iata || '').trim();
  const flightIcao = String(req.query.flight_icao || '').trim();
  const airlineIata = String(req.query.airline_iata || '').trim();
  const depIata = String(req.query.dep_iata || '').trim();
  const arrIata = String(req.query.arr_iata || '').trim();
  const status = String(req.query.status || '').trim();

  if (flightIata) query.flight_iata = flightIata.toUpperCase();
  if (flightIcao) query.flight_icao = flightIcao.toUpperCase();
  if (airlineIata) query.airline_iata = airlineIata.toUpperCase();
  if (depIata) query.dep_iata = depIata.toUpperCase();
  if (arrIata) query.arr_iata = arrIata.toUpperCase();
  if (status) query.flight_status = status;

  const cacheKey = JSON.stringify(query);
  const cached = flightSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.loadedAt < FLIGHT_SEARCH_CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const url = `https://api.aviationstack.com/v1/flights?${new URLSearchParams(query).toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: 'Erro ao consultar a API do AviationStack.',
        details: text
      });
    }

    const data = await response.json();
    const results = Array.isArray(data?.data) ? data.data.map(normalizeFlightData) : [];
    const payload = { pagination: data?.pagination || null, results };

    flightSearchCache.set(cacheKey, { data: payload, loadedAt: Date.now() });
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({
      error: 'Falha ao acessar a API do AviationStack.',
      details: error.message
    });
  }
});

app.get('/api/flights/featured', async (req, res) => {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;

  if (!apiKey) {
    return res.status(400).json({
      error: 'AVIATIONSTACK_API_KEY não configurado. Adicione a chave no arquivo .env.'
    });
  }

  const depIata = String(req.query.dep_iata || 'GRU').trim().toUpperCase();
  const cached = featuredFlightsCache.get(depIata);

  if (cached && Date.now() - cached.loadedAt < FEATURED_FLIGHTS_CACHE_TTL_MS) {
    return res.json({ dep_iata: depIata, flights: cached.data });
  }

  try {
    const query = { access_key: apiKey, dep_iata: depIata, flight_status: 'active', limit: 30 };
    const url = `https://api.aviationstack.com/v1/flights?${new URLSearchParams(query).toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: 'Erro ao consultar a API do AviationStack.',
        details: text
      });
    }

    const data = await response.json();
    const flights = (Array.isArray(data?.data) ? data.data : [])
      .filter((flight) => flight.flight?.iata && flight.airline?.name && flight.airline.name !== 'empty' && flight.arrival?.iata)
      .map((flight) => {
        const live = flight.live || {};
        return {
          flight_iata: flight.flight.iata,
          airline: flight.airline.name,
          dep_iata: flight.departure?.iata || depIata,
          arr_iata: flight.arrival.iata,
          status: flight.flight_status || 'unknown',
          live: {
            is_live: Boolean(live && live.latitude != null && live.longitude != null),
            altitude_ft: live.altitude ?? null,
            speed_kmh: live.speed_horizontal ?? null,
            direction: live.direction ?? null
          }
        };
      })
      // Prioriza voos com telemetria ao vivo real (altitude/velocidade/direção) antes dos demais ativos.
      .sort((a, b) => Number(b.live.is_live) - Number(a.live.is_live))
      .slice(0, 6);

    featuredFlightsCache.set(depIata, { data: flights, loadedAt: Date.now() });
    return res.json({ dep_iata: depIata, flights });
  } catch (error) {
    return res.status(500).json({
      error: 'Falha ao acessar a API do AviationStack.',
      details: error.message
    });
  }
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota não encontrada' });
  }

  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Use o token no arquivo .env com AIRPORTDB_API_TOKEN');
  });
}

module.exports = { app };
