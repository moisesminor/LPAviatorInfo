// Hero 3D para mobile — avião interativo no lugar do vídeo com scrub de scroll.
//
// Abaixo de 768px o js/hero.js não monta o efeito de scroll no vídeo (fica
// pesado e desajeitado em tela pequena). Este script coloca no mesmo #hero,
// atrás do texto já existente, um modelo de um KC-46 Pegasus (Boeing 767-2C
// da U.S. Air Force) reconstruído SÓ EM CÓDIGO com primitivas do Three.js —
// no espírito da lib img2threejs: nada de .glb, nada de download de malha.
//
// O usuário arrasta para girar; sem interação ele gira devagar sozinho e
// flutua de leve. Respeita prefers-reduced-motion (fica parado, mas ainda
// arrastável) e pausa a renderização quando sai da tela.
//
// O Three.js (vendor/three.min.js, UMD, global `THREE`) é carregado sob
// demanda — telas grandes nunca baixam esse arquivo.
//
// Fica na raiz de js/ (não numa subpasta) pelo mesmo motivo do hero.js: o
// tailwind.config.js só escaneia `./js/**/*.js`.
(function () {
	'use strict';

	var host = document.getElementById('hero-aircraft');
	var heroSection = document.getElementById('hero');
	if (!host || !heroSection) return;

	var fallbackImg = host.querySelector('img');
	var etherHost = document.getElementById('hero-ether');
	var mobileMQ = window.matchMedia('(max-width: 767.98px)');
	var reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

	// Cores do fundo liquid ether = paleta do site (azul-profundo -> azul do
	// header -> azul-céu do destaque). A intensidade da cor segue a velocidade
	// do fluido, então os rastros ficam mais claros conforme se movem.
	var ETHER_COLORS = ['#173f91', '#1e56c9', '#4b95f5', '#7dd3fc'];

	// Base para achar vendor/three.min.js a partir da URL deste próprio script,
	// então funciona mesmo se a página que o inclui estiver numa subpasta.
	var THREE_URL = (function () {
		var s = document.currentScript;
		var src = s && s.src ? s.src : '';
		try {
			return new URL('../vendor/three.min.js', src).href;
		} catch (e) {
			return './vendor/three.min.js';
		}
	})();

	var threePromise = null;
	function loadThree() {
		if (window.THREE) return Promise.resolve(window.THREE);
		if (threePromise) return threePromise;
		threePromise = new Promise(function (resolve, reject) {
			var tag = document.createElement('script');
			tag.src = THREE_URL;
			tag.async = true;
			tag.onload = function () {
				window.THREE ? resolve(window.THREE) : reject(new Error('THREE ausente após carregar'));
			};
			tag.onerror = function () { reject(new Error('falha ao carregar ' + THREE_URL)); };
			document.head.appendChild(tag);
		});
		return threePromise;
	}

	var scene = null;      // objeto com dispose(), resize(), setReducedMotion()
	var ether = null;      // fundo liquid ether (objeto com dispose())
	var building = false;
	var gen = 0;           // invalida um loadThree() em andamento se o estado mudar no meio

	function startEther(THREE) {
		if (ether || !etherHost || typeof window.createLiquidEther !== 'function') return;
		if (reduceMotionMQ.matches) return;   // fundo animado é decorativo — pula com motion reduzido
		etherHost.hidden = false;
		try {
			ether = window.createLiquidEther(etherHost, {
				colors: ETHER_COLORS,
				resolution: 0.45,      // FBO da simulação a 45% da tela — leve no mobile
				iterationsPoisson: 24,
				autoDemo: true,        // fluido deriva sozinho quando ninguém toca
				autoSpeed: 0.5,
				autoIntensity: 2.2,
				autoResumeDelay: 800,
				cursorSize: 110,       // pluma mais larga, cobre mais área
				mouseForce: 22
			});
		} catch (err) {
			console.warn('[hero-aircraft] liquid ether falhou:', err);
			etherHost.hidden = true;
		}
	}

	function stopEther() {
		if (ether) { try { ether.dispose(); } catch (e) {} ether = null; }
		if (etherHost) etherHost.hidden = true;
	}

	function activate() {
		if (scene || building) return;
		building = true;
		var myGen = ++gen;
		host.hidden = false;
		heroSection.classList.add('aircraft-live');

		loadThree().then(function (THREE) {
			building = false;
			if (myGen !== gen || !mobileMQ.matches) return;
			startEther(THREE);
			try {
				scene = createScene(THREE, host);
			} catch (err) {
				console.error('[hero-aircraft] falha ao montar a cena 3D:', err);
				showFallback();
			}
		}).catch(function (err) {
			building = false;
			if (myGen !== gen) return;
			console.warn('[hero-aircraft] ' + err.message + ' — usando imagem estática.');
			showFallback();
		});
	}

	function deactivate() {
		gen++;
		building = false;
		heroSection.classList.remove('aircraft-live');
		if (scene) { scene.dispose(); scene = null; }
		stopEther();
		if (fallbackImg) fallbackImg.hidden = true;
		host.hidden = true;
	}

	function showFallback() {
		if (fallbackImg) fallbackImg.hidden = false;
		host.hidden = false;
		// mantém aircraft-live: o texto continua com sombra e o gradiente clareado
	}

	function handleChange() {
		if (mobileMQ.matches) activate();
		else deactivate();
	}

	function onReduceMotionChange() {
		if (scene) scene.setReducedMotion(reduceMotionMQ.matches);
		if (!mobileMQ.matches) return;
		if (reduceMotionMQ.matches) stopEther();
		else if (window.THREE) startEther(window.THREE);
	}

	if (mobileMQ.addEventListener) {
		mobileMQ.addEventListener('change', handleChange);
		reduceMotionMQ.addEventListener('change', onReduceMotionChange);
	} else if (mobileMQ.addListener) {
		mobileMQ.addListener(handleChange);
		reduceMotionMQ.addListener(onReduceMotionChange);
	}

	handleChange();

	// ------------------------------------------------------------------
	// Cena
	// ------------------------------------------------------------------
	function createScene(THREE, container) {
		var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
		renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.15;
		container.insertBefore(renderer.domElement, container.firstChild);

		var w = container.clientWidth || window.innerWidth;
		var h = container.clientHeight || window.innerHeight;
		renderer.setSize(w, h, false);

		var world = new THREE.Scene();

		var camera = new THREE.PerspectiveCamera(46, w / h, 0.1, 100);
		positionCamera(camera, w / h);

		// Luz — céu frio + rebote quente do deserto, key branca morna vinda de
		// cima à direita como na foto de referência, com fill fria e rim atrás.
		var hemi = new THREE.HemisphereLight(0xd4dded, 0xa07a55, 1.35);
		world.add(hemi);
		var key = new THREE.DirectionalLight(0xfff2e2, 3.3);
		key.position.set(6, 7, 4);
		world.add(key);
		var fill = new THREE.DirectionalLight(0xa6bcda, 1.05);
		fill.position.set(-5, 1, 3);
		world.add(fill);
		var rim = new THREE.DirectionalLight(0xbcd0f0, 1.1);
		rim.position.set(-2, 3, -6);
		world.add(rim);

		var pivot = new THREE.Group();       // gira / flutua
		world.add(pivot);
		var plane = buildAircraft(THREE);    // com a inclinação (bank) própria
		pivot.add(plane);

		// Estado de interação
		var REST_PITCH = -0.2;
		var targetYaw = -1.05;   // 3/4 de frente, nariz voltado para a câmera
		var curYaw = targetYaw;
		var targetPitch = REST_PITCH;   // levemente por cima, como na foto de referência
		var curPitch = targetPitch;
		var yawVel = 0;
		var dragging = false;
		var lastX = 0, lastY = 0;
		var lastMove = performance.now();   // giro automático começa ~2,5s depois disto
		var reduced = reduceMotionMQ.matches;
		var running = true;
		var raf = 0;
		var clock = new THREE.Clock();

		var dom = renderer.domElement;
		dom.style.cursor = 'grab';

		var downX = 0, downY = 0, axis = 0;   // axis: 0 indefinido, 1 girar, -1 rolar página
		function onDown(e) {
			dragging = true;
			axis = 0;
			var p = point(e);
			lastX = downX = p.x; lastY = downY = p.y;
			yawVel = 0;
			tick();   // acorda o loop se ele tiver adormecido (reduced motion parado)
		}
		function onMove(e) {
			if (!dragging) return;
			var p = point(e);
			var dx = p.x - lastX;
			var dy = p.y - lastY;
			lastX = p.x; lastY = p.y;

			if (axis === 0) {
				var tx = Math.abs(p.x - downX);
				var ty = Math.abs(p.y - downY);
				if (tx < 6 && ty < 6) return;
				axis = tx >= ty ? 1 : -1;
				if (axis === 1) {
					dom.style.cursor = 'grabbing';
					if (dom.setPointerCapture && e.pointerId != null) {
						try { dom.setPointerCapture(e.pointerId); } catch (err) {}
					}
				} else {
					// gesto vertical: é rolagem de página, larga o controle
					dragging = false;
					return;
				}
			}
			if (axis !== 1) return;

			targetYaw += dx * 0.006;
			targetPitch = clamp(targetPitch + dy * 0.003, -0.5, 0.32);
			yawVel = dx * 0.006;
			lastMove = performance.now();
		}
		function onUp(e) {
			if (!dragging && axis !== 1) { axis = 0; return; }
			dragging = false;
			axis = 0;
			dom.style.cursor = 'grab';
			lastMove = performance.now();
			if (dom.releasePointerCapture && e && e.pointerId != null) {
				try { dom.releasePointerCapture(e.pointerId); } catch (err) {}
			}
		}
		function point(e) {
			if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
			return { x: e.clientX, y: e.clientY };
		}

		if (window.PointerEvent) {
			dom.addEventListener('pointerdown', onDown);
			window.addEventListener('pointermove', onMove);
			window.addEventListener('pointerup', onUp);
			window.addEventListener('pointercancel', onUp);
		} else {
			dom.addEventListener('touchstart', onDown, { passive: true });
			window.addEventListener('touchmove', onMove, { passive: true });
			window.addEventListener('touchend', onUp);
			dom.addEventListener('mousedown', onDown);
			window.addEventListener('mousemove', onMove);
			window.addEventListener('mouseup', onUp);
		}

		// Pausa quando o hero sai da tela / aba em segundo plano
		var io = new IntersectionObserver(function (entries) {
			running = entries[0].isIntersecting && !document.hidden;
			if (running) tick();
		}, { threshold: 0.02 });
		io.observe(container);
		function onVis() {
			running = !document.hidden && isOnScreen(container);
			if (running) tick();
		}
		document.addEventListener('visibilitychange', onVis);

		var ro = null;
		if (window.ResizeObserver) {
			ro = new ResizeObserver(resize);
			ro.observe(container);
		} else {
			window.addEventListener('resize', resize);
		}

		function resize() {
			var cw = container.clientWidth;
			var ch = container.clientHeight;
			if (!cw || !ch) return;
			renderer.setSize(cw, ch, false);
			camera.aspect = cw / ch;
			positionCamera(camera, cw / ch);
			camera.updateProjectionMatrix();
			if (!running) renderer.render(world, camera);
		}

		function tick() {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(tick);
			var dt = Math.min(clock.getDelta(), 0.05);
			var idleMs = performance.now() - lastMove;

			if (!dragging) {
				// inércia do arrasto
				targetYaw += yawVel;
				yawVel *= 0.94;
				if (Math.abs(yawVel) < 0.00002) yawVel = 0;
				// giro automático lento depois de ~2,5s parado (se motion permitido)
				if (!reduced && idleMs > 2500 && yawVel === 0) targetYaw += dt * 0.16;
				// pitch volta devagar ao repouso
				targetPitch += (REST_PITCH - targetPitch) * Math.min(1, dt * 1.5);
			}

			curYaw += (targetYaw - curYaw) * Math.min(1, dt * 6);
			curPitch += (targetPitch - curPitch) * Math.min(1, dt * 6);
			pivot.rotation.y = curYaw;
			pivot.rotation.x = curPitch;

			if (!reduced) {
				var t = clock.elapsedTime;
				pivot.position.y = Math.sin(t * 0.7) * 0.12;
				pivot.rotation.z = Math.sin(t * 0.45) * 0.03;
			} else {
				pivot.position.y = 0;
				pivot.rotation.z = 0;
			}

			renderer.render(world, camera);

			// Com movimento reduzido e nada acontecendo, para de agendar quadros
			// (economia de bateria) — onDown()/setReducedMotion religam o loop.
			var settled = Math.abs(targetYaw - curYaw) < 1e-4 && Math.abs(targetPitch - curPitch) < 1e-4;
			if (!running || (reduced && !dragging && yawVel === 0 && settled)) cancelAnimationFrame(raf);
		}

		tick();

		return {
			setReducedMotion: function (v) { reduced = v; if (running) tick(); },
			dispose: function () {
				cancelAnimationFrame(raf);
				running = false;
				io.disconnect();
				if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
				document.removeEventListener('visibilitychange', onVis);
				if (window.PointerEvent) {
					dom.removeEventListener('pointerdown', onDown);
					window.removeEventListener('pointermove', onMove);
					window.removeEventListener('pointerup', onUp);
					window.removeEventListener('pointercancel', onUp);
				} else {
					dom.removeEventListener('touchstart', onDown);
					window.removeEventListener('touchmove', onMove);
					window.removeEventListener('touchend', onUp);
					dom.removeEventListener('mousedown', onDown);
					window.removeEventListener('mousemove', onMove);
					window.removeEventListener('mouseup', onUp);
				}
				world.traverse(function (obj) {
					if (obj.geometry) obj.geometry.dispose();
					if (obj.material) {
						var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
						mats.forEach(function (m) {
							for (var k in m) { if (m[k] && m[k].isTexture) m[k].dispose(); }
							m.dispose();
						});
					}
				});
				renderer.dispose();
				if (dom.parentNode) dom.parentNode.removeChild(dom);
			}
		};
	}

	function positionCamera(camera, aspect) {
		// O avião tem uma faixa só dele (~metade de cima do hero, quase quadrada).
		// Afasta o bastante para caber inteiro com folga; mira um pouco abaixo do
		// centro para dar espaço acima da fuselagem.
		var dist = aspect < 0.7 ? 21 : aspect < 1.05 ? 17.5 : aspect < 1.6 ? 14 : 12;
		camera.position.set(0.5, 2.5, dist);
		camera.lookAt(0, 0.05, 0);
	}

	function isOnScreen(el) {
		var r = el.getBoundingClientRect();
		return r.bottom > 0 && r.top < (window.innerHeight || 0);
	}

	function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

	// ------------------------------------------------------------------
	// Modelo do avião — só primitivas, tudo procedural e determinístico.
	// Eixos: +X = nariz (frente), +Y = cima, +Z = asa direita.
	// Fuselagem ~10 unidades; proporções aproximadas de um Boeing 767-2C.
	// ------------------------------------------------------------------
	function buildAircraft(THREE) {
		var L = 10;

		var paint = new THREE.MeshStandardMaterial({ color: 0x949ba6, roughness: 0.58, metalness: 0.18 });
		var panel = new THREE.MeshStandardMaterial({ color: 0x8f97a2, roughness: 0.6, metalness: 0.16, side: THREE.DoubleSide });
		var nacelleMat = new THREE.MeshStandardMaterial({ color: 0xa9b0ba, roughness: 0.4, metalness: 0.35 });
		var darkMetal = new THREE.MeshStandardMaterial({ color: 0x5c646e, roughness: 0.55, metalness: 0.3 });
		var intakeMat = new THREE.MeshStandardMaterial({ color: 0x14171b, roughness: 0.85, metalness: 0.1 });
		var radome = new THREE.MeshStandardMaterial({ color: 0x6d7681, roughness: 0.62, metalness: 0.12 });
		var glass = new THREE.MeshStandardMaterial({ color: 0x0c1118, roughness: 0.16, metalness: 0.45 });
		var antiGlare = new THREE.MeshStandardMaterial({ color: 0x2b3037, roughness: 0.72, metalness: 0.1 });

		var plane = new THREE.Group();
		plane.name = 'KC46';

		// ---- Fuselagem: LatheGeometry a partir de um perfil de raio ----
		// O perfil vai do nariz (t=0) até ~88% do corpo; o resto da cauda é uma
		// seção própria, levemente empinada para cima (upsweep), como num airliner.
		var noseX = L * 0.52;                 // x do nariz depois da transformação
		var prof = [
			[0.00, 0.012], [0.015, 0.13], [0.04, 0.26], [0.09, 0.40], [0.15, 0.49],
			[0.20, 0.52], [0.66, 0.52], [0.78, 0.50], [0.86, 0.44], [0.90, 0.34]
		];
		var pts = prof.map(function (p) { return new THREE.Vector2(Math.max(p[1], 0.001), p[0] * L); });
		var fuseGeo = new THREE.LatheGeometry(pts, 44);
		var fuselage = new THREE.Mesh(fuseGeo, paint);
		// eixo do lathe = Y; rotação +90° em Z leva (0,y) -> (-y,0): nariz (y=0)
		// vai para x=0 e a cauda para x=-L. Recentra deslocando +X.
		fuselage.rotation.z = Math.PI / 2;
		fuselage.position.x = noseX;
		plane.add(fuselage);

		// radome no bico
		var nose = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), radome);
		nose.position.x = noseX + 0.02;
		plane.add(nose);

		// seção de cauda com upsweep
		var tailJoinX = noseX - 0.90 * L;     // x onde o perfil terminou (~ -3.8)
		var tailGroup = new THREE.Group();
		tailGroup.position.set(tailJoinX, 0, 0);
		tailGroup.rotation.z = -0.13;          // empina a ponta da cauda para cima
		plane.add(tailGroup);
		var tailCone = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.34, 2.1, 26), paint);
		tailCone.rotation.z = Math.PI / 2;     // eixo -> X; topo estreito para -X
		tailCone.position.x = -1.05;
		tailGroup.add(tailCone);

		// carenagem do boom de reabastecimento sob a cauda (marca do KC-46)
		var boom = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 1.5, 6, 12), darkMetal);
		boom.rotation.z = Math.PI / 2 - 0.12;
		boom.position.set(tailJoinX - 0.75, -0.28, 0);
		plane.add(boom);

		// ---- Cockpit ----
		var windshield = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.24, 0.62), glass);
		windshield.position.set(noseX - 0.85, 0.33, 0);
		windshield.rotation.z = -0.16;
		plane.add(windshield);
		var glareShield = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.56), antiGlare);
		glareShield.position.set(noseX - 0.6, 0.4, 0);
		glareShield.rotation.z = -0.22;
		plane.add(glareShield);

		// ---- Faixa de janelas da cabine (impressão, não janela a janela) ----
		[-1, 1].forEach(function (s) {
			var strip = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.07, 0.015), glass);
			strip.position.set(0.8, 0.14, s * 0.505);
			plane.add(strip);
		});

		// ---- Asas ----
		var wingShapePts = [
			[0.95, 0.0], [0.10, 3.35], [-0.42, 4.15], [-0.92, 4.15], [-0.58, 3.35], [-1.55, 0.0]
		];
		var wingShape = new THREE.Shape();
		wingShape.moveTo(wingShapePts[0][0], wingShapePts[0][1]);
		for (var i = 1; i < wingShapePts.length; i++) wingShape.lineTo(wingShapePts[i][0], wingShapePts[i][1]);
		wingShape.closePath();
		var wingGeo = new THREE.ExtrudeGeometry(wingShape, {
			depth: 0.16, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.05, bevelSegments: 1, steps: 1
		});
		// shape (x=corda, y=envergadura) extrudado em +Z -> gira para corda=X,
		// envergadura=+Z, espessura=Y; recentra a espessura.
		wingGeo.rotateX(Math.PI / 2);
		wingGeo.translate(0, 0.09, 0);

		var rightWing = new THREE.Mesh(wingGeo, panel);
		rightWing.position.set(-0.35, -0.18, 0.42);
		rightWing.rotation.x = -0.085;   // diedro (asa direita, +Z: ponta para cima)
		plane.add(rightWing);
		var leftWing = rightWing.clone();
		leftWing.scale.z = -1;                     // espelha a geometria (material DoubleSide cobre o winding)
		leftWing.position.z = -rightWing.position.z; // ...e a posição, senão a raiz fica no lado errado
		leftWing.rotation.x = 0.085;               // diedro espelhado (senão vira anedro na esquerda)
		plane.add(leftWing);

		// ---- Empenagem vertical ----
		var finShape = shapeFrom(new THREE.Shape(), [
			[0.95, 0.0], [-0.95, 0.0], [-1.12, 1.75], [-0.28, 1.75]
		]);
		var finGeo = new THREE.ExtrudeGeometry(finShape, {
			depth: 0.13, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1, steps: 1
		});
		finGeo.translate(0, 0, -0.065);
		var fin = new THREE.Mesh(finGeo, panel);
		fin.position.set(-4.0, 0.55, 0);
		plane.add(fin);

		// ---- Estabilizadores horizontais ----
		var stabShape = shapeFrom(new THREE.Shape(), [
			[0.62, 0.0], [-0.18, 1.7], [-0.6, 1.7], [-0.88, 0.0]
		]);
		var stabGeo = new THREE.ExtrudeGeometry(stabShape, {
			depth: 0.1, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.03, bevelSegments: 1, steps: 1
		});
		stabGeo.rotateX(Math.PI / 2);
		stabGeo.translate(0, 0.05, 0);
		var rStab = new THREE.Mesh(stabGeo, panel);
		rStab.position.set(-4.5, 0.4, 0.14);
		rStab.rotation.x = -0.06;
		plane.add(rStab);
		var lStab = rStab.clone();
		lStab.scale.z = -1;
		lStab.position.z = -rStab.position.z;
		lStab.rotation.x = 0.06;
		plane.add(lStab);

		// ---- Motores ----
		var rightEngine = buildEngine(THREE, nacelleMat, intakeMat, darkMetal);
		rightEngine.position.set(0.55, -0.58, 1.9);
		plane.add(rightEngine);
		var leftEngine = rightEngine.clone();
		leftEngine.position.z = -1.9;
		plane.add(leftEngine);

		[-1, 1].forEach(function (s) {
			var pylon = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.13), panel);
			pylon.position.set(0.2, -0.3, s * 1.9);
			plane.add(pylon);
		});

		// ---- Livery: "U.S. AIR FORCE" + bandeirinha na cauda ----
		// Cartão plano no XY: normal +Z serve o lado direito; o esquerdo gira
		// 180° em Y (normal -Z) e o texto continua legível de fora.
		var titleTex = textTexture(THREE, 'U.S. AIR FORCE', 640, 120, '#20242b');
		[1, -1].forEach(function (s) {
			var decal = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.47), new THREE.MeshBasicMaterial({
				map: titleTex, transparent: true, depthWrite: false
			}));
			decal.position.set(1.7, 0.16, s * 0.53);
			decal.rotation.y = s > 0 ? 0 : Math.PI;
			plane.add(decal);
		});
		var flagTex = flagTexture(THREE);
		[1, -1].forEach(function (s) {
			var flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), new THREE.MeshBasicMaterial({
				map: flagTex, transparent: true, depthWrite: false
			}));
			flag.position.set(-4.35, 1.12, s * 0.08);
			flag.rotation.y = s > 0 ? 0 : Math.PI;
			plane.add(flag);
		});

		// inclinação de exibição, como na foto de referência
		plane.rotation.z = 0.14;
		plane.rotation.x = -0.03;

		return plane;
	}

	function shapeFrom(shape, pts) {
		shape.moveTo(pts[0][0], pts[0][1]);
		for (var i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
		shape.closePath();
		return shape;
	}

	function buildEngine(THREE, nacelleMat, intakeMat, darkMetal) {
		var e = new THREE.Group();
		var cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.27, 1.05, 26), nacelleMat);
		cowl.rotation.z = Math.PI / 2;
		e.add(cowl);
		var lip = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.05, 12, 26), nacelleMat);
		lip.rotation.y = Math.PI / 2;
		lip.position.x = 0.52;
		e.add(lip);
		var intake = new THREE.Mesh(new THREE.CircleGeometry(0.28, 26), intakeMat);
		intake.position.x = 0.5;
		intake.rotation.y = -Math.PI / 2;
		e.add(intake);
		var spinner = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 14), darkMetal);
		spinner.rotation.z = -Math.PI / 2;
		spinner.position.x = 0.56;
		e.add(spinner);
		var exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.15, 0.5, 22), darkMetal);
		exhaust.rotation.z = Math.PI / 2;
		exhaust.position.x = -0.64;
		e.add(exhaust);
		var plug = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.34, 16), intakeMat);
		plug.rotation.z = -Math.PI / 2;
		plug.position.x = -0.82;
		e.add(plug);
		return e;
	}

	function textTexture(THREE, text, w, h, color) {
		var c = document.createElement('canvas');
		c.width = w; c.height = h;
		var ctx = c.getContext('2d');
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = color;
		ctx.font = '700 ' + Math.round(h * 0.5) + 'px Ubuntu, Arial, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.letterSpacing = '2px';
		ctx.fillText(text, w / 2, h / 2 + 2);
		var tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.anisotropy = 4;
		return tex;
	}

	function flagTexture(THREE) {
		var c = document.createElement('canvas');
		c.width = 100; c.height = 60;
		var ctx = c.getContext('2d');
		for (var i = 0; i < 13; i++) {
			ctx.fillStyle = i % 2 === 0 ? '#b22234' : '#ffffff';
			ctx.fillRect(0, i * (60 / 13), 100, 60 / 13);
		}
		ctx.fillStyle = '#3c3b6e';
		ctx.fillRect(0, 0, 42, 32);
		ctx.fillStyle = '#ffffff';
		for (var r = 0; r < 5; r++) for (var col = 0; col < 5; col++) {
			ctx.fillRect(4 + col * 8, 3 + r * 6, 2, 2);
		}
		var tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;
		return tex;
	}
})();
