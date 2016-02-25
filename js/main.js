var nav = document.querySelector('#nav'),
	cover = document.querySelector('#cover'),

	// Team section
	team = document.querySelector('#team'),
	teamHeader = team.querySelector('h2'),
	teamHeaderY = {
		min: -teamHeader.clientHeight,
		max: 0,
		active: 50,
		current: 0,
	},
	names = team.querySelectorAll('li'),

	// Display calculation constants
	WINDOW_HEIGHT = 0,
	HALF_WINDOW_HEIGHT = 0,
	TEAM_HEIGHT = team.clientHeight;

function windowResize(ev) {
	WINDOW_HEIGHT = window.innerHeight;
	HALF_WINDOW_HEIGHT = WINDOW_HEIGHT / 2;
	teamHeaderY.max = WINDOW_HEIGHT + Math.abs(teamHeaderY.min);
}
window.addEventListener('resize', windowResize);
windowResize();

function windowScroll(ev) {
	var scrollTop = ev === undefined ? window.scrollY : ev.target.scrollingElement.scrollTop;

	// Set nav opacity
	nav.style.opacity = Math.min(1, scrollTop / WINDOW_HEIGHT);

	// Determine what is the active section
	var newActive = null,
		oldActive = document.querySelector('.splash.active');

	if (oldActive !== null) {
		oldActive.classList.remove('active');
	}
	if (scrollTop < WINDOW_HEIGHT) {
		newActive = cover;
		history.replaceState({}, '', '/');
	} else if (scrollTop >= WINDOW_HEIGHT && scrollTop < WINDOW_HEIGHT + TEAM_HEIGHT) {
		newActive = team;
		history.replaceState({}, '', '#team');
	}

	if (newActive === oldActive) {
		return;
	}
	if (newActive !== null) {
		newActive.classList.add('active');
	}

	// Do Team title
	if (newActive === team) {
		teamHeader.style.opacity = 1;
		teamHeader.style.top = teamHeaderY.active+'px';
	} else if (newActive === cover && scrollTop > HALF_WINDOW_HEIGHT) {
		var opacity = (scrollTop - HALF_WINDOW_HEIGHT) / HALF_WINDOW_HEIGHT;
		teamHeader.style.opacity = opacity;
		teamHeader.style.top = teamHeaderY.max - ((teamHeaderY.max - teamHeaderY.active) * opacity)+'px';
	} else {
		teamHeader.style.opacity = 0;
		teamHeader.style.top = teamHeaderY.max+'px';
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
