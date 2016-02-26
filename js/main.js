var nav = document.querySelector('#nav'),
	cover = document.querySelector('#cover'),

	// Team section
	team = document.querySelector('#team'),
	teamNames = team.querySelectorAll('li'),
	teamHeader = team.querySelector('h2'),
	teamHeaderY = {
		min: -teamHeader.clientHeight,
		max: 0,
		active: 100,
		current: 0,
	},

	// Display calculation constants
	WINDOW_WIDTH = 0,
	WINDOW_HEIGHT = 0,
	HALF_WINDOW_HEIGHT = 0,
	TEAM_HEIGHT = team.clientHeight;

function windowResize(ev) {
	WINDOW_WIDTH = window.innerWidth;
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

		var relativeTop = (scrollTop - WINDOW_HEIGHT) / (TEAM_HEIGHT - WINDOW_HEIGHT);
		for (var i = 0, l = ANIM.team.length; i < l; i++) {
			for (var j = 0, k = ANIM.team[i].length; j < k; j++) {
				if (relativeTop >= ANIM.team[i][j].time[0] && relativeTop < ANIM.team[i][j].time[1]) {
					setAnimPosition(teamNames[i], ANIM.team[i][j], relativeTop);
				}
			}
		}
	} else if (newActive === cover) {
		if (scrollTop > HALF_WINDOW_HEIGHT) {
			var opacity = (scrollTop - HALF_WINDOW_HEIGHT) / HALF_WINDOW_HEIGHT;
			teamHeader.style.opacity = opacity;
			teamHeader.style.top = teamHeaderY.max - ((teamHeaderY.max - teamHeaderY.active) * opacity)+'px';
		} else {
			teamHeader.style.opacity = 0;
			teamHeader.style.top = teamHeaderY.max+'px';
		}
		for (var i = 0, l = ANIM.team.length; i < l; i++) {
			setAnimPosition(teamNames[i], ANIM.team[i][0], 0);
		}
	} else {
		teamHeader.style.opacity = 0;
		teamHeader.style.top = teamHeaderY.min+'px';
		for (var i = 0, l = ANIM.team.length; i < l; i++) {
			setAnimPosition(teamNames[i], ANIM.team[i][ANIM.team[i].length - 1], 1);
		}
	}
}
window.addEventListener('scroll', windowScroll);
windowScroll();

function setAnimPosition(elem, item, progress) {
	var relativeTime = (progress - item.time[0]) / (item.time[1] - item.time[0]),
		scaledDiff = [
			(item.end[0] - item.start[0]) * relativeTime,
			(item.end[1] - item.start[1]) * relativeTime,
		];
	elem.style.left = ((item.start[0] + scaledDiff[0]) * WINDOW_WIDTH)+'px';
	elem.style.top = ((item.start[1] + scaledDiff[1]) * WINDOW_HEIGHT)+'px';
}
