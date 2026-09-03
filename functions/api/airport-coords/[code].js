import { findAirportCoordsByCode } from '../../_lib/airports.js';

export async function onRequestGet(context) {
  try {
    const coords = await findAirportCoordsByCode(context.params.code);

    if (!coords) {
      return Response.json({ error: 'Aeroporto não encontrado.' }, { status: 404 });
    }

    return Response.json(coords);
  } catch (error) {
    return Response.json({ error: 'Erro ao buscar coordenadas do aeroporto.', details: error.message }, { status: 500 });
  }
}
