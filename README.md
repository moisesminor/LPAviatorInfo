# LPAviatorInfo

Paleta principal do site (OKLCH):

- Cor principal: `oklch(62.3% 0.214 259.815)`
- Cor secundária: `oklch(97.7% 0.013 236.62)`
- Cor para textos: `oklch(12.9% 0.042 264.695)`

Exemplo de uso CSS:

```css
:root{
  --primary: oklch(62.3% 0.214 259.815);
  --secondary: oklch(97.7% 0.013 236.62);
  --text: oklch(12.9% 0.042 264.695);
}

.cta{ background:var(--primary); color:var(--secondary); }
.brand{ color:var(--primary); }
body{ color:var(--text); }
```

Arquivo atualizado na branch `moises`.
