// Parallax 3D do hero, dirigido por scroll (perspective + translateZ + GSAP
// ScrollTrigger + Lenis). Inspirado no parallax de scroll estilo Firewatch
// do vídeo https://cdn.dribbble.com/userupload/29196834/file/large-a0772ddebb0846ce304433f7d08dd9f7.mp4:
// bandas em profundidades diferentes sobem em velocidades diferentes e
// crescem ao longo do scroll, até a banda mais próxima engolir a viewport.
// Aqui o avião ocupa o papel do sujeito em profundidade média, com banking
// 3D real vindo do scroll + yaw vindo do ponteiro.
//
// Ver o plano completo (estrutura do rig, tabela de profundidades, regras
// de acessibilidade) no histórico do projeto. Fica na raiz do repositório
// (não em uma subpasta) porque tailwind.config.js só escaneia `./*.js`.
(function () {
	'use strict';

	if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
		// vendor/gsap.min.js ou vendor/ScrollTrigger.min.js não carregou —
		// a página continua utilizável, só sem o rig 3D. Avisa no console em
		// vez de falhar em silêncio, já que essa é a causa mais comum de
		// "o parallax não faz nada".
		console.warn('[hero.js] gsap/ScrollTrigger não carregaram — parallax do hero desativado. Verifique se vendor/gsap.min.js e vendor/ScrollTrigger.min.js estão sendo servidos (Network tab) e dê um hard refresh (Ctrl+Shift+R) para descartar cache antigo.');
		return;
	}

	if (typeof Lenis === 'undefined' && typeof window.Lenis === 'undefined') {
		console.warn('[hero.js] Lenis não carregou — parallax do hero desativado.');
		return;
	}

	var hero = document.getElementById('hero');
	if (!hero) return;

	gsap.registerPlugin(ScrollTrigger);

	var header = document.querySelector('header');
	var layers = Array.prototype.slice.call(hero.querySelectorAll('[data-z]'));
	var copy = document.getElementById('hero-copy');
	var planeScroll = document.getElementById('hero-plane-scroll');
	var planePointer = document.getElementById('hero-plane-pointer');
	var near = document.getElementById('hero-near');
	var veil = document.getElementById('hero-veil');

	// Pose estática de profundidade (z + contra-escala). Usada tanto no modo
	// reduced-motion quanto como estado inicial antes da timeline animar.
	function applyStaticPose() {
		var P = parseFloat(getComputedStyle(hero).perspective) || 1200;
		layers.forEach(function (el) {
			var z = parseFloat(el.dataset.z) || 0;
			gsap.set(el, { z: z, scale: (P - z) / P, transformOrigin: '50% 50%', force3D: true });
		});
		return P;
	}

	var reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
	var teardown = null;

	function boot() {
		if (teardown) {
			teardown();
			teardown = null;
		}

		if (reduceMotionMQ.matches) {
			// Cena estática, com profundidade visível, mas sem ScrollTrigger,
			// sem pin, sem Lenis (scroll suave já é movimento) e sem listeners
			// de ponteiro.
			applyStaticPose();
			return;
		}

		try {
			teardown = bootFull();
		} catch (err) {
			// Nunca deixar o hero num estado quebrado por causa de uma falha
			// aqui — cai para a pose estática e avisa no console, em vez de
			// deixar a página com camadas sem posição alguma.
			console.error('[hero.js] falha ao montar o parallax do hero:', err);
			applyStaticPose();
			teardown = null;
		}
	}

	function bootFull() {
		var LenisCtor = (window.Lenis && window.Lenis.default) || window.Lenis;
		var lenis = new LenisCtor({
			duration: 1.05,
			easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
			smoothWheel: true,
			autoRaf: false, // gsap.ticker dirige o raf — um único loop na página
		});

		function onLenisScroll() { ScrollTrigger.update(); }
		lenis.on('scroll', onLenisScroll);

		function tickerFn(time) { lenis.raf(time * 1000); }
		gsap.ticker.add(tickerFn);
		gsap.ticker.lagSmoothing(0);

		ScrollTrigger.config({ ignoreMobileResize: true });

		function onOrientationChange() {
			setTimeout(function () { ScrollTrigger.refresh(); }, 250);
		}
		window.addEventListener('orientationchange', onOrientationChange);

		var mm = gsap.matchMedia();

		mm.add(
			{
				isDesktop: '(min-width: 1024px)',
				isMobile: '(max-width: 639.98px)',
				isShort: '(max-height: 640px)',
				fine: '(pointer: fine)',
			},
			function (ctx) {
				var c = ctx.conditions;

				hero.style.setProperty('--hero-persp', c.isMobile ? '760px' : c.isDesktop ? '1200px' : '980px');
				hero.style.perspectiveOrigin = c.isMobile ? '50% 64%' : '50% 55%';

				applyStaticPose();

				var headerH = header ? header.offsetHeight : 0;
				var endLen = c.isShort ? '+=80%' : c.isMobile ? '+=90%' : '+=110%';
				var speedScale = c.isMobile ? 0.65 : 1;
				var liftY = c.isShort ? -50 : -90;
				function travel() { return window.innerHeight; }

				var tl = gsap.timeline({
					scrollTrigger: {
						trigger: hero,
						start: function () { return 'top top+=' + headerH; },
						end: endLen,
						pin: true,
						pinSpacing: true,
						anticipatePin: 1,
						scrub: 0.6,
						invalidateOnRefresh: true,
						onToggle: function (self) { hero.classList.toggle('is-live', self.isActive); },
						onUpdate: function (self) {
							// Belt-and-braces de foco: além do autoAlpha, tira o
							// #hero-copy da árvore de interação assim que ele já
							// está bem apagado, para o Tab não parar em CTA invisível.
							if (copy) copy.inert = self.progress > 0.5;
						},
					},
				});

				// Bandas de céu e de nuvem da frente: sobem e avançam em z
				// (o avanço em z é o "crescer" da referência, de graça via
				// perspectiva — ver a tabela de profundidades do plano).
				layers.forEach(function (el) {
					if (el.id === 'hero-plane-layer') return; // o avião tem beat próprio, abaixo
					var speed = parseFloat(el.dataset.speed) || 0;
					var push = parseFloat(el.dataset.push) || 0;
					var z0 = parseFloat(el.dataset.z) || 0;
					tl.to(el, {
						y: function () { return -travel() * speed * speedScale; },
						z: z0 + push,
						ease: 'none',
						duration: 1,
					}, 0);
				});

				// Headline: sobe pouco e some na primeira metade do scrub.
				// autoAlpha (não opacity) já tira os CTAs do tab order sozinho.
				if (copy) {
					tl.to(copy, { y: liftY, autoAlpha: 0, ease: 'power1.in', duration: 0.5 }, 0);
				}

				// Avião: sobe, ganha bank (rotationZ) e pitch (rotationX) reais em
				// 3D, avança em z, e some perto do fim — só ele reage ao scroll
				// aqui; o yaw do ponteiro mora num elo separado (#hero-plane-pointer)
				// para nunca escrever a mesma propriedade no mesmo elemento.
				if (planeScroll) {
					tl.to(planeScroll, {
						y: function () { return -travel() * 0.45 * speedScale; },
						rotationZ: -14,
						rotationX: 8,
						z: 60,
						ease: 'none',
						duration: 0.8,
					}, 0).to(planeScroll, { autoAlpha: 0, duration: 0.2 }, 0.72);
				}

				// Banda mais próxima: engole a viewport nos últimos ~30% do scrub.
				if (near) {
					tl.to(near, {
						z: 320 + 520,
						y: function () { return -travel() * 1.35 * speedScale; },
						ease: 'power2.in',
						duration: 1,
					}, 0);
				}

				// Véu final: fecha o hero em navy sólido, entregando a emenda
				// (a div navy->transparente logo depois de </section>) para a
				// seção "Em destaque" sem corte seco.
				if (veil) {
					tl.to(veil, { opacity: 1, ease: 'power2.in', duration: 0.28 }, 0.72);
				}

				// Yaw do avião pelo ponteiro — só em dispositivos com ponteiro fino.
				// Eixos deliberadamente separados do scroll: rotationZ/rotationX
				// (bank/pitch) pertencem ao scroll em #hero-plane-scroll; aqui é
				// só rotationY (yaw) + um leve x, em #hero-plane-pointer.
				var pointerCleanup = null;
				if (c.fine && planePointer) {
					var rotY = gsap.quickTo(planePointer, 'rotationY', { duration: 0.7, ease: 'power3' });
					var rotX = gsap.quickTo(planePointer, 'rotationX', { duration: 0.7, ease: 'power3' });
					var posX = gsap.quickTo(planePointer, 'x', { duration: 0.9, ease: 'power3' });

					var onMove = function (e) {
						var r = hero.getBoundingClientRect();
						var nx = (e.clientX - r.left) / r.width - 0.5;
						var ny = (e.clientY - r.top) / r.height - 0.5;
						rotY(nx * 18);
						rotX(ny * -12);
						posX(nx * 26);
					};
					var onLeave = function () { rotY(0); rotX(0); posX(0); };

					hero.addEventListener('pointermove', onMove, { passive: true });
					hero.addEventListener('pointerleave', onLeave, { passive: true });

					pointerCleanup = function () {
						hero.removeEventListener('pointermove', onMove);
						hero.removeEventListener('pointerleave', onLeave);
					};
				}

				// gsap.matchMedia reverte tudo que foi criado aqui (tweens,
				// gsap.set, o próprio ScrollTrigger) quando a query deixa de
				// bater — este retorno só limpa o que matchMedia não sabe
				// reverter sozinho (a variável CSS e os listeners de ponteiro).
				return function () {
					hero.style.removeProperty('--hero-persp');
					hero.style.perspectiveOrigin = '';
					if (copy) copy.inert = false;
					if (pointerCleanup) pointerCleanup();
				};
			}
		);

		// Polimento: "Em destaque" entra suave ao aproximar do fim do hero —
		// é a intenção que o antigo IntersectionObserver de #models-section
		// tinha (esse elemento nunca existiu), agora numa seção real.
		var highlightsTitle = document.getElementById('highlights-title');
		var highlightsSection = highlightsTitle && highlightsTitle.closest('section');
		var highlightsTrigger = null;
		if (highlightsSection) {
			highlightsTrigger = gsap.from(highlightsSection, {
				y: 40,
				autoAlpha: 0,
				ease: 'power2.out',
				duration: 0.6,
				scrollTrigger: { trigger: highlightsSection, start: 'top 85%' },
			}).scrollTrigger;
		}

		return function teardown() {
			mm.kill();
			if (highlightsTrigger) highlightsTrigger.kill();
			window.removeEventListener('orientationchange', onOrientationChange);
			gsap.ticker.remove(tickerFn);
			lenis.off('scroll', onLenisScroll);
			lenis.destroy();
			hero.classList.remove('is-live');
			if (copy) copy.inert = false;
		};
	}

	if (reduceMotionMQ.addEventListener) {
		reduceMotionMQ.addEventListener('change', boot);
	} else if (reduceMotionMQ.addListener) {
		// Safari antigo
		reduceMotionMQ.addListener(boot);
	}

	boot();
})();
