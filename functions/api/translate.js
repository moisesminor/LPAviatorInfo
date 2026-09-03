export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.DEEPL_API_KEY;

  if (!apiKey) {
    return Response.json({
      error: 'DEEPL_API_KEY não configurado. Adicione a chave nas variáveis de ambiente do projeto.'
    }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const text = String(body?.text || '').trim();

  if (!text) {
    return Response.json({ error: 'Campo "text" é obrigatório.' }, { status: 400 });
  }

  const targetLang = String(body?.target_lang || 'EN-US').toUpperCase();
  const sourceLang = body?.source_lang ? String(body.source_lang).toUpperCase() : 'PT';
  const apiUrl = apiKey.trim().endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: [text], target_lang: targetLang, source_lang: sourceLang })
    });

    if (!response.ok) {
      const details = await response.text();
      return Response.json({
        error: 'Erro ao consultar a API do DeepL.',
        details
      }, { status: response.status });
    }

    const data = await response.json();
    const translated = data?.translations?.[0]?.text || text;
    return Response.json({ translated });
  } catch (error) {
    return Response.json({
      error: 'Falha ao acessar a API do DeepL.',
      details: error.message
    }, { status: 500 });
  }
}
