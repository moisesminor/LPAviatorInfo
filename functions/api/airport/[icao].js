import { findAirportCoordsByCode } from '../../_lib/airports.js';

export async function onRequestGet(context) {
  const { params, env } = context;
  const icao = params.icao;
  const apiToken = env.AIRPORTDB_API_TOKEN;

  if (apiToken) {
    try {
      const response = await fetch(`https://airportdb.io/api/v1/airport/${String(icao).toUpperCase()}?apiToken=${apiToken}`);

      if (response.ok) {
        return Response.json(await response.json());
      }
    } catch (error) {
      // AirportDB indisponível: cai para o fallback OpenFlights abaixo.
    }
  }

  try {
    const coords = await findAirportCoordsByCode(icao);

    if (!coords) {
      return Response.json({ error: 'Aeroporto não encontrado.' }, { status: 404 });
    }

    return Response.json({
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
    return Response.json({ error: 'Falha ao buscar dados do aeroporto.', details: error.message }, { status: 500 });
  }
}
