export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, claudeKey } = req.body;
  if (!prompt || !claudeKey) return res.status(400).json({ error: 'Missing prompt or claudeKey' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Напиши скрипт для Instagram Reel (talking head, 45-60 сек, 120-150 слов).\nТема: ${prompt}\nТребования: русский язык, неформальный стиль, сильный хук в первые 2 секунды, CTA в конец.\nВерни только текст скрипта без пояснений.`
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Claude API error' });

    const script = data.content?.[0]?.text || '';
    res.status(200).json({ script });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
