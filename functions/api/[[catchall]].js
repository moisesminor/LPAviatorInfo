export async function onRequest() {
  return Response.json({ error: 'Rota não encontrada' }, { status: 404 });
}
