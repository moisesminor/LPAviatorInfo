/*
 * Bob o Avião — assistente de suporte fixo no canto inferior direito.
 * Motor de respostas 100% local (sem backend): usa AIRCRAFT_MODELS/MANUFACTURER_INFO
 * (aircraft-data.js) mais os dados de companhias/páginas abaixo para responder,
 * variando a redação a cada resposta para não soar robótico.
 */
(function () {
	'use strict';

	// ---------------------------------------------------------------------
	// Base de conhecimento (companhias e seções do site — espelha o conteúdo
	// já publicado em companhias.html e nas demais páginas).
	// ---------------------------------------------------------------------
	const AIRLINES = [
		{
			name: 'LATAM Brasil',
			alliance: 'oneworld',
			fleet: '140',
			hubs: ['GRU', 'CGH', 'BSB'],
			description: 'Conexões nacionais e internacionais a partir da América do Sul com frota diversificada de Airbus A320/A321 e Boeing 777/787.'
		},
		{
			name: 'GOL Linhas Aéreas',
			alliance: 'parceira da American Airlines',
			fleet: '140',
			hubs: ['GRU', 'CGH', 'BSB', 'GIG'],
			description: 'Principal operadora de low-cost no Brasil, com ampla rede doméstica e crescente malha internacional, voando principalmente Boeing 737-800 e MAX.'
		},
		{
			name: 'Azul Linhas Aéreas',
			alliance: 'oneworld',
			fleet: '160',
			hubs: ['VCP', 'CNF', 'REC'],
			description: 'Rede ampla conectando cidades brasileiras com frota moderna de Embraer E2, ATR e Airbus A320/A330.'
		},
		{
			name: 'Delta Air Lines',
			alliance: 'SkyTeam',
			fleet: '950',
			hubs: ['ATL', 'JFK'],
			description: 'Uma das maiores companhias aéreas dos EUA, com joint venture com a LATAM no Brasil.'
		},
		{
			name: 'American Airlines',
			alliance: 'oneworld',
			fleet: '960',
			hubs: ['MIA', 'DFW', 'JFK'],
			description: 'Parcerias estratégicas com GOL e Azul, integrando redes domésticas brasileiras à vasta malha internacional dos EUA.'
		},
		{
			name: 'TAP Air Portugal',
			alliance: 'Star Alliance',
			fleet: '100',
			hubs: ['LIS', 'OPO'],
			description: 'Maior conectividade Europa-Brasil, com forte parceria com a Azul entre Lisboa e as principais cidades brasileiras.'
		}
	];

	const AIRLINE_ALIASES = {
		'latam brasil': 'LATAM Brasil',
		'latam': 'LATAM Brasil',
		'gol linhas aereas': 'GOL Linhas Aéreas',
		'gol': 'GOL Linhas Aéreas',
		'azul linhas aereas': 'Azul Linhas Aéreas',
		'azul': 'Azul Linhas Aéreas',
		'delta air lines': 'Delta Air Lines',
		'delta': 'Delta Air Lines',
		'american airlines': 'American Airlines',
		'american': 'American Airlines',
		'tap air portugal': 'TAP Air Portugal',
		'tap portugal': 'TAP Air Portugal',
		'tap': 'TAP Air Portugal'
	};

	const MANUFACTURER_ALIASES = {
		'mcdonnell douglas': 'McDonnell Douglas',
		'mcdonnell': 'McDonnell Douglas',
		'douglas': 'McDonnell Douglas',
		'airbus': 'Airbus',
		'boeing': 'Boeing',
		'embraer': 'Embraer',
		'atr': 'ATR',
		'bombardier': 'Bombardier',
		'cessna': 'Cessna',
		'fokker': 'Fokker',
		'ilyushin': 'Ilyushin',
		'lockheed': 'Lockheed',
		'saab': 'Saab'
	};

	const FEATURES = {
		modelos: {
			label: 'Modelos',
			desc: 'lá você encontra especificações completas de aeronaves comerciais: fabricante, tipo, capacidade de passageiros, autonomia e velocidade de cruzeiro.'
		},
		aeroportos: {
			label: 'Aeroportos',
			desc: 'reunimos aeroportos do Brasil e dos Estados Unidos com códigos IATA/ICAO, localização, pistas e mapa.'
		},
		companhias: {
			label: 'Companhias',
			desc: 'você vê informações sobre companhias aéreas: aliança, frota e hubs principais.'
		},
		simulacao: {
			label: 'Simulação',
			desc: 'dá para simular o tempo de voo entre dois aeroportos escolhendo o modelo de aeronave.'
		},
		rastreio: {
			label: 'Rastreio',
			desc: 'dá para rastrear um voo em tempo real digitando o número IATA, acompanhando rota, status, altitude e velocidade.'
		}
	};

	const FEATURE_ALIASES = {
		'aeroportos do brasil': 'aeroportos',
		'aeroporto': 'aeroportos',
		'aeroportos': 'aeroportos',
		'pista': 'aeroportos',
		'pistas': 'aeroportos',
		'rastrear': 'rastreio',
		'rastreio': 'rastreio',
		'rastreamento': 'rastreio',
		'tempo real': 'rastreio',
		'ao vivo': 'rastreio',
		'simular': 'simulacao',
		'simulacao': 'simulacao',
		'simulador': 'simulacao',
		'tempo de voo': 'simulacao',
		'quanto tempo demora': 'simulacao',
		'modelos': 'modelos',
		'quais avioes': 'modelos',
		'quais aeronaves': 'modelos',
		'catalogo': 'modelos',
		'companhias': 'companhias',
		'companhia aerea': 'companhias',
		'cia aerea': 'companhias',
		'quais companhias': 'companhias'
	};

	const AVIATION_KEYWORDS = [
		'aviao', 'aviaozinho', 'aeronave', 'aeronaves', 'voo', 'voos', 'voar', 'aeroporto', 'aeroportos',
		'piloto', 'pilotos', 'comissario', 'comissaria', 'tripulacao', 'cockpit', 'cabine', 'turbina',
		'motor', 'motores', 'reator', 'motor a jato', 'helice', 'turboelice', 'asa', 'asas', 'fuselagem',
		'decolagem', 'pouso', 'aterrissagem', 'altitude', 'turbulencia', 'radar', 'torre de controle',
		'hangar', 'combustivel', 'querosene', 'mach', 'velocidade de cruzeiro', 'autonomia', 'passageiro',
		'passageiros', 'companhia aerea', 'cia aerea', 'fabricante', 'jato', 'aviacao', 'aerodinamica',
		'iata', 'icao', 'check-in', 'bagagem', 'escala', 'tarifa aerea', 'classe economica', 'primeira classe'
	];

	// ---------------------------------------------------------------------
	// Utilidades de texto
	// ---------------------------------------------------------------------
	function normalize(str) {
		return String(str || '')
			.toLowerCase()
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.replace(/[^a-z0-9\s]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	// Distância de Levenshtein simples, usada para tolerar erros de digitação
	// (troca, falta ou sobra de uma letra) ao reconhecer palavras-chave.
	function levenshtein(a, b) {
		const al = a.length;
		const bl = b.length;
		if (al === 0) return bl;
		if (bl === 0) return al;
		const dp = new Array(bl + 1);
		for (let j = 0; j <= bl; j += 1) dp[j] = j;
		for (let i = 1; i <= al; i += 1) {
			let prev = dp[0];
			dp[0] = i;
			for (let j = 1; j <= bl; j += 1) {
				const tmp = dp[j];
				dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
				prev = tmp;
			}
		}
		return dp[bl];
	}

	function wordsOf(norm) {
		return norm.split(' ').filter(Boolean);
	}

	// Quanto maior a palavra, mais margem de erro de digitação é tolerada.
	// Palavras curtas (<=3 letras) exigem correspondência exata para não gerar
	// falsos positivos (ex.: "voo" x "vou").
	function fuzzyTolerance(len) {
		if (len <= 3) return 0;
		if (len <= 6) return 1;
		return 2;
	}

	function hasWord(norm, phrase) {
		const p = normalize(phrase);
		if (!p) return false;
		if ((' ' + norm + ' ').indexOf(' ' + p + ' ') !== -1) return true;

		const pWords = p.split(' ');
		const nWords = wordsOf(norm);

		if (pWords.length === 1) {
			const tol = fuzzyTolerance(pWords[0].length);
			if (tol === 0) return false;
			return nWords.some((w) => Math.abs(w.length - pWords[0].length) <= tol && levenshtein(w, pWords[0]) <= tol);
		}

		// Frase com várias palavras: procura uma janela de tokens consecutivos
		// em que cada palavra bate (exata ou com pequena tolerância).
		for (let start = 0; start <= nWords.length - pWords.length; start += 1) {
			let ok = true;
			for (let i = 0; i < pWords.length; i += 1) {
				const nw = nWords[start + i];
				const pw = pWords[i];
				if (nw === pw) continue;
				const tol = fuzzyTolerance(pw.length);
				if (tol === 0 || Math.abs(nw.length - pw.length) > tol || levenshtein(nw, pw) > tol) {
					ok = false;
					break;
				}
			}
			if (ok) return true;
		}
		return false;
	}

	function shuffle(arr) {
		const copy = arr.slice();
		for (let i = copy.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
			const tmp = copy[i];
			copy[i] = copy[j];
			copy[j] = tmp;
		}
		return copy;
	}

	const lastPicks = new Map();
	function pick(key, arr) {
		if (arr.length === 1) return arr[0];
		let idx;
		const last = lastPicks.get(key);
		do {
			idx = Math.floor(Math.random() * arr.length);
		} while (idx === last);
		lastPicks.set(key, idx);
		return arr[idx];
	}

	// ---------------------------------------------------------------------
	// Reconhecimento de intenção
	// ---------------------------------------------------------------------
	function isEasterEgg(norm) {
		return (norm.indexOf('ovao') !== -1 || norm.indexOf('ovos') !== -1 || hasWord(norm, 'ovo')) &&
			norm.indexOf('grandao') !== -1;
	}

	// Frases de saudação específicas o bastante para valer em qualquer mensagem.
	const GREETING_PHRASES = ['bom dia', 'boa tarde', 'boa noite', 'fala ae bob', 'fala bob', 'eae bob', 'e ai bob'];
	// Palavras soltas comuns demais (podem aparecer dentro de perguntas reais,
	// tipo "me fala mais sobre..." ou "bob, qual o alcance..."), então só contam
	// como saudação quando a mensagem inteira é curta.
	const GREETING_SHORT_WORDS = ['oi', 'ola', 'opa', 'eae', 'e ai', 'hey', 'hello', 'salve', 'bob', 'fala', 'falae', 'fala ae'];
	function isGreeting(norm) {
		if (GREETING_PHRASES.some((w) => hasWord(norm, w))) return true;
		if (wordsOf(norm).length > 3) return false;
		return GREETING_SHORT_WORDS.some((w) => hasWord(norm, w));
	}

	const THANKS_WORDS = ['obrigado', 'obrigada', 'valeu', 'vlw', 'thanks', 'brigado', 'brigada'];
	function isThanks(norm) {
		return THANKS_WORDS.some((w) => hasWord(norm, w));
	}

	const FAREWELL_WORDS = ['tchau', 'ate mais', 'ate logo', 'falou', 'flw', 'adeus', 'ate a proxima'];
	function isFarewell(norm) {
		return FAREWELL_WORDS.some((w) => hasWord(norm, w));
	}

	const AFFIRM_WORDS = ['sim', 'com certeza', 'claro', 'quero sim', 'pode ser', 'bora', 'uhum', 'aham', 'exatamente', 'positivo', 'afirmativo'];
	function isAffirmative(norm) {
		return AFFIRM_WORDS.some((w) => hasWord(norm, w));
	}

	const NEGATIVE_WORDS = ['nao', 'negativo', 'nunca', 'deixa pra la', 'agora nao'];
	function isNegative(norm) {
		return NEGATIVE_WORDS.some((w) => hasWord(norm, w));
	}

	function isAboutBob(norm) {
		return hasWord(norm, 'quem e voce') || hasWord(norm, 'quem e vc') || hasWord(norm, 'seu nome') ||
			hasWord(norm, 'voce e quem') || hasWord(norm, 'quem e o bob');
	}

	function isHelp(norm) {
		return hasWord(norm, 'ajuda') || hasWord(norm, 'menu') || hasWord(norm, 'o que voce sabe') ||
			hasWord(norm, 'o que posso perguntar') || hasWord(norm, 'o que voce faz') || hasWord(norm, 'me ajuda');
	}

	function findAircraft(norm) {
		const models = window.AIRCRAFT_MODELS || [];
		const normCompact = norm.replace(/\s/g, '');
		const sorted = models.slice().sort((a, b) => b.name.length - a.name.length);

		for (const m of sorted) {
			const full = normalize(m.name);
			const manufNorm = normalize(m.manufacturer);
			const stripped = full.indexOf(manufNorm) === 0 ? full.slice(manufNorm.length).trim() : full;
			const fullCompact = full.replace(/\s/g, '');
			const strippedCompact = stripped.replace(/\s/g, '');

			if (hasWord(norm, full) || (stripped.length > 2 && hasWord(norm, stripped))) return m;
			if (fullCompact.length > 3 && normCompact.indexOf(fullCompact) !== -1) return m;
			if (strippedCompact.length > 3 && normCompact.indexOf(strippedCompact) !== -1) return m;
		}
		return null;
	}

	function findManufacturer(norm) {
		const models = window.AIRCRAFT_MODELS || [];
		const keys = Object.keys(MANUFACTURER_ALIASES).sort((a, b) => b.length - a.length);
		for (const alias of keys) {
			if (hasWord(norm, alias)) {
				const manufacturer = MANUFACTURER_ALIASES[alias];
				return { manufacturer, models: models.filter((m) => m.manufacturer === manufacturer) };
			}
		}
		return null;
	}

	function listManufacturers() {
		const models = window.AIRCRAFT_MODELS || [];
		const seen = [];
		models.forEach((m) => {
			if (seen.indexOf(m.manufacturer) === -1) seen.push(m.manufacturer);
		});
		return seen;
	}

	function findAirline(norm) {
		const keys = Object.keys(AIRLINE_ALIASES).sort((a, b) => b.length - a.length);
		for (const alias of keys) {
			if (hasWord(norm, alias)) {
				const name = AIRLINE_ALIASES[alias];
				return AIRLINES.find((a) => a.name === name) || null;
			}
		}
		return null;
	}

	function findFeature(norm) {
		const keys = Object.keys(FEATURE_ALIASES).sort((a, b) => b.length - a.length);
		for (const alias of keys) {
			if (hasWord(norm, alias)) return FEATURES[FEATURE_ALIASES[alias]];
		}
		return null;
	}

	// ---------------------------------------------------------------------
	// Geração de respostas (com variação de redação)
	// ---------------------------------------------------------------------
	function describeAircraft(model) {
		const manuf = window.MANUFACTURER_INFO && window.MANUFACTURER_INFO[model.manufacturer];
		const openers = [
			`O ${model.name} é um avião e tanto.`,
			`Ah, o ${model.name}!`,
			`Boa escolha perguntar sobre o ${model.name}.`,
			`Falando do ${model.name}:`
		];
		const facts = shuffle(model.descricao).slice(0, 2).join(' ');
		const specTemplates = [
			`Ele é do tipo ${model.tipo}, leva até ${model.passageiros} passageiros, tem autonomia de ${model.autonomia} e cruza os céus a ${model.velocidade}.`,
			`Com capacidade para ${model.passageiros} passageiros e alcance de ${model.autonomia}, esse ${model.tipo.toLowerCase()} voa a ${model.velocidade}.`,
			`Classificado como ${model.tipo}, comporta ${model.passageiros} passageiros e chega a ${model.autonomia} de autonomia, voando a ${model.velocidade}.`
		];
		let manufLine = '';
		if (manuf) {
			const manufTemplates = [
				` É fabricado pela ${model.manufacturer}, sediada em ${manuf.hq} (${manuf.country}).`,
				` Sai de fábrica da ${model.manufacturer}, com sede em ${manuf.hq}, ${manuf.country}.`
			];
			manufLine = pick('manuf-' + model.manufacturer, manufTemplates);
		}
		return `${pick('opener-aircraft', openers)} ${facts} ${pick('spec-' + model.name, specTemplates)}${manufLine}`;
	}

	function describeManufacturer(manufacturer, models) {
		const info = window.MANUFACTURER_INFO && window.MANUFACTURER_INFO[manufacturer];
		const names = models.map((m) => m.name).join(', ');
		const openers = [
			`A ${manufacturer}${info ? ' é uma fabricante ' + info.country : ''}.`,
			`Sobre a ${manufacturer}:`,
			`Deixa eu te falar da ${manufacturer}.`
		];
		const listTemplates = [
			`Temos ${models.length} modelo${models.length === 1 ? '' : 's'} dela aqui no site: ${names}.`,
			`No nosso catálogo, a ${manufacturer} aparece com ${models.length} aeronave${models.length === 1 ? '' : 's'}: ${names}.`
		];
		return `${pick('opener-manuf', openers)} ${pick('list-' + manufacturer, listTemplates)} Quer que eu conte mais sobre algum modelo específico?`;
	}

	function describeManufacturersList(names) {
		const openers = [
			'Temos aeronaves de várias fabricantes por aqui:',
			'Olha, no site você encontra aeronaves destas fabricantes:',
			'As fabricantes que tenho no catálogo são:'
		];
		return `${pick('opener-manuf-list', openers)} ${names.join(', ')}. Sobre qual delas você quer saber mais?`;
	}

	function describeAirline(airline) {
		const openers = [
			`Sobre a ${airline.name}:`,
			`Falando da ${airline.name},`,
			`A ${airline.name} é uma das que temos por aqui.`
		];
		const tails = [
			`Faz parte da ${airline.alliance}, com frota de cerca de ${airline.fleet} aeronaves, operando principalmente em ${airline.hubs.join(', ')}.`,
			`Integra a ${airline.alliance}, tem em torno de ${airline.fleet} aeronaves na frota e seus hubs principais são ${airline.hubs.join(', ')}.`
		];
		return `${pick('opener-airline', openers)} ${airline.description} ${pick('tail-' + airline.name, tails)}`;
	}

	function describeFeature(feature) {
		const openers = [
			`Na página de ${feature.label},`,
			`Aqui no site, na seção ${feature.label},`,
			`Temos uma seção pra isso:`
		];
		return `${pick('opener-feature', openers)} ${feature.desc} Dá uma olhada em "${feature.label}" no menu lá em cima!`;
	}

	const EASTER_EGG_TEXT = '♪ O nome dele é bob, os ovos tá pra bater no short, ele só tem é ovo ♪';

	const GREETINGS = [
		'Oi! Como posso ajudar você hoje com aviação?',
		'Olá! Sobre o que você quer saber — aviões, aeroportos ou companhias aéreas?',
		'E aí! Pronto para falar de aviação?',
		'Oi, tudo bem? Pode perguntar sobre aviões que eu te ajudo.'
	];
	const THANKS = [
		'De nada! Qualquer dúvida sobre aviação, é só chamar.',
		'Disponha! Estou por aqui para isso.',
		'Por nada! Sempre que quiser saber mais sobre aviação, me chama.',
		'Fico feliz em ajudar!'
	];
	const BYES = [
		'Até mais! Bons voos.',
		'Tchau, tchau! Volte sempre que precisar.',
		'Falou! Qualquer coisa sobre aviação, estou por aqui.',
		'Até a próxima decolagem!'
	];
	const ABOUTS = [
		'Eu sou o Bob, o assistente do Aviator Info! Posso te contar sobre modelos de aeronaves, companhias aéreas e as ferramentas do site.',
		'Pode me chamar de Bob. Sou o piloto virtual daqui e adoro falar sobre aviação.',
		'Bob é meu nome — fui criado para te ajudar a explorar tudo sobre aviões aqui no site.'
	];
	const HELP_TEXT = 'Você pode me perguntar sobre modelos de aeronaves (tipo Boeing 737 ou Airbus A320), companhias aéreas (LATAM, GOL, Azul, Delta, American, TAP) ou sobre as páginas do site: Modelos, Aeroportos, Companhias, Simulação e Rastreio. Manda a pergunta!';

	const OUT_OF_SCOPE_TEXT = 'Não tenho familiaridade com isso, meus conhecimentos são limitados a aviação.';
	const NOT_YET_AVAILABLE_TEXT = 'Ainda não tenho conhecimento sobre isso, mas irei me informar para ajudar da próxima vez.';

	const AFFIRM_GENERIC_REPLIES = [
		'Boa! Me conta então: quer saber sobre um modelo de avião, uma companhia aérea ou alguma das ferramentas do site?',
		'Show! Sobre o que especificamente? Pode ser um avião, uma companhia aérea ou uma das seções do site.',
		'Beleza! Só me diz o assunto — avião, companhia aérea ou funcionalidade do site — que eu te ajudo.'
	];
	const DECLINE_REPLIES = [
		'Tudo bem! Se quiser saber de outra coisa, é só perguntar.',
		'Sem problemas! Fico à disposição se tiver outra dúvida.',
		'Combinado. Qualquer outra coisa sobre aviação, é só chamar.'
	];

	// prevContext guarda o que o Bob acabou de perguntar (ex.: "quer saber mais
	// sobre algum modelo específico?"), para interpretar respostas curtas como
	// "sim"/"não" no contexto da própria pergunta em vez de tratá-las isoladas.
	function getBobReply(raw, prevContext) {
		const norm = normalize(raw);
		if (!norm) return { text: 'Pode repetir? Não entendi muito bem.', context: prevContext || null };

		if (isEasterEgg(norm)) return { text: EASTER_EGG_TEXT, song: true, context: null };
		if (isGreeting(norm)) return { text: pick('greeting', GREETINGS), context: null };
		if (isThanks(norm)) return { text: pick('thanks', THANKS), context: null };
		if (isFarewell(norm)) return { text: pick('bye', BYES), context: null };
		if (isAboutBob(norm)) return { text: pick('about', ABOUTS), context: null };
		if (isHelp(norm)) return { text: HELP_TEXT, context: null };

		const aircraft = findAircraft(norm);
		if (aircraft) return { text: describeAircraft(aircraft), context: null };

		const manufacturer = findManufacturer(norm);
		if (manufacturer && manufacturer.models.length) {
			const models = manufacturer.models;
			return { text: describeManufacturer(manufacturer.manufacturer, models), context: { awaiting: 'model-pick', models } };
		}

		const airline = findAirline(norm);
		if (airline) return { text: describeAirline(airline), context: null };

		const feature = findFeature(norm);
		if (feature) return { text: describeFeature(feature), context: null };

		if (hasWord(norm, 'fabricante') || hasWord(norm, 'fabricantes')) {
			const names = listManufacturers();
			if (names.length) return { text: describeManufacturersList(names), context: { awaiting: 'manufacturer-pick', manufacturers: names } };
		}

		if (isAffirmative(norm)) {
			if (prevContext && prevContext.awaiting === 'model-pick' && prevContext.models && prevContext.models.length) {
				const models = prevContext.models;
				if (models.length === 1) return { text: describeAircraft(models[0]), context: null };
				const names = models.map((m) => m.name).join(', ');
				return { text: `Claro! Temos: ${names}. Qual deles você quer conhecer melhor?`, context: { awaiting: 'model-pick', models } };
			}
			if (prevContext && prevContext.awaiting === 'manufacturer-pick' && prevContext.manufacturers && prevContext.manufacturers.length) {
				const names = prevContext.manufacturers;
				return { text: `Show! São essas: ${names.join(', ')}. Qual delas te interessa?`, context: { awaiting: 'manufacturer-pick', manufacturers: names } };
			}
			return { text: pick('affirm-generic', AFFIRM_GENERIC_REPLIES), context: null };
		}

		if (isNegative(norm)) {
			return { text: pick('decline-generic', DECLINE_REPLIES), context: null };
		}

		const hasAviationKeyword = AVIATION_KEYWORDS.some((k) => hasWord(norm, k));
		if (hasAviationKeyword) return { text: NOT_YET_AVAILABLE_TEXT, context: null };

		return { text: OUT_OF_SCOPE_TEXT, context: null };
	}

	// ---------------------------------------------------------------------
	// UI
	// ---------------------------------------------------------------------
	const ICON_CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M5.28 4.22a.75.75 0 00-1.06 1.06L8.94 10l-4.72 4.72a.75.75 0 101.06 1.06L10 11.06l4.72 4.72a.75.75 0 101.06-1.06L11.06 10l4.72-4.72a.75.75 0 00-1.06-1.06L10 8.94 5.28 4.22z" clip-rule="evenodd" /></svg>';
	const ICON_SEND = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" /></svg>';
	const ICON_USER = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>';
	const ICON_CHAT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/></svg>';

	const STORAGE_KEY = 'bobChat:v1';
	let isBotTyping = false;

	function loadState() {
		try {
			const raw = sessionStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : { open: false, messages: [], context: null };
		} catch (e) {
			return { open: false, messages: [], context: null };
		}
	}

	function saveState(state) {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (e) {
			/* sessionStorage indisponível (modo privado, etc.) — segue sem persistir */
		}
	}

	// Distingue um F5/recarregar (reseta a conversa) de uma navegação normal
	// entre páginas do site (mantém a conversa, já que cada página é um load
	// separado do mesmo jeito).
	function isReloadNavigation() {
		try {
			const entries = performance.getEntriesByType('navigation');
			if (entries && entries.length && entries[0].type) return entries[0].type === 'reload';
		} catch (e) {
			/* ignora e tenta a API antiga */
		}
		try {
			if (performance.navigation) return performance.navigation.type === 1;
		} catch (e) {
			/* API de navegação indisponível */
		}
		return false;
	}

	function injectMarkup() {
		const style = document.createElement('style');
		style.id = 'bob-chatbot-styles';
		style.textContent = `
			@keyframes bob-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .6; } 30% { transform: translateY(-4px); opacity: 1; } }
			.bob-dot { animation: bob-bounce 1.1s infinite ease-in-out; }
			.bob-dot:nth-child(2) { animation-delay: .15s; }
			.bob-dot:nth-child(3) { animation-delay: .3s; }
			#bob-chat-body::-webkit-scrollbar { width: 6px; }
			#bob-chat-body::-webkit-scrollbar-thumb { background: rgba(16,45,85,.18); border-radius: 999px; }
			@media (max-width: 640px) {
				#bob-toggle-btn { right: 20px !important; bottom: 20px !important; }
				#bob-chat-panel {
					right: 12px !important;
					left: 12px !important;
					bottom: 96px !important;
					width: auto !important;
					height: min(560px, calc(100vh - 140px)) !important;
				}
			}
		`;
		document.head.appendChild(style);

		const wrap = document.createElement('div');
		wrap.innerHTML = `
			<button id="bob-toggle-btn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="bob-chat-panel" aria-label="Abrir chat com Bob o Avião"
				class="fixed bottom-[79px] right-[70px] z-[998] flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(16,45,85,0.35)] ring-4 ring-white transition duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300">
				<img src="./images/BobPerfil.webp" alt="" class="h-full w-full rounded-full object-cover object-[50%_22%]">
				<span class="absolute right-0.5 top-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" aria-hidden="true"></span>
			</button>

			<div id="bob-chat-panel" role="dialog" aria-modal="false" aria-label="Chat de suporte com Bob o Avião" hidden
				class="fixed bottom-[155px] right-[70px] z-[999] h-[min(560px,calc(100vh-195px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(16,45,85,0.35)] ring-1 ring-slate-900/5">
				<header class="flex shrink-0 items-center gap-3 bg-gradient-to-r from-[#1e56c9] to-[#4b95f5] px-4 py-3">
					<img src="./images/BobPerfil.webp" alt="" class="h-10 w-10 shrink-0 rounded-full object-cover object-[50%_22%] ring-2 ring-white/70">
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-bold text-white">Bob o Avião</p>
						<p class="flex items-center gap-1.5 text-xs font-medium text-sky-100"><span class="h-2 w-2 rounded-full bg-emerald-400"></span>Online</p>
					</div>
					<button id="bob-close-btn" type="button" aria-label="Fechar chat"
						class="shrink-0 rounded-full p-1.5 text-white/90 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">${ICON_CLOSE}</button>
				</header>

				<div id="bob-chat-body" class="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
					<div id="bob-empty-state" class="flex h-full flex-col items-center justify-center gap-3 text-center">
						<img src="./images/BobApresentando.webp" alt="Bob o Avião apresentando o chat" class="h-40 w-40 object-contain">
						<p class="max-w-[240px] text-sm leading-relaxed text-[#18283b]">Oi! Eu sou o Bob. Pergunte sobre aviões, aeroportos ou companhias aéreas.</p>
					</div>
					<ul id="bob-messages" class="flex flex-col gap-3"></ul>
				</div>

				<form id="bob-chat-form" class="flex shrink-0 items-center gap-2 border-t border-slate-100 bg-white p-3">
					<div class="flex flex-1 items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#4b95f5]">
						<span class="shrink-0 text-slate-400">${ICON_CHAT}</span>
						<input id="bob-chat-input" type="text" placeholder="Digite sua dúvida" autocomplete="off" maxlength="300"
							class="w-full bg-transparent text-sm text-[#18283b] placeholder:text-slate-400 focus:outline-none">
					</div>
					<button type="submit" id="bob-send-btn" aria-label="Enviar mensagem"
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#1e56c9] to-[#4b95f5] text-white shadow transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:opacity-50">${ICON_SEND}</button>
				</form>
			</div>
		`;
		while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
	}

	function createMessageElement(role, text, options) {
		options = options || {};
		const li = document.createElement('li');
		li.className = role === 'user' ? 'flex items-end justify-end gap-2' : 'flex items-end gap-2';

		if (role === 'bot') {
			const avatar = document.createElement('img');
			avatar.src = './images/BobPerfil.webp';
			avatar.alt = '';
			avatar.className = 'h-7 w-7 shrink-0 rounded-full object-cover object-[50%_22%]';
			li.appendChild(avatar);
		}

		const bubble = document.createElement('div');
		bubble.className = role === 'user'
			? 'max-w-[78%] rounded-2xl rounded-br-sm bg-slate-200 px-3.5 py-2.5 text-sm leading-relaxed text-[#18283b] shadow-sm'
			: 'max-w-[78%] rounded-2xl rounded-bl-sm bg-gradient-to-r from-[#1e56c9] to-[#4b95f5] px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm' + (options.song ? ' italic' : '');
		bubble.textContent = text;
		li.appendChild(bubble);

		if (role === 'user') {
			const avatarWrap = document.createElement('span');
			avatarWrap.className = 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-600';
			avatarWrap.innerHTML = ICON_USER;
			li.appendChild(avatarWrap);
		}

		return li;
	}

	function createTypingElement() {
		const li = document.createElement('li');
		li.id = 'bob-typing';
		li.className = 'flex items-end gap-2';
		li.innerHTML = `
			<img src="./images/BobPerfil.webp" alt="" class="h-7 w-7 shrink-0 rounded-full object-cover object-[50%_22%]">
			<div class="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-gradient-to-r from-[#1e56c9] to-[#4b95f5] px-3.5 py-3 shadow-sm">
				<span class="bob-dot h-1.5 w-1.5 rounded-full bg-white/90"></span>
				<span class="bob-dot h-1.5 w-1.5 rounded-full bg-white/90"></span>
				<span class="bob-dot h-1.5 w-1.5 rounded-full bg-white/90"></span>
			</div>
		`;
		return li;
	}

	function init() {
		injectMarkup();

		const toggleBtn = document.getElementById('bob-toggle-btn');
		const panel = document.getElementById('bob-chat-panel');
		const closeBtn = document.getElementById('bob-close-btn');
		const body = document.getElementById('bob-chat-body');
		const emptyState = document.getElementById('bob-empty-state');
		const messagesEl = document.getElementById('bob-messages');
		const form = document.getElementById('bob-chat-form');
		const input = document.getElementById('bob-chat-input');
		const sendBtn = document.getElementById('bob-send-btn');

		if (isReloadNavigation()) {
			try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignora */ }
		}
		const state = loadState();

		function scrollToBottom() {
			body.scrollTop = body.scrollHeight;
		}

		function hideEmptyState() {
			if (!emptyState.hidden) emptyState.hidden = true;
		}

		function renderStoredMessage(msg) {
			hideEmptyState();
			messagesEl.appendChild(createMessageElement(msg.role, msg.text, { song: !!msg.song }));
		}

		function openPanel() {
			panel.hidden = false;
			panel.classList.add('flex');
			toggleBtn.setAttribute('aria-expanded', 'true');
			toggleBtn.style.display = 'none';
			state.open = true;
			saveState(state);
			scrollToBottom();
			input.focus();
		}

		function closePanel() {
			panel.hidden = true;
			panel.classList.remove('flex');
			toggleBtn.setAttribute('aria-expanded', 'false');
			toggleBtn.style.display = '';
			state.open = false;
			saveState(state);
			toggleBtn.focus();
		}

		toggleBtn.addEventListener('click', openPanel);
		closeBtn.addEventListener('click', closePanel);
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && !panel.hidden) closePanel();
		});

		function addAndStore(role, text, options) {
			options = options || {};
			hideEmptyState();
			messagesEl.appendChild(createMessageElement(role, text, options));
			scrollToBottom();
			state.messages.push({ role, text, song: !!options.song });
			saveState(state);
		}

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			if (isBotTyping) return;
			const text = input.value.trim();
			if (!text) return;
			input.value = '';
			addAndStore('user', text);

			isBotTyping = true;
			input.disabled = true;
			sendBtn.disabled = true;
			const typingEl = createTypingElement();
			messagesEl.appendChild(typingEl);
			scrollToBottom();

			const delay = 1000 + Math.random() * 500;
			setTimeout(() => {
				typingEl.remove();
				const reply = getBobReply(text, state.context);
				state.context = reply.context || null;
				addAndStore('bot', reply.text, { song: !!reply.song });
				isBotTyping = false;
				input.disabled = false;
				sendBtn.disabled = false;
				input.focus();
			}, delay);
		});

		// Restaura conversa e estado de abertura entre páginas do site.
		state.messages.forEach(renderStoredMessage);
		if (state.messages.length) scrollToBottom();
		if (state.open) openPanel();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
