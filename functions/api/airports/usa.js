import { buildAirportsResponse, COUNTRY_BY_SLUG } from '../../_lib/airports.js';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const data = await buildAirportsResponse(COUNTRY_BY_SLUG.usa, url.searchParams, context.env.AIRPORTDB_API_TOKEN);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Erro ao carregar os aeroportos dos Estados Unidos.', details: error.message }, { status: 500 });
  }
}
