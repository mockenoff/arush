var nav = document.querySelector('#nav'),
	cover = document.querySelector('#cover'),
	team = document.querySelector('#team'),

	// Team typography nodes
	names = team.querySelectorAll('li'),

	// Display calculation constants
	WINDOW_HEIGHT = 0,
	TEAM_HEIGHT = team.clientHeight;

function windowResize(ev) {
	WINDOW_HEIGHT = window.innerHeight;
}
window.addEventListener('resize', windowResize);
windowResize();

function windowScroll(ev) {
	var scrollTop = ev === undefined ? window.scrollY : ev.target.scrollingElement.scrollTop;

	// Set nav opacity
	nav.style.opacity = Math.min(1, scrollTop / WINDOW_HEIGHT);

	// Determine what is the active section
	var active = document.querySelector('.splash.active');
	if (active !== null) {
		active.classList.remove('active');
	}
	if (scrollTop < WINDOW_HEIGHT) {
		cover.classList.add('active');
		history.replaceState({}, '', '/');
	} else if (scrollTop >= WINDOW_HEIGHT && scrollTop < WINDOW_HEIGHT + TEAM_HEIGHT) {
		team.classList.add('active');
		history.replaceState({}, '', '#team');
	}
}
window.addEventListener('scroll', windowScroll);
windowScroll();

function hashChange(ev) {
	console.log('ASDF', ev);
	if (ev !== undefined) {
		ev.preventDefault();
		return false;
	}
}
window.addEventListener('hashchange', hashChange);
hashChange();
