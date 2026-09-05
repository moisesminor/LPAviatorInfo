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
			{ src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrt-FXOSN2j-tunPe_Viiq1_xOrevo2KybweiE1IDtUvHHPo-C15bJ-xA&s=10', credito: 'John T. Daniels / Biblioteca do Congresso dos EUA' },
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
			{ src: 'https://www.meisterdrucke.uk/kunstwerke/1260px/English_School_-_Postcard_depicting_the_Santos-Dumont_14-bis_aeroplane_c_1910_-_%28MeisterDrucke-446163%29.jpg', credito: 'Domínio público' },
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
			{ src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhfZxg1Ex94GyIBbetIHo85VOOZiboIWtA2pOrvIU-yEFev3B5zV256dVE&s=10', credito: 'Domínio público' },
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
			{ src: 'https://acervo.oglobo.globo.com/incoming/10381820-99b-5e3/materia/charles.jpg', credito: 'Acervo O Globo' },
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
			{ src: 'https://preview.redd.it/the-heinkel-he-178-a-k-a-the-worlds-first-turbojet-aircraft-v0-b2cymfps83611.jpg?width=640&crop=smart&auto=webp&s=b8a4c4dddbe006c91de904ac365d3610c4d1b322', credito: 'Domínio público' },
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
			{ src: 'https://www.aereo.jor.br/wp-content/uploads//2015/10/Chuck-Yeager-Breaks-the-Sound-Barrier.jpg', credito: 'NASA' },
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
			{ src: 'https://blog.bianch.com.br/wp-content/uploads/2023/04/Aeromaritime_de_Havilland_Comet_1_Groves-1.jpg', credito: 'RuthAS / CC BY 3.0' },
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
			{ src: 'https://i.redd.it/hrkaah1avvod1.jpeg', credito: 'Domínio público' },
			{ src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTABcD7h4hwnPL5OcGu1wnDIFE6tSqgtWy75kCqHPrY2DPkEbCVFWV-CGET&s=10', credito: 'Eduard Marmet / CC BY-SA 3.0' },
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
			{ src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRkm_Nd7MaJ-l_K4CrJnI4H6qQba-qx8n4c0yJLPHBGCHhnzRyl4ZOWF8&s=10', credito: 'Alan Wilson / CC BY-SA 2.0' },
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
			{ src: 'https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/AAFC/production/_95327734_klm.jpg.webp', credito: 'Domínio público' },
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
			{ src: 'https://s.yimg.com/lo/mysterio/api/4b15a9622b5c17d6edfc7f506251de1965b096e5aef9e61fc7d01c2c3237a8eb/lightyear_networkapi/resizefill_w960%3Bquality_80%3Bformat_webp/https%3A%2F%2Fmedia.zenfs.com%2Fen%2Fthe_telegraph_258%2Ff9dc60bc3df3918ed6227605f6cff3dc', credito: 'Domínio público' },
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
			{ src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7KyE0ZQ4kTCaz9gowyYYmb9GvuPWsbBFzD2cYNGSiXc-1tMqVXpgKdq8&s=10', credito: 'Domínio público' },
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
			{ src: 'https://cdn.britannica.com/16/282316-050-12D7AFA8/Wreckage-Of-Air-Bus-A330-200-Jetliner-Which-Crashed-In-The-Atlantic-Ocean-With-228-People-On-Board-From-Rio-de-Janeiro-To-Paris.jpg', credito: 'Pawel Kierzkowski / CC BY-SA 3.0' },
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
			{ src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_AcLnzQkYWKCx5Yo3obox7UBVcbgrDmlL4cXMOThiZ_RD9k6tvZBci9U&s=10', credito: 'PK-REN / CC BY-SA 4.0' },
		],
	},

	// >>> Adicione novos acidentes marcantes abaixo desta linha <<<

];
