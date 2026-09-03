(function () {
	const toggle = document.getElementById('nav-toggle');
	const menu = document.getElementById('mobile-nav');
	const iconOpen = document.getElementById('nav-icon-open');
	const iconClose = document.getElementById('nav-icon-close');
	if (!toggle || !menu) return;

	function setOpen(open) {
		menu.classList.toggle('hidden', !open);
		menu.classList.toggle('flex', open);
		toggle.setAttribute('aria-expanded', String(open));
		toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
		if (iconOpen) iconOpen.classList.toggle('hidden', open);
		if (iconClose) iconClose.classList.toggle('hidden', !open);
	}

	toggle.addEventListener('click', () => {
		setOpen(menu.classList.contains('hidden'));
	});

	menu.addEventListener('click', (event) => {
		if (event.target.closest('a')) setOpen(false);
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') setOpen(false);
	});

	document.addEventListener('click', (event) => {
		if (menu.classList.contains('hidden')) return;
		if (menu.contains(event.target) || toggle.contains(event.target)) return;
		setOpen(false);
	});

	window.addEventListener('resize', () => {
		if (window.innerWidth >= 640) setOpen(false);
	});
})();
