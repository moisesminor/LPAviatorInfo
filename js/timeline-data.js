/*
 * Fonte única das linhas do tempo exibidas em html/linha-do-tempo.html
 *
 * São dois conjuntos independentes:
 *   - window.TIMELINE_AVIACAO   -> aba "História da Aviação"
 *   - window.TIMELINE_ACIDENTES -> aba "Acidentes Marcantes"
 *
 * COMO ADICIONAR UM NOVO ITEM MANUALMENTE
 * --------------------------------------
 * Basta copiar um dos blocos abaixo e colar dentro do array desejado, mantendo
 * a vírgula entre os itens. Os itens são ordenados automaticamente pelo campo
 * "ano" ao renderizar, então a posição em que você colar não importa.
 *
 * Campos de cada item:
 *   ano       (número, obrigatório) - ano de referência mostrado na linha do tempo.
 *   titulo    (texto, obrigatório)  - título do card.
 *   resumo    (texto, obrigatório)  - frase curta exibida na pré-visualização (hover).
 *   texto     (array de textos)     - parágrafos completos exibidos ao clicar/selecionar.
 *   imagens   (array de objetos)    - { src: 'URL ou caminho', credito: 'texto opcional' }.
 *                                     Use quantas imagens quiser; todas aparecem no card aberto.
 *
 * Exemplo de bloco em branco para copiar:
 *   {
 *     ano: 0000,
 *     titulo: '',
 *     resumo: '',
 *     texto: [
 *       '',
 *     ],
 *     imagens: [
 *       { src: '', credito: '' },
 *     ],
 *   },
 */

