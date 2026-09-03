// Hero em vídeo dirigido por scroll: o avião pousando só avança quadro a
// quadro conforme a página rola — scroll pra baixo avança o vídeo, scroll
// pra cima volta (via GSAP ScrollTrigger com scrub, escrevendo direto em
// video.currentTime). A seção fica pinada durante esse trecho de scroll; a
// mensagem e os botões que já existiam no hero entram aos poucos, em pontos
// diferentes desse mesmo intervalo.
//
// Fica na raiz do repositório (não em uma subpasta) porque tailwind.config.js
// só escaneia `./*.js`.
(function () {
	'use strict';

	if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
		console.warn('[hero.js] gsap/ScrollTrigger não carregaram — hero em vídeo fica estático (sem scroll-scrub). Verifique se vendor/gsap.min.js e vendor/ScrollTrigger.min.js estão sendo servidos (Network tab) e dê um hard refresh (Ctrl+Shift+R) para descartar cache antigo.');
		return;
	}

	var hero = document.getElementById('hero');
	var video = document.getElementById('hero-video');
	if (!hero || !video) return;

	gsap.registerPlugin(ScrollTrigger);

	var header = document.querySelector('header');

	// Ordem de entrada do conteúdo ao longo do scroll — cada item soma seu
	// próprio ponto de partida (0-1) na timeline do scrub, feito mais abaixo.
	var revealSteps = [
		{ el: document.getElementById('hero-badge'), at: 0.04 },
		{ el: document.getElementById('home-title'), at: 0.16 },
		{ el: document.getElementById('hero-desc'), at: 0.32 },
		{ el: document.getElementById('hero-cta'), at: 0.48 },
	].filter(function (step) { return !!step.el; });

	var reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
	// Em celular o decodificador de vídeo não acompanha um seek a cada pixel
	// de scroll: os frames intermediários são descartados e só o primeiro e
	// o último quadro chegam a aparecer. Nesses aparelhos o vídeo toca normal
	// (play) em vez de ser scrubado por currentTime; só o texto continua
	// sincronizado com o scroll.
	var mobileMQ = window.matchMedia('(max-width: 768px)');
	var teardown = null;
	var metadataListenerAttached = false;

	function showStaticContent() {
		gsap.set(revealSteps.map(function (s) { return s.el; }), { clearProps: 'all' });
	}

	function boot() {
		if (teardown) {
			teardown();
			teardown = null;
		}

		if (reduceMotionMQ.matches) {
			// Sem pin, sem scrub: vídeo para num quadro fixo e todo o conteúdo
			// já visível, em vez de depender de scroll para aparecer.
			video.pause();
			showStaticContent();
			return;
		}

		// O scrub precisa da duration do vídeo, que só existe depois do
		// readyState >= HAVE_METADATA. Sem isso `duration` vem NaN.
		if (video.readyState >= 1) {
			teardown = bootFull();
		} else if (!metadataListenerAttached) {
			metadataListenerAttached = true;
			video.addEventListener('loadedmetadata', onMetadataLoaded);
		}
	}

	function onMetadataLoaded() {
		metadataListenerAttached = false;
		video.removeEventListener('loadedmetadata', onMetadataLoaded);
		if (!reduceMotionMQ.matches && !teardown) {
			teardown = bootFull();
		}
	}

	function bootFull() {
		try {
			return mountScrub();
		} catch (err) {
			// Nunca deixar o hero quebrado por causa de uma falha aqui — cai
			// para o conteúdo estático e avisa no console.
			console.error('[hero.js] falha ao montar o scroll-scrub do hero:', err);
			video.pause();
			showStaticContent();
			return null;
		}
	}

	function mountScrub() {
		var isMobile = mobileMQ.matches;

		video.pause();
		video.currentTime = 0;

		gsap.set(revealSteps.map(function (s) { return s.el; }), { autoAlpha: 0, y: 20 });

		function headerH() { return header ? header.offsetHeight : 0; }

		var tl = gsap.timeline({
			scrollTrigger: {
				trigger: hero,
				start: function () { return 'top top+=' + headerH(); },
				end: '+=250%',
				pin: true,
				pinSpacing: true,
				anticipatePin: 1,
				scrub: 0.4,
				invalidateOnRefresh: true,
				onToggle: function (self) {
					hero.classList.toggle('is-live', self.isActive);
					if (isMobile) {
						if (self.isActive) {
							video.currentTime = 0;
							video.play().catch(function () {});
						} else {
							video.pause();
						}
					}
				},
			},
		});

		// Playhead do vídeo: 0 -> duration ao longo de toda a timeline (posição
		// 0, duration 1 = "a timeline inteira"). ease 'none' é obrigatório aqui
		// — é o que garante 1 scroll pixel = 1 avanço proporcional de vídeo.
		// Em mobile o onUpdate fica de fora: essa tween só serve para manter a
		// duração/proporção da timeline igual (mesmo timing de revelação do
		// texto), o vídeo toca sozinho via play() no onToggle acima.
		var playhead = { t: 0 };
		tl.to(playhead, {
			t: video.duration || 1,
			ease: 'none',
			duration: 1,
			onUpdate: isMobile ? undefined : function () { video.currentTime = playhead.t; },
		}, 0);

		revealSteps.forEach(function (step) {
			tl.to(step.el, { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power1.out' }, step.at);
		});

		return function teardown() {
			if (tl.scrollTrigger) tl.scrollTrigger.kill();
			tl.kill();
			hero.classList.remove('is-live');
			video.pause();
			showStaticContent();
		};
	}

	if (reduceMotionMQ.addEventListener) {
		reduceMotionMQ.addEventListener('change', boot);
	} else if (reduceMotionMQ.addListener) {
		// Safari antigo
		reduceMotionMQ.addListener(boot);
	}

	if (mobileMQ.addEventListener) {
		mobileMQ.addEventListener('change', boot);
	} else if (mobileMQ.addListener) {
		mobileMQ.addListener(boot);
	}

	boot();
})();
