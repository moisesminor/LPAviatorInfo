import { normalizeFlightData } from '../../_lib/airports.js';

const flightSearchCache = new Map();
const FLIGHT_SEARCH_CACHE_TTL_MS = 1000 * 60 * 5;

export async function onRequestGet(context) {
  const { request, env } = context;
  const apiKey = env.AVIATIONSTACK_API_KEY;

  if (!apiKey) {
    return Response.json({
      error: 'AVIATIONSTACK_API_KEY não configurado. Adicione a chave nas variáveis de ambiente do projeto.'
    }, { status: 400 });
  }

  const params = new URL(request.url).searchParams;
  const query = {
    access_key: apiKey,
    limit: Math.min(Math.max(Number(params.get('limit')) || 10, 1), 20)
  };

  const flightIata = String(params.get('flight_iata') || '').trim();
  const flightIcao = String(params.get('flight_icao') || '').trim();
  const airlineIata = String(params.get('airline_iata') || '').trim();
  const depIata = String(params.get('dep_iata') || '').trim();
  const arrIata = String(params.get('arr_iata') || '').trim();
  const status = String(params.get('status') || '').trim();

  if (flightIata) query.flight_iata = flightIata.toUpperCase();
  if (flightIcao) query.flight_icao = flightIcao.toUpperCase();
  if (airlineIata) query.airline_iata = airlineIata.toUpperCase();
  if (depIata) query.dep_iata = depIata.toUpperCase();
  if (arrIata) query.arr_iata = arrIata.toUpperCase();
  if (status) query.flight_status = status;

  const cacheKey = JSON.stringify(query);
  const cached = flightSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.loadedAt < FLIGHT_SEARCH_CACHE_TTL_MS) {
    return Response.json(cached.data);
  }

  try {
    const url = `https://api.aviationstack.com/v1/flights?${new URLSearchParams(query).toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      return Response.json({
        error: 'Erro ao consultar a API do AviationStack.',
        details: text
      }, { status: response.status });
    }

    const data = await response.json();
    const results = Array.isArray(data?.data) ? data.data.map(normalizeFlightData) : [];
    const payload = { pagination: data?.pagination || null, results };

    flightSearchCache.set(cacheKey, { data: payload, loadedAt: Date.now() });
    return Response.json(payload);
  } catch (error) {
    return Response.json({
      error: 'Falha ao acessar a API do AviationStack.',
      details: error.message
    }, { status: 500 });
  }
}