window.TIMELINE_AVIACAO = [
	{
		ano: 1903,
		titulo: 'Primeiro voo dos irmãos Wright',
		resumo: 'O Flyer decola em Kitty Hawk e inaugura o voo motorizado controlado.',
		texto: [
			'Em 17 de dezembro de 1903, em Kitty Hawk, Carolina do Norte, Orville e Wilbur Wright realizaram o primeiro voo motorizado, sustentado e controlado de uma aeronave mais pesada que o ar.',
			'O voo mais longo do dia durou 59 segundos e cobriu 260 metros. O feito foi resultado de anos de experimentos com planadores e de um túnel de vento construído pelos próprios irmãos.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/First_flight2.jpg', credito: 'John T. Daniels / Biblioteca do Congresso dos EUA' },
		],
	},
	{
		ano: 1906,
		titulo: 'Santos Dumont e o 14-bis',
		resumo: 'Primeiro voo homologado na Europa, sem catapulta ou trilhos de lançamento.',
		texto: [
			'Em 23 de outubro de 1906, em Paris, Alberto Santos Dumont voou cerca de 60 metros com o 14-bis diante de observadores oficiais do Aeroclube da França.',
			'Por ter decolado apenas com seus próprios meios, sem auxílio de catapultas ou ventos fortes, o voo é considerado por muitos o primeiro reconhecido publicamente na Europa.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Santos-Dumont_flying_the_14_bis.jpg', credito: 'Domínio público' },
		],
	},
	{
		ano: 1919,
		titulo: 'Primeira travessia aérea do Atlântico sem escalas',
		resumo: 'Alcock e Brown cruzam o Atlântico Norte em um bombardeiro Vickers Vimy.',
		texto: [
			'John Alcock e Arthur Brown partiram de Terra Nova, no Canadá, e pousaram na Irlanda em 15 de junho de 1919, após cerca de 16 horas de voo.',
			'A travessia enfrentou nevoeiro, formação de gelo e falhas de instrumentos, e provou que voos transatlânticos diretos eram possíveis.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Vickers_Vimy_takes_off_from_Lester%27s_Field.jpg', credito: 'Domínio público' },
		],
	},
	{
		ano: 1927,
		titulo: 'Charles Lindbergh cruza o Atlântico sozinho',
		resumo: 'Voo solo sem escalas de Nova York a Paris no Spirit of St. Louis.',
		texto: [
			'Entre 20 e 21 de maio de 1927, Charles Lindbergh voou sozinho de Nova York a Paris em 33 horas e 30 minutos, cobrindo cerca de 5.800 km.',
			'A façanha transformou Lindbergh em celebridade mundial e acelerou o investimento comercial na aviação de longa distância.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Charles_Lindbergh_and_the_Spirit_of_St._Louis_%28Crisco_restoration%2C_with_wings%29.jpg', credito: 'Domínio público' },
		],
	},
	{
		ano: 1939,
		titulo: 'Primeiro voo de um avião a jato',
		resumo: 'O alemão Heinkel He 178 realiza o primeiro voo com motor turbojato.',
		texto: [
			'Em 27 de agosto de 1939, o Heinkel He 178 voou pela primeira vez, impulsionado por um motor turbojato projetado por Hans von Ohain.',
			'Foi o marco inicial da era dos jatos, que mudaria radicalmente a velocidade e a altitude de operação das aeronaves nas décadas seguintes.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Heinkel_He_178_V1.jpg', credito: 'Domínio público' },
		],
	},
	{
		ano: 1947,
		titulo: 'Chuck Yeager quebra a barreira do som',
		resumo: 'O Bell X-1 ultrapassa Mach 1 em voo controlado pela primeira vez.',
		texto: [
			'Em 14 de outubro de 1947, o piloto Chuck Yeager pilotou o foguete-avião Bell X-1 além da velocidade do som sobre o deserto da Califórnia.',
			'O voo mostrou que era possível controlar uma aeronave em regime supersônico e abriu caminho para os caças e transportes de alta velocidade.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Bell_X-1_color.jpg', credito: 'NASA' },
		],
	},
	{
		ano: 1952,
		titulo: 'Entra em serviço o primeiro jato comercial',
		resumo: 'O de Havilland Comet inaugura a aviação comercial a jato.',
		texto: [
			'Em maio de 1952, a BOAC iniciou operações com o de Havilland Comet, o primeiro avião comercial a jato do mundo, na rota de Londres a Joanesburgo.',
			'Acidentes causados por fadiga estrutural em torno das janelas levaram à retirada temporária do modelo e a mudanças profundas nas normas de projeto de fuselagens pressurizadas.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/BOAC_Comet_G-APAS.jpg', credito: 'RuthAS / CC BY 3.0' },
		],
	},
	{
		ano: 1969,
		titulo: 'Primeiros voos do Boeing 747 e do Concorde',
		resumo: 'O "Jumbo" democratiza o voo de massa; o Concorde leva o transporte ao supersônico.',
		texto: [
			'O Boeing 747 voou pela primeira vez em 9 de fevereiro de 1969, trazendo a fuselagem de corredor duplo e reduzindo drasticamente o custo por assento em rotas de longo curso.',
			'Poucas semanas depois, em 2 de março de 1969, o Concorde franco-britânico fez seu voo inaugural, tornando-se o único transporte supersônico a operar comercialmente por décadas.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Boeing_747-121%2C_Pan_American_World_Airways_-_Pan_Am_AN1023837.jpg', credito: 'Domínio público' },
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/1/16/British_Airways_Concorde_G-BOAC_03.jpg', credito: 'Eduard Marmet / CC BY-SA 3.0' },
		],
	},
	{
		ano: 1988,
		titulo: 'Airbus A320 e os comandos fly-by-wire',
		resumo: 'Primeiro avião comercial com comandos totalmente eletrônicos e proteções de envelope.',
		texto: [
			'O Airbus A320 entrou em serviço em 1988 como o primeiro jato comercial de produção com comandos de voo fly-by-wire e proteções automáticas de envelope de voo.',
			'O conceito se tornou padrão da indústria e influenciou praticamente todos os projetos de aeronaves de transporte que vieram depois.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Air_France_Airbus_A320-214_F-HEPF.jpg', credito: 'Alan Wilson / CC BY-SA 2.0' },
		],
	},

	// >>> Adicione novos marcos da História da Aviação abaixo desta linha <<<

];

