// Copia os builds UMD de gsap/lenis de node_modules para vendor/ (commitado).
// Rodar depois de atualizar as versões em package.json: npm run vendor:sync
//
// Fica em scripts/ de propósito: essa pasta NÃO está no glob `content` do
// tailwind.config.js (`./*.html`, `./*.js` — só raiz), então nunca é
// escaneada pelo Tailwind. Se algum dia mover isso para a raiz, vendor/
// também precisaria virar exclusão explícita no tailwind.config.js.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'vendor');

const files = [
	['gsap/dist/gsap.min.js', 'gsap.min.js'],
	['gsap/dist/ScrollTrigger.min.js', 'ScrollTrigger.min.js'],
	['lenis/dist/lenis.min.js', 'lenis.min.js'],
	['lenis/LICENSE', 'lenis-LICENSE'],
	// three.min.js é o build UMD legado (global `THREE`), usado só pelo hero 3D
	// de mobile (js/hero-aircraft.js) e carregado sob demanda. O pacote `three`
	// só publica ESM nas versões novas; mantemos preso em 0.160.x, que ainda
	// traz dist/three.min.js.
	['three/build/three.min.js', 'three.min.js'],
	['three/LICENSE', 'three-LICENSE'],
	['leaflet/dist/leaflet.js', 'leaflet/leaflet.js'],
	['leaflet/dist/leaflet.css', 'leaflet/leaflet.css'],
	['leaflet/dist/images/marker-icon.png', 'leaflet/images/marker-icon.png'],
	['leaflet/dist/images/marker-icon-2x.png', 'leaflet/images/marker-icon-2x.png'],
	['leaflet/dist/images/marker-shadow.png', 'leaflet/images/marker-shadow.png'],
	['leaflet/dist/images/layers.png', 'leaflet/images/layers.png'],
	['leaflet/dist/images/layers-2x.png', 'leaflet/images/layers-2x.png'],
	['leaflet/LICENSE', 'leaflet-LICENSE'],
];

fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(path.join(out, 'leaflet'), { recursive: true });
fs.mkdirSync(path.join(out, 'leaflet', 'images'), { recursive: true });

for (const [from, to] of files) {
	const src = path.join(root, 'node_modules', from);
	const dest = path.join(out, to);
	if (!fs.existsSync(src)) {
		console.warn(`vendor -- pulando ${from} (não instalado em node_modules); rode "npm install" e tente de novo`);
		continue;
	}
	fs.copyFileSync(src, dest);
	console.log(`vendor <- ${from}`);
}

console.log('\nvendor/gsap-LICENSE.md não é copiado automaticamente: o pacote gsap');
console.log('não publica um arquivo de licença próprio (o aviso vive no cabeçalho');
console.log('dos .js). Revise vendor/gsap-LICENSE.md manualmente se a versão mudar.');
