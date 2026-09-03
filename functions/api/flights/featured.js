const featuredFlightsCache = new Map();
const FEATURED_FLIGHTS_CACHE_TTL_MS = 1000 * 60 * 3;

export async function onRequestGet(context) {
  const { request, env } = context;
  const apiKey = env.AVIATIONSTACK_API_KEY;

  if (!apiKey) {
    return Response.json({
      error: 'AVIATIONSTACK_API_KEY não configurado. Adicione a chave nas variáveis de ambiente do projeto.'
    }, { status: 400 });
  }

  const params = new URL(request.url).searchParams;
  const depIata = String(params.get('dep_iata') || 'GRU').trim().toUpperCase();
  const cached = featuredFlightsCache.get(depIata);

  if (cached && Date.now() - cached.loadedAt < FEATURED_FLIGHTS_CACHE_TTL_MS) {
    return Response.json({ dep_iata: depIata, flights: cached.data });
  }

  try {
    const query = { access_key: apiKey, dep_iata: depIata, flight_status: 'active', limit: 30 };
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
      .sort((a, b) => Number(b.live.is_live) - Number(a.live.is_live))
      .slice(0, 6);

    featuredFlightsCache.set(depIata, { data: flights, loadedAt: Date.now() });
    return Response.json({ dep_iata: depIata, flights });
  } catch (error) {
    return Response.json({
      error: 'Falha ao acessar a API do AviationStack.',
      details: error.message
    }, { status: 500 });
  }
}