window.TIMELINE_ACIDENTES = [
	{
		ano: 1977,
		titulo: 'Desastre de Tenerife',
		resumo: 'Colisão de dois Boeing 747 na pista de Los Rodeos; 583 mortos.',
		texto: [
			'Em 27 de março de 1977, dois Boeing 747 da KLM e da Pan Am colidiram na pista do aeroporto de Los Rodeos, em Tenerife, em meio a nevoeiro denso.',
			'Com 583 vítimas, é o acidente com maior número de mortos na história da aviação. Levou a mudanças no fraseado padrão de comunicações e ao reforço do conceito de gestão de recursos de cabine (CRM).',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/KLM_Boeing_747-206B_PH-BUF.jpg', credito: 'Domínio público' },
		],
	},
	{
		ano: 1985,
		titulo: 'Voo Japan Airlines 123',
		resumo: 'Falha de anteparo de pressão em um Boeing 747; 520 mortos.',
		texto: [
			'Em 12 de agosto de 1985, um Boeing 747 da Japan Airlines sofreu falha explosiva do anteparo traseiro de pressão, que arrancou grande parte do estabilizador vertical e rompeu os sistemas hidráulicos.',
			'A tripulação lutou por 32 minutos com controle apenas por potência dos motores antes da queda contra uma montanha. É o acidente com aeronave única mais letal da história.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Japan_Airlines_Boeing_747SR-46_JA8119_Itazuke.jpg', credito: 'Domínio público' },
		],
	},
	{
		ano: 1996,
		titulo: 'Voo TWA 800',
		resumo: 'Explosão do tanque central de combustível de um Boeing 747 pouco após decolar.',
		texto: [
			'Em 17 de julho de 1996, um Boeing 747 da TWA explodiu no ar perto de Long Island, Nova York, matando as 230 pessoas a bordo.',
			'A investigação concluiu que vapores inflamáveis no tanque central de combustível foram acesos por uma falha elétrica, o que resultou em novas exigências de inertização de tanques.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Trans_World_Airlines_Boeing_747-131_N93119.jpg', credito: 'Domínio público' },
		],
	},
	{
		ano: 2009,
		titulo: 'Voo Air France 447',
		resumo: 'Perda de um Airbus A330 sobre o Atlântico após congelamento dos tubos de Pitot.',
		texto: [
			'Em 1º de junho de 2009, o voo AF447, um Airbus A330 entre Rio de Janeiro e Paris, caiu no Oceano Atlântico, matando as 228 pessoas a bordo.',
			'O congelamento dos tubos de Pitot gerou indicações de velocidade inconsistentes; a resposta inadequada da tripulação levou a aeronave a uma perda de sustentação prolongada. O caso reforçou o treinamento de recuperação de estol em grandes altitudes.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/F-GZCP_Air_France_Airbus_A330-203_%28cn_660%29_%285143229202%29.jpg', credito: 'Pawel Kierzkowski / CC BY-SA 3.0' },
		],
	},
	{
		ano: 2018,
		titulo: 'Voos Lion Air 610 e, em 2019, Ethiopian 302',
		resumo: 'Dois acidentes com o Boeing 737 MAX ligados ao sistema MCAS.',
		texto: [
			'Em 29 de outubro de 2018, o voo Lion Air 610 caiu no mar de Java. Em 10 de março de 2019, o voo Ethiopian Airlines 302 caiu logo após decolar de Adis Abeba. Juntos, os acidentes mataram 346 pessoas.',
			'Ambos foram associados ao sistema MCAS, que agia com base em um único sensor de ângulo de ataque. A frota do 737 MAX ficou em solo no mundo todo por cerca de 20 meses.',
		],
		imagens: [
			{ src: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Lion_Air_Boeing_737_MAX_8_PK-LQP.jpg', credito: 'PK-REN / CC BY-SA 4.0' },
		],
	},

	// >>> Adicione novos acidentes marcantes abaixo desta linha <<<

];
