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
		},
		comparar: {
			label: 'Comparar',
			desc: 'dá para comparar duas aeronaves lado a lado, com gráfico de radar mostrando autonomia, capacidade e velocidade de cruzeiro de cada uma.'
		}
	};

	const FEATURE_ALIASES = {
		'aeroportos do brasil': 'aeroportos',
		'aeroporto': 'aeroportos',
		'aeroportos': 'aeroportos',
		'pista': 'aeroportos',
		'pistas': 'aeroportos',
		'airport': 'aeroportos',
		'airports': 'aeroportos',
		'runway': 'aeroportos',
		'rastrear': 'rastreio',
		'rastreio': 'rastreio',
		'rastreamento': 'rastreio',
		'tempo real': 'rastreio',
		'ao vivo': 'rastreio',
		'track flight': 'rastreio',
		'flight tracking': 'rastreio',
		'live tracking': 'rastreio',
		'real time': 'rastreio',
		'simular': 'simulacao',
		'simulacao': 'simulacao',
		'simulador': 'simulacao',
		'tempo de voo': 'simulacao',
		'quanto tempo demora': 'simulacao',
		'simulate flight': 'simulacao',
		'flight simulator': 'simulacao',
		'flight time': 'simulacao',
		'modelos': 'modelos',
		'quais avioes': 'modelos',
		'quais aeronaves': 'modelos',
		'catalogo': 'modelos',
		'aircraft models': 'modelos',
		'plane models': 'modelos',
		'which planes': 'modelos',
		'which aircraft': 'modelos',
		'catalog': 'modelos',
		'companhias': 'companhias',
		'companhia aerea': 'companhias',
		'cia aerea': 'companhias',
		'quais companhias': 'companhias',
		'airline': 'companhias',
		'airlines': 'companhias',
		'which airlines': 'companhias',
		'comparar': 'comparar',
		'comparacao': 'comparar',
		'comparar aeronaves': 'comparar',
		'comparar avioes': 'comparar',
		'comparar modelos': 'comparar',
		'compare': 'comparar',
		'comparison': 'comparar',
		'compare aircraft': 'comparar',
		'compare planes': 'comparar'
	};

	const AVIATION_KEYWORDS = [
		'aviao', 'avioes', 'aviaozinho', 'aeronave', 'aeronaves', 'voo', 'voos', 'voar', 'voando', 'voado',
		'aeroporto', 'aeroportos', 'aeroportuario', 'piloto', 'pilotos', 'pilotar', 'pilotagem', 'aviador',
		'aviadora', 'aviadores', 'comissario', 'comissaria', 'comissarios', 'comissarias', 'tripulacao',
		'tripulante', 'tripulantes', 'cockpit', 'cabine', 'cabine de comando', 'turbina', 'motor', 'motores',
		'reator', 'motor a jato', 'helice', 'turboelice', 'asa', 'asas', 'fuselagem', 'trem de pouso',
		'flaps', 'checklist', 'caixa preta', 'decolagem', 'pouso', 'aterrissagem', 'altitude', 'turbulencia',
		'radar', 'torre de controle', 'trafego aereo', 'espaco aereo', 'hangar', 'combustivel', 'querosene',
		'mach', 'velocidade de cruzeiro', 'autonomia', 'passageiro', 'passageiros', 'companhia aerea',
		'companhias aereas', 'cia aerea', 'aereo', 'aerea', 'aereos', 'aereas', 'fabricante', 'fabricantes',
		'jato', 'jatos', 'aviacao', 'aviacao comercial', 'aeronautica', 'aeronautico', 'aerodinamica',
		'helicoptero', 'helicopteros', 'sobrevoar', 'malha aerea', 'rota aerea', 'rotas aereas',
		'iata', 'icao', 'check-in', 'bagagem', 'escala', 'tarifa aerea', 'classe economica', 'primeira classe'
	];

	// ---------------------------------------------------------------------
	// Utilidades de texto
	// ---------------------------------------------------------------------
	// Abreviações comuns de chat/internet em português — expandidas para a
	// forma "completa" logo na normalização, assim TODAS as listas de palavras
	// e frases do bot (agradecimento, afirmação, saudação etc.) já entendem
	// "obg", "vc", "tmj" e afinal sem precisar duplicar cada abreviação em
	// cada lista separadamente.
	const ABBREVIATIONS = {
		'obg': 'obrigado', 'obgd': 'obrigado', 'obgda': 'obrigada', 'vlw': 'valeu', 'vlws': 'valeu',
		'tmj': 'sim', 'tmjj': 'sim', 'pq': 'porque', 'sla': 'sei la', 'slk': 'sei la',
		'vc': 'voce', 'vcs': 'voces', 'blz': 'beleza', 'mto': 'muito', 'mt': 'muito',
		'td': 'tudo', 'tds': 'todos', 'qnd': 'quando', 'qm': 'quem', 'pfv': 'por favor',
		'pfvr': 'por favor', 'dps': 'depois', 'hj': 'hoje', 'agr': 'agora', 'tb': 'tambem',
		'tbm': 'tambem', 'naum': 'nao', 'axo': 'acho', 'eh': 'e', 'qlqr': 'qualquer'
	};

	// Vocabulário de aviação em inglês traduzido para o termo em português já
	// reconhecido pelo bot — assim "plane", "aircraft", "airport", "pilot" etc.
	// caem automaticamente nas mesmas AVIATION_KEYWORDS/FEATURE_ALIASES/
	// ASPIRATION_ROLES sem duplicar cada lista em inglês. Só traduz palavras de
	// conteúdo (substantivos), nunca palavras gramaticais (who/are/you/want...)
	// — essas dependem da ordem da frase e são tratadas à parte, como frases
	// literais em inglês nas próprias listas de intenção (ver isAboutBob,
	// ASPIRATION_TRIGGERS, SELF_QUESTION_TRIGGERS etc.), pois traduzir palavra
	// por palavra quebraria a sequência exigida por essas frases.
	const ENGLISH_TERMS = {
		'airplane': 'aviao', 'airplanes': 'avioes', 'plane': 'aviao', 'planes': 'avioes',
		'aircraft': 'aeronave', 'flight': 'voo', 'flights': 'voos', 'flying': 'voando',
		'airport': 'aeroporto', 'airports': 'aeroportos',
		'pilot': 'piloto', 'pilots': 'pilotos', 'captain': 'comandante',
		'attendant': 'comissario', 'attendants': 'comissarios', 'stewardess': 'comissaria', 'steward': 'comissario',
		'controller': 'controlador de trafego aereo', 'engineer': 'engenheiro aeronautico',
		'mechanic': 'mecanico de aeronaves', 'dispatcher': 'despachante operacional',
		'crew': 'tripulacao', 'cabin': 'cabine', 'engine': 'motor', 'engines': 'motores',
		'turbine': 'turbina', 'propeller': 'helice', 'wing': 'asa', 'wings': 'asas', 'fuselage': 'fuselagem',
		'takeoff': 'decolagem', 'landing': 'pouso', 'turbulence': 'turbulencia',
		'fuel': 'combustivel', 'kerosene': 'querosene', 'speed': 'velocidade', 'range': 'autonomia',
		'passenger': 'passageiro', 'passengers': 'passageiros',
		'airline': 'companhia aerea', 'airlines': 'companhias aereas',
		'manufacturer': 'fabricante', 'manufacturers': 'fabricantes',
		'jet': 'jato', 'jets': 'jatos', 'aviation': 'aviacao', 'aerodynamics': 'aerodinamica',
		'baggage': 'bagagem', 'luggage': 'bagagem', 'layover': 'escala', 'stopover': 'escala',
		'helicopter': 'helicoptero', 'helicopters': 'helicopteros',
		'models': 'modelos', 'model': 'modelo', 'company': 'companhia', 'companies': 'companhias',
		'track': 'rastrear', 'tracking': 'rastreio', 'simulate': 'simular', 'simulation': 'simulacao',
		'compare': 'comparar', 'comparison': 'comparacao'
	};

	function expandAbbreviations(text) {
		return text
			.split(' ')
			.map((w) => ABBREVIATIONS[w] || ENGLISH_TERMS[w] || w)
			.join(' ');
	}

	// Reduz letras repetidas 3+ vezes seguidas a uma só ("oiiiiii" -> "oi",
	// "aaaajuda" -> "ajuda"), sem mexer em palavras com dobra legítima
	// ("carro", "isso" só têm 2 repetições seguidas).
	function collapseRepeatedLetters(text) {
		return text.replace(/([a-z])\1{2,}/g, '$1');
	}

	function normalize(str) {
		const base = String(str || '')
			.toLowerCase()
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.replace(/[^a-z0-9\s]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		return expandAbbreviations(collapseRepeatedLetters(base)).replace(/\s+/g, ' ').trim();
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
	// Inclui variantes em inglês ("good morning" etc.) para aceitar cumprimentos
	// nesse idioma também.
	const GREETING_PHRASES = [
		'bom dia', 'boa tarde', 'boa noite', 'fala ae bob', 'fala bob', 'eae bob', 'e ai bob',
		'good morning', 'good afternoon', 'good evening', 'good night'
	];
	// Palavras/frases curtas comuns demais (podem aparecer dentro de perguntas
	// reais, tipo "me fala mais sobre..." ou "bob, qual o alcance..."), então só
	// contam como saudação quando a mensagem inteira é curta.
	const GREETING_SHORT_WORDS = [
		'oi', 'ola', 'opa', 'eae', 'e ai', 'hey', 'hello', 'salve', 'bob', 'fala', 'falae', 'fala ae', 'beleza',
		'hi', 'howdy', 'yo', 'sup', 'greetings'
	];
	// Apelidos/gírias grudadas no nome do bot ("bobzada", "boborrr", "bobzão")
	// só valem como saudação na mesma mensagem curta — evita pegar "bob" no
	// meio de uma pergunta de verdade.
	function hasWordStartingWith(norm, prefix) {
		return wordsOf(norm).some((w) => w.length > prefix.length && w.startsWith(prefix));
	}
	function isGreeting(norm) {
		if (GREETING_PHRASES.some((w) => hasWord(norm, w))) return true;
		if (wordsOf(norm).length > 3) return false;
		if (GREETING_SHORT_WORDS.some((w) => hasWord(norm, w))) return true;
		return hasWordStartingWith(norm, 'bob');
	}

	// Perguntas de "tudo bem com você?" dirigidas ao próprio Bob — diferente de
	// uma saudação simples, aqui a pessoa quer mesmo saber como ele está, então
	// merece uma resposta de verdade em vez do "oi, como posso ajudar" genérico.
	// As frases com "você/vc" explícito valem em qualquer mensagem; as curtas e
	// ambíguas ("vai bem", "tudo em cima") só contam se a mensagem inteira for
	// curta, senão pegariam frases reais tipo "esse avião vai bem em turbulência?".
	const WELLBEING_PHRASES = [
		'como voce esta', 'como vc esta', 'como voce ta', 'como vc ta', 'voce esta bem', 'vc esta bem',
		'voce ta bem', 'vc ta bem', 'tudo bem com voce', 'tudo bem contigo', 'como voce vai', 'voce vai bem',
		'vc vai bem', 'esta tudo bem com voce', 'e voce como esta', 'e voce como vai',
		'how are you', 'how are you doing', 'are you ok', 'are you okay', 'you doing well'
	];
	const WELLBEING_SHORT_WORDS = ['tudo bem', 'tudo bom', 'ta bem', 'ta bom', 'ta tudo bem', 'como vai', 'vai bem', 'tudo em cima', 'tudo joia', 'como anda', 'de boa', 'suave'];
	function isWellbeingQuestion(norm) {
		if (WELLBEING_PHRASES.some((w) => hasWord(norm, w))) return true;
		if (wordsOf(norm).length > 4) return false;
		return WELLBEING_SHORT_WORDS.some((w) => hasWord(norm, w));
	}

	// Depois que o Bob pergunta "e você, tudo certo?", a resposta do usuário
	// ("sim", "estou bem", "não muito bem"...) precisa ser lida nesse contexto —
	// checa negativo primeiro porque "não estou bem" contém a palavra "bem".
	const WELLBEING_REPLY_NEGATIVE_WORDS = [
		'nao estou bem', 'nao to bem', 'nao muito bem', 'nao tao bem', 'nao esta bem', 'nao tudo bem',
		'mal', 'pessimo', 'ruim', 'cansado', 'cansada', 'triste', 'meio mal', 'enjoado', 'enjoada',
		'estressado', 'estressada', 'doente', 'nao', 'negativo',
		'not good', 'not well', 'not great', 'bad', 'sad', 'tired', 'terrible', 'awful'
	];
	const WELLBEING_REPLY_POSITIVE_WORDS = [
		'bem', 'otimo', 'excelente', 'numa boa', 'tranquilo', 'joia', 'top', 'daora', 'massa', 'show',
		'sim', 'com certeza', 'claro', 'demais', 'suave', 'de boa', 'tudo certo', 'tudo em ordem', 'tudo joia',
		'good', 'great', 'fine', 'well', 'awesome', 'excellent'
	];
	function isWellbeingReplyNegative(norm) {
		return WELLBEING_REPLY_NEGATIVE_WORDS.some((w) => hasWord(norm, w));
	}
	function isWellbeingReplyPositive(norm) {
		return WELLBEING_REPLY_POSITIVE_WORDS.some((w) => hasWord(norm, w));
	}

	const THANKS_WORDS = ['obrigado', 'obrigada', 'valeu', 'vlw', 'thanks', 'brigado', 'brigada', 'thank you', 'thx', 'ty', 'appreciate it'];
	function isThanks(norm) {
		return THANKS_WORDS.some((w) => hasWord(norm, w));
	}

	const FAREWELL_WORDS = ['tchau', 'ate mais', 'ate logo', 'falou', 'flw', 'adeus', 'ate a proxima', 'bye', 'goodbye', 'see you', 'see ya', 'later', 'farewell'];
	function isFarewell(norm) {
		return FAREWELL_WORDS.some((w) => hasWord(norm, w));
	}

	const AFFIRM_WORDS = [
		'sim', 'com certeza', 'claro', 'quero sim', 'pode ser', 'bora', 'uhum', 'aham', 'exatamente', 'positivo', 'afirmativo',
		'yes', 'yeah', 'yep', 'yup', 'sure', 'of course', 'okay', 'certainly', 'absolutely'
	];
	function isAffirmative(norm) {
		return AFFIRM_WORDS.some((w) => hasWord(norm, w));
	}

	const NEGATIVE_WORDS = ['nao', 'negativo', 'nunca', 'deixa pra la', 'agora nao', 'sei la', 'no', 'nope', 'never', 'i dont know', 'dunno', 'idk', 'not sure'];
	function isNegative(norm) {
		return NEGATIVE_WORDS.some((w) => hasWord(norm, w));
	}

	function isAboutBob(norm) {
		return hasWord(norm, 'quem e voce') || hasWord(norm, 'quem e vc') || hasWord(norm, 'seu nome') ||
			hasWord(norm, 'voce e quem') || hasWord(norm, 'quem e o bob') ||
			hasWord(norm, 'who are you') || hasWord(norm, 'what is your name') || hasWord(norm, 'whats your name') || hasWord(norm, 'your name');
	}

	// Profissões da aviação que o Bob reconhece para incentivar quem diz que
	// quer seguir esse caminho ou pergunta se teria perfil para ele.
	const ASPIRATION_ROLES = {
		'piloto': 'piloto',
		'pilota': 'piloto',
		'aviador': 'piloto',
		'aviadora': 'piloto',
		'comandante': 'comandante',
		'copiloto': 'copiloto',
		'comissario': 'comissário de bordo',
		'comissaria': 'comissária de bordo',
		'aeromoça': 'comissária de bordo',
		'aeromoco': 'comissário de bordo',
		'controlador de voo': 'controlador de tráfego aéreo',
		'controlador de trafego aereo': 'controlador de tráfego aéreo',
		'engenheiro aeronautico': 'engenheiro aeronáutico',
		'engenheira aeronautica': 'engenheira aeronáutica',
		'mecanico de aeronaves': 'mecânico de aeronaves',
		'mecanico de aviao': 'mecânico de aviões',
		'despachante operacional': 'despachante operacional de voo',
		'co pilot': 'copiloto'
	};

	// Correspondência exata (sem tolerância a erro de digitação) — necessária
	// aqui porque termos como "piloto" e "copiloto" têm distância de edição
	// pequena e a busca fuzzy de hasWord os confundiria entre si.
	function hasExactWord(norm, phrase) {
		const p = normalize(phrase);
		if (!p) return false;
		return (' ' + norm + ' ').indexOf(' ' + p + ' ') !== -1;
	}

	function findAviationRole(norm) {
		const keys = Object.keys(ASPIRATION_ROLES).sort((a, b) => b.length - a.length);
		for (const alias of keys) {
			if (hasExactWord(norm, alias)) return ASPIRATION_ROLES[alias];
		}
		return null;
	}

	// "Eu queria ser piloto", "meu sonho é ser comissária" etc. — o usuário
	// declara o que quer ser. Só conta como aspiração de aviação quando junto
	// tem uma das profissões de ASPIRATION_ROLES. Inclui as mesmas frases em
	// inglês ("I want to be a pilot" etc.) — ficam sem tradução propositalmente
	// (ver ENGLISH_TERMS), então precisam estar aqui por extenso.
	const ASPIRATION_TRIGGERS = [
		'quero ser', 'queria ser', 'gostaria de ser', 'sonho em ser', 'sonho ser',
		'meu sonho e ser', 'pretendo ser', 'vou ser', 'quero me tornar', 'queria me tornar',
		'tenho vontade de ser', 'um dia quero ser', 'um dia serei',
		'i want to be', 'i wanted to be', 'i wish to be', 'i dream of being',
		'i plan to be', 'my dream is to be', 'i would like to be', 'going to be'
	];
	function findAspirationRole(norm) {
		const hasTrigger = ASPIRATION_TRIGGERS.some((t) => hasWord(norm, t));
		if (!hasTrigger) return null;
		return findAviationRole(norm);
	}

	// Perguntas em que o usuário busca validação sobre si mesmo ("você acha que
	// eu dou pra piloto?", "será que eu consigo?") — o Bob deve sempre acolher
	// e incentivar, com ou sem uma profissão específica identificada.
	const SELF_QUESTION_TRIGGERS = [
		'voce acha que eu', 'acha que eu', 'sera que eu', 'eu seria um bom', 'eu seria uma boa',
		'eu daria um bom', 'eu daria uma boa', 'eu dou pra', 'eu levo jeito', 'tenho jeito para',
		'consigo ser um bom', 'consigo ser uma boa', 'sou capaz de ser', 'eu teria talento',
		'do you think i', 'would i make a good', 'would i be a good', 'am i good enough', 'do i have what it takes'
	];
	function isSelfQuestion(norm) {
		return SELF_QUESTION_TRIGGERS.some((t) => hasWord(norm, t));
	}

	function isHelp(norm) {
		return hasWord(norm, 'ajuda') || hasWord(norm, 'menu') || hasWord(norm, 'o que voce sabe') ||
			hasWord(norm, 'o que posso perguntar') || hasWord(norm, 'o que voce faz') || hasWord(norm, 'me ajuda') ||
			hasWord(norm, 'help') || hasWord(norm, 'what can you do') || hasWord(norm, 'what do you know') || hasWord(norm, 'what can i ask');
	}

	// Pedido de aeronaves "aleatórias" (ex.: "me dê o nome de 2 aeronaves
	// aleatórias", "sorteia um avião") — só dispara quando a mensagem combina
	// uma palavra de sorteio com uma palavra de aeronave, evitando falso
	// positivo em perguntas tipo "número aleatório de passageiros".
	const RANDOM_TRIGGER_WORDS = ['aleatorio', 'aleatoria', 'aleatorios', 'aleatorias', 'sorteia', 'sorteio', 'sortear', 'ao acaso', 'random'];
	const AIRCRAFT_GENERIC_WORDS = ['aviao', 'avioes', 'aeronave', 'aeronaves', 'modelo', 'modelos', 'jato', 'jatos'];
	function isRandomAircraftRequest(norm) {
		const hasRandom = RANDOM_TRIGGER_WORDS.some((w) => hasWord(norm, w));
		const hasAircraftWord = AIRCRAFT_GENERIC_WORDS.some((w) => hasWord(norm, w));
		return hasRandom && hasAircraftWord;
	}

	const COUNT_WORDS = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6 };
	function extractCount(norm, fallback) {
		const digitMatch = norm.match(/\d+/);
		if (digitMatch) {
			const n = parseInt(digitMatch[0], 10);
			if (n > 0) return n;
		}
		const words = wordsOf(norm);
		for (const w of words) {
			if (COUNT_WORDS[w]) return COUNT_WORDS[w];
		}
		return fallback;
	}

	// Sorteia N aeronaves distintas entre as disponíveis no catálogo do site
	// (window.AIRCRAFT_MODELS, a mesma base usada em Modelos e na Simulação).
	function pickRandomAircraft(count) {
		const models = window.AIRCRAFT_MODELS || [];
		if (!models.length) return [];
		const n = Math.max(1, Math.min(count, models.length, 6));
		return shuffle(models).slice(0, n);
	}

	function describeRandomAircraft(list) {
		const names = list.map((m) => bold(m.name));
		const openers = [
			'Rodei uma busca aqui no catálogo e essas foram as aeronaves sorteadas:',
			'Dei uma vasculhada nos modelos do site e escolhi ao acaso:',
			'Prontinho, sorteei aqui entre as aeronaves disponíveis:',
			'Busquei entre os modelos cadastrados e essas foram as escolhidas:'
		];
		let joined;
		if (names.length === 1) joined = names[0];
		else if (names.length === 2) joined = `${names[0]} e ${names[1]}`;
		else joined = `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
		return `${pick('opener-random-aircraft', openers)} ${joined}. Quer saber mais detalhes sobre algum deles?`;
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
	// Marca o nome específico do conteúdo pedido (aeronave, fabricante,
	// companhia, seção do site) para ser exibido em destaque (negrito) no chat.
	function bold(text) {
		return `**${text}**`;
	}

	function describeAircraft(model) {
		const manuf = window.MANUFACTURER_INFO && window.MANUFACTURER_INFO[model.manufacturer];
		const name = bold(model.name);
		const openers = [
			`O ${name} é um avião e tanto.`,
			`Ah, o ${name}!`,
			`Boa escolha perguntar sobre o ${name}.`,
			`Falando do ${name}:`
		];
		const facts = shuffle(model.descricao).slice(0, 2).join(' ');
		const specTemplates = [
			`Ele é do tipo ${model.tipo}, leva até ${model.passageiros} passageiros, tem autonomia de ${model.autonomia} e cruza os céus a ${model.velocidade}.`,
			`Com capacidade para ${model.passageiros} passageiros e alcance de ${model.autonomia}, esse ${model.tipo.toLowerCase()} voa a ${model.velocidade}.`,
			`Classificado como ${model.tipo}, comporta ${model.passageiros} passageiros e chega a ${model.autonomia} de autonomia, voando a ${model.velocidade}.`
		];
		let manufLine = '';
		if (manuf) {
			const manufName = bold(model.manufacturer);
			const manufTemplates = [
				` É fabricado pela ${manufName}, sediada em ${manuf.hq} (${manuf.country}).`,
				` Sai de fábrica da ${manufName}, com sede em ${manuf.hq}, ${manuf.country}.`
			];
			manufLine = pick('manuf-' + model.manufacturer, manufTemplates);
		}
		return `${pick('opener-aircraft', openers)} ${facts} ${pick('spec-' + model.name, specTemplates)}${manufLine}`;
	}

	function describeManufacturer(manufacturer, models) {
		const info = window.MANUFACTURER_INFO && window.MANUFACTURER_INFO[manufacturer];
		const manufName = bold(manufacturer);
		const names = models.map((m) => bold(m.name)).join(', ');
		const openers = [
			`A ${manufName}${info ? ' é uma fabricante ' + info.country : ''}.`,
			`Sobre a ${manufName}:`,
			`Deixa eu te falar da ${manufName}.`
		];
		const listTemplates = [
			`Temos ${models.length} modelo${models.length === 1 ? '' : 's'} dela aqui no site: ${names}.`,
			`No nosso catálogo, a ${manufName} aparece com ${models.length} aeronave${models.length === 1 ? '' : 's'}: ${names}.`
		];
		return `${pick('opener-manuf', openers)} ${pick('list-' + manufacturer, listTemplates)} Quer que eu conte mais sobre algum modelo específico?`;
	}

	function describeManufacturersList(names) {
		const openers = [
			'Temos aeronaves de várias fabricantes por aqui:',
			'Olha, no site você encontra aeronaves destas fabricantes:',
			'As fabricantes que tenho no catálogo são:'
		];
		return `${pick('opener-manuf-list', openers)} ${names.map(bold).join(', ')}. Sobre qual delas você quer saber mais?`;
	}

	function describeAirline(airline) {
		const name = bold(airline.name);
		const openers = [
			`Sobre a ${name}:`,
			`Falando da ${name},`,
			`A ${name} é uma das que temos por aqui.`
		];
		const tails = [
			`Faz parte da ${airline.alliance}, com frota de cerca de ${airline.fleet} aeronaves, operando principalmente em ${airline.hubs.join(', ')}.`,
			`Integra a ${airline.alliance}, tem em torno de ${airline.fleet} aeronaves na frota e seus hubs principais são ${airline.hubs.join(', ')}.`
		];
		return `${pick('opener-airline', openers)} ${airline.description} ${pick('tail-' + airline.name, tails)}`;
	}

	function describeFeature(feature) {
		const label = bold(feature.label);
		const openers = [
			`Na página de ${label},`,
			`Aqui no site, na seção ${label},`,
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
	const WELLBEING_ANSWERS = [
		'Tô voando liso, obrigado por perguntar! E você, tudo certo por aí?',
		'Tudo em ordem por aqui, decolando bem! E você, como tá?',
		'Bem demais, sistemas em dia e pronto pra ajudar! E você, tudo joia?',
		'Tudo tranquilo na cabine por aqui! E contigo, tudo certo?',
		'Voando alto e de boa! E você, como vai?'
	];
	const WELLBEING_HAPPY_FOR_USER = [
		'Que ótimo saber disso! Fico feliz por você. 😊 Posso te ajudar com alguma dúvida sobre aviação?',
		'Que bom! Fico contente em saber. Se quiser, é só perguntar sobre aviões, aeroportos ou companhias aéreas.',
		'Maravilha, fico feliz mesmo! Bora falar de aviação então?',
		'Show de bola! Fico feliz por você estar bem. Em que posso ajudar agora?'
	];
	const WELLBEING_COMFORT_FOR_USER = [
		'Poxa, sinto muito ouvir isso. Espero que você melhore logo! Se quiser, posso tentar ajudar com algo sobre aviação para distrair um pouco.',
		'Que pena, espero que fique tudo bem em breve. Estou por aqui se quiser conversar sobre aviões — às vezes ajuda a distrair.',
		'Sinto muito por isso. Se precisar de uma pausa, posso te contar algo interessante sobre aviação enquanto isso.',
		'Poxa vida, espero que melhore rápido. Qualquer coisa, estou aqui — inclusive para falar de aviação e distrair a mente.'
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

	// Usadas quando a mensagem claramente fala de aviação (bateu alguma
	// AVIATION_KEYWORDS) mas não é um pedido específico o bastante para cair em
	// aeronave/fabricante/companhia/seção do site — em vez de dizer "não sei",
	// o Bob puxa assunto e convida o usuário a especificar.
	const GENERIC_AVIATION_REPLIES = [
		'Aviação é exatamente o meu assunto! Me conta um pouco mais: quer saber sobre um modelo de avião, uma companhia aérea ou alguma das ferramentas do site?',
		'Esse é o tipo de papo que eu curto! Posso te ajudar com aeronaves, fabricantes, companhias aéreas ou as seções do site — é só me dar mais detalhes.',
		'Boa, sou fã de aviação também! Se quiser, posso falar sobre um modelo específico, uma companhia aérea ou mostrar as ferramentas que temos por aqui.',
		'Aviação é vida! Me diz mais sobre o que você quer saber que eu te ajudo — aeronaves, fabricantes, companhias ou as seções do site.',
		'Legal! Manda mais detalhes que eu te ajudo — pode ser sobre um avião, uma companhia aérea ou qualquer seção do site.'
	];

	// Incentivo para quem diz que quer seguir uma carreira na aviação.
	const ASPIRATION_TEMPLATES = [
		'Que demais! Ser {role} é um sonho e tanto, e a aviação sempre precisa de gente apaixonada assim. Estude bastante, se informe e não desista — você vai longe!',
		'Adorei saber disso! O caminho para virar {role} não é fácil, mas quem tem esse sonho de verdade chega lá. Continue se dedicando!',
		'Show de bola! A aviação ganha muito com gente que sonha em ser {role}. Bora se preparar — e pode contar comigo pra tirar dúvidas sobre aviões, companhias e mais!',
		'Incrível! Ser {role} é uma jornada linda. Persistência e estudo são a chave, e eu confio que você vai conseguir realizar esse sonho.'
	];
	function describeAspiration(role) {
		const template = pick('aspiration-' + role, ASPIRATION_TEMPLATES);
		return template.replace('{role}', bold(role));
	}

	// Perguntas de autoconfiança ("você acha que eu dou pra piloto?") — o Bob
	// sempre acolhe e incentiva, com o papel específico em destaque quando
	// identificado, ou de forma mais genérica quando não é.
	const SELF_QUESTION_ROLE_TEMPLATES = [
		'Com certeza! Quem se interessa por aviação do jeito que você faz já tem a atitude certa para ser um ótimo {role}. Continue estudando e sonhando alto!',
		'Sem dúvida! Interesse e vontade de aprender são o começo de todo bom {role}. Eu aposto em você!',
		'Óbvio que sim! O que faz um bom {role} é justamente essa curiosidade que você está mostrando agora. Continue assim!'
	];
	const SELF_QUESTION_GENERIC_TEMPLATES = [
		'Com certeza que sim! Curiosidade e interesse por aviação já são um baita começo. Continue perguntando e aprendendo por aqui!',
		'Não tenho dúvidas! Quem se interessa de verdade por aviação, como você, já está no caminho certo.',
		'Óbvio que sim! Esse seu interesse por aviação já diz muito. Bora continuar aprendendo juntos?'
	];
	function describeSelfQuestion(role) {
		if (role) {
			const template = pick('self-question-' + role, SELF_QUESTION_ROLE_TEMPLATES);
			return template.replace('{role}', bold(role));
		}
		return pick('self-question-generic', SELF_QUESTION_GENERIC_TEMPLATES);
	}

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

	// ---------------------------------------------------------------------
	// Tradução da resposta (DeepL) — o Bob sempre RACIOCINA em português
	// (getBobReply abaixo), mas se a pergunta do usuário veio em inglês, a
	// resposta final é traduzida antes de aparecer no chat. Depende de
	// DEEPL_API_KEY configurada no servidor (.env) e do site estar sendo
	// servido via server.js — sem a chave, /api/translate responde com erro
	// e o Bob simplesmente mostra a resposta em português (ver
	// translateToEnglish abaixo).
	// ---------------------------------------------------------------------
	// Palavras exclusivas de português: se qualquer uma aparecer, a mensagem
	// não é tratada como inglês mesmo que também contenha termos em inglês
	// (evita traduzir mensagens mistas ou majoritariamente em português).
	const PORTUGUESE_ONLY_MARKERS = new Set([
		'voce', 'vc', 'nao', 'sim', 'que', 'isso', 'essa', 'esse', 'para', 'como', 'muito', 'tambem',
		'esta', 'sao', 'uma', 'obrigado', 'obrigada', 'valeu', 'oi', 'ola', 'aviao', 'avioes',
		'aeroporto', 'aeronave', 'qual', 'quais', 'onde', 'quando', 'porque', 'com', 'sem', 'voo'
	]);
	// Palavras funcionais do inglês que não têm ambiguidade com português —
	// usadas junto com as chaves de ENGLISH_TERMS para detectar o idioma.
	const ENGLISH_FUNCTION_WORDS = new Set([
		'the', 'is', 'are', 'am', 'you', 'your', 'what', 'who', 'when', 'where', 'why', 'how',
		'want', 'wanted', 'wish', 'dream', 'become', 'yes', 'no', 'thanks', 'thank', 'bye',
		'goodbye', 'hello', 'hi', 'hey', 'please', 'and', 'with', 'do', 'does', 'did', 'can',
		'could', 'would', 'will', 'tell', 'me', 'about', 'good', 'great', 'help', 'not', 'sure', 'okay'
	]);

	// Roda sobre o texto ORIGINAL do usuário, antes de normalize() traduzir os
	// termos de aviação para português — depois disso o sinal "isso veio em
	// inglês" já teria se perdido.
	function isEnglishInput(raw) {
		const text = String(raw || '');
		if (/[áàâãéèêíìóòôõúùçñÁÀÂÃÉÈÊÍÌÓÒÔÕÚÙÇÑ]/.test(text)) return false;

		const tokens = text.toLowerCase().match(/[a-z]+/g) || [];
		if (!tokens.length) return false;
		if (tokens.some((t) => PORTUGUESE_ONLY_MARKERS.has(t))) return false;

		return tokens.some((t) => ENGLISH_TERMS[t] || ENGLISH_FUNCTION_WORDS.has(t));
	}

	async function translateToEnglish(text) {
		try {
			const response = await fetch('/api/translate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text, target_lang: 'EN-US' })
			});
			if (!response.ok) return text;
			const data = await response.json();
			return data && data.translated ? data.translated : text;
		} catch (e) {
			return text;
		}
	}

	// prevContext guarda o que o Bob acabou de perguntar (ex.: "quer saber mais
	// sobre algum modelo específico?"), para interpretar respostas curtas como
	// "sim"/"não" no contexto da própria pergunta em vez de tratá-las isoladas.
	function getBobReply(raw, prevContext) {
		const norm = normalize(raw);
		if (!norm) return { text: 'Pode repetir? Não entendi muito bem.', context: prevContext || null };

		// O Bob acabou de perguntar "e você, tudo certo?" — antes de qualquer
		// outra coisa, vê se essa mensagem é a resposta disso.
		if (prevContext && prevContext.awaiting === 'user-wellbeing') {
			if (isWellbeingReplyNegative(norm)) return { text: pick('wellbeing-comfort', WELLBEING_COMFORT_FOR_USER), context: null };
			if (isWellbeingReplyPositive(norm)) return { text: pick('wellbeing-happy', WELLBEING_HAPPY_FOR_USER), context: null };
		}

		if (isEasterEgg(norm)) return { text: EASTER_EGG_TEXT, song: true, context: null };
		if (isGreeting(norm)) return { text: pick('greeting', GREETINGS), context: null };
		if (isWellbeingQuestion(norm)) return { text: pick('wellbeing', WELLBEING_ANSWERS), context: { awaiting: 'user-wellbeing' } };
		if (isThanks(norm)) return { text: pick('thanks', THANKS), context: null };
		if (isFarewell(norm)) return { text: pick('bye', BYES), context: null };
		if (isAboutBob(norm)) return { text: pick('about', ABOUTS), context: null };
		if (isHelp(norm)) return { text: HELP_TEXT, context: null };

		if (isRandomAircraftRequest(norm)) {
			const list = pickRandomAircraft(extractCount(norm, 2));
			if (list.length) return { text: describeRandomAircraft(list), context: { awaiting: 'model-pick', models: list } };
		}

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

		const aspirationRole = findAspirationRole(norm);
		if (aspirationRole) return { text: describeAspiration(aspirationRole), context: null };

		if (isSelfQuestion(norm)) return { text: describeSelfQuestion(findAviationRole(norm)), context: null };

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
		if (hasAviationKeyword) return { text: pick('generic-aviation', GENERIC_AVIATION_REPLIES), context: null };

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

	// Escapa HTML antes de converter marcações **negrito** em <strong>, usado
	// só nas respostas do bot (texto do usuário sempre vai como textContent puro).
	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function renderRichText(text) {
		return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
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
		if (role === 'bot') {
			bubble.innerHTML = renderRichText(text);
		} else {
			bubble.textContent = text;
		}
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
			setTimeout(async () => {
				const reply = getBobReply(text, state.context);
				state.context = reply.context || null;
				// Mantém o indicador de "digitando" durante a tradução (quando aplicável),
				// já que ela depende de uma chamada de rede ao /api/translate.
				const replyText = isEnglishInput(text) ? await translateToEnglish(reply.text) : reply.text;
				typingEl.remove();
				addAndStore('bot', replyText, { song: !!reply.song });
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
