import { getAirportsListByCountry, COUNTRY_BY_SLUG } from '../../_lib/airports.js';

export async function onRequestGet(context) {
  const slug = context.params.slug;
  const countryName = COUNTRY_BY_SLUG[slug];

  if (!countryName) {
    return Response.json({ error: 'País não suportado.' }, { status: 404 });
  }

  try {
    const airports = await getAirportsListByCountry(countryName);
    return Response.json({ country: slug, total: airports.length, airports });
  } catch (error) {
    return Response.json({ error: 'Erro ao carregar a lista de aeroportos.', details: error.message }, { status: 500 });
  }
}
