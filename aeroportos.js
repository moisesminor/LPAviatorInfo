const airportPhotos = {
	JPA: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Presidente_Castro_Pinto_International_Airport.jpg',
	BEL: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/A330-200_TAP_%28CS-TOH%29_Star_Alliance_scheme%2C_arriving_in_Belem_PA.jpg',
	MCZ: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=1200&q=80',
	VIX: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Novo_Aeroporto_de_VIX.png',
	GYN: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Aeroporto_Santa_Genoveva%2C_Goi%C3%A2nia%2C_agosto_de_2018.jpg',
	SLZ: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Terminal_do_Aeroporto_Cunha_Machado.JPG',
	CGB: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Aeroporto_de_Cuiab%C3%A101.JPG',
	CGR: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Aeroporto_Internacional_de_Campo_Grande_MS%2C_20-07-2025.jpg',
	CWB: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Aeroporto_Internacional_Afonso_Pena_S%C3%A3o_Jos%C3%A9_dos_Pinhais_Paran%C3%A1_Brasil.jpg',
	THE: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Aeroporto_de_Teresina_Senador_Petr%C3%B4nio_Portella_.jpg',
	NAT: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Aeroporto_S%C3%A3o_Gon%C3%A7alo_guich%C3%AAs.jpg',
	FLN: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Sem-t-tulo3.png',
	AJU: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Sagu%C3%A3o_do_Aeroporto_de_Aracaju.jpg',
	PMW: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80'
};

const remainingAirports = [
	['Maceió', 'MCZ', 'SBMO', 'Aeroporto Internacional Zumbi dos Palmares', 'Capital de Alagoas e conexão regional do Nordeste.', '-9.5108, -35.7917', 'Aeroporto Internacional de Maceio'],
	['Vitória', 'VIX', 'SBVT', 'Aeroporto de Vitória - Eurico de Aguiar Salles', 'Terminal que atende a capital do Espírito Santo.', '-20.2581, -40.2864', 'Aeroporto de Vitoria'],
	['Goiânia', 'GYN', 'SBGO', 'Aeroporto Santa Genoveva', 'Importante terminal do Centro-Oeste brasileiro.', '-16.6320, -49.2207', 'Aeroporto Santa Genoveva Goiania'],
	['São Luís', 'SLZ', 'SBSL', 'Aeroporto Internacional Marechal Cunha Machado', 'Principal ligação aérea da capital maranhense.', '-2.5854, -44.2341', 'Aeroporto de Sao Luis'],
	['Cuiabá', 'CGB', 'SBCY', 'Aeroporto Internacional Marechal Rondon', 'Porta de entrada de Mato Grosso e do Pantanal.', '-15.6529, -56.1167', 'Aeroporto Marechal Rondon Cuiaba'],
	['Campo Grande', 'CGR', 'SBCG', 'Aeroporto Internacional de Campo Grande', 'Terminal estratégico para Mato Grosso do Sul.', '-20.4687, -54.6700', 'Aeroporto Internacional de Campo Grande'],
	['João Pessoa', 'JPA', 'SBJP', 'Aeroporto Internacional Presidente Castro Pinto', 'Atende João Pessoa e o litoral paraibano.', '-7.1484, -34.9506', 'Aeroporto de Joao Pessoa'],
	['Curitiba', 'CWB', 'SBCT', 'Aeroporto Internacional Afonso Pena', 'Principal aeroporto do Paraná e da Grande Curitiba.', '-25.5317, -49.1761', 'Afonso Pena International Airport Curitiba'],
	['Teresina', 'THE', 'SBTE', 'Aeroporto Senador Petrônio Portella', 'Principal conexão aérea do Piauí.', '-5.0599, -42.8235', 'Aeroporto de Teresina'],
	['Natal', 'NAT', 'SBNT', 'Aeroporto Internacional de Natal', 'Atende a capital potiguar e o turismo do Rio Grande do Norte.', '-5.7681, -35.3761', 'Aeroporto Internacional de Natal'],
	['Florianópolis', 'FLN', 'SBFL', 'Aeroporto Internacional Hercílio Luz', 'Principal terminal aéreo de Santa Catarina.', '-27.6703, -48.5525', 'Aeroporto Hercilio Luz Florianopolis'],
	['Aracaju', 'AJU', 'SBAR', 'Aeroporto Internacional de Aracaju', 'Principal porta de entrada aérea de Sergipe.', '-10.9840, -37.0703', 'Aeroporto Internacional de Aracaju'],
	['Palmas', 'PMW', 'SBPJ', 'Aeroporto Brigadeiro Lysias Rodrigues', 'Atende a capital e o estado do Tocantins.', '-10.2915, -48.3570', 'Aeroporto de Palmas Tocantins']
];

const cardGrid = document.querySelector('[aria-label="Aeroportos em destaque"]');
remainingAirports.forEach(([name, iata, icao, fullName, shortDescription, coordinates, mapQuery]) => {
	const card = document.createElement('article');
	card.className = 'airport-card overflow-hidden rounded-lg border border-slate-900/15 bg-white/[0.9] shadow-[0_8px_20px_rgba(2,6,23,0.12)]';
	card.innerHTML = `<img class="h-48 w-full object-cover" src="${airportPhotos[iata]}" alt="Aeroporto de ${name}" loading="lazy"><div class="p-6"><div class="flex items-start justify-between gap-3"><div><h2 class="text-2xl font-bold text-[#102d55]">${name} <span class="text-[#1261bd]">(${iata})</span></h2><p class="mt-2 text-lg leading-[1.6] text-[#18283b]">${shortDescription}</p></div><span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-[#1261bd]">${icao}</span></div><details class="mt-5 border-t border-slate-200 pt-4"><summary class="flex cursor-pointer list-none items-center justify-between font-bold text-[#1261bd]">Mais detalhes <span class="transition" aria-hidden="true">+</span></summary><div class="airport-details mt-4 hidden"><p class="leading-7 text-slate-700">${fullName} é o principal aeroporto da capital de ${name} e atende passageiros, negócios e conexões regionais. O terminal integra a malha aérea brasileira e apoia o desenvolvimento da sua região.</p><p class="mt-3 text-sm leading-6 text-slate-600"><strong>Localização:</strong> ${fullName}, ${name}<br><strong>Coordenadas:</strong> ${coordinates}</p><a class="mt-4 inline-block font-bold text-[#1261bd] underline" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}" target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a><iframe class="mt-4 h-44 w-full rounded-md border-0" title="Localização do Aeroporto de ${name} no Google Maps" src="https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed" loading="lazy"></iframe></div></details></div>`;
	cardGrid.appendChild(card);
});

document.querySelectorAll('.airport-card details').forEach((details) => {
	const summary = details.querySelector('summary');
	const card = details.closest('.airport-card');
	let closeTimer;
	summary.addEventListener('click', (event) => {
		event.preventDefault();
		window.clearTimeout(closeTimer);
		if (details.classList.contains('is-open')) {
			details.classList.remove('is-open');
			card.classList.remove('is-expanded');
			details.classList.add('is-closing');
			closeTimer = window.setTimeout(() => {
				details.open = false;
				details.classList.remove('is-closing');
			}, 420);
			return;
		}
		details.open = true;
		details.classList.remove('is-closing');
		details.classList.add('is-open');
		card.classList.add('is-expanded');
	});
});
