var nav = document.querySelector('#nav'),
	cover = document.querySelector('#cover'),
	contact = document.querySelector('#contact'),

	// Team section
	team = document.querySelector('#team'),
	teamList = team.querySelector('ul'),
	teamNames = team.querySelectorAll('li'),
	teamHeader = team.querySelector('h2'),
	teamHeaderY = {
		min: -teamHeader.clientHeight,
		max: 0,
		active: 100,
		current: 0,
	},

	// Media section
	media = document.querySelector('#media'),
	gramList = media.querySelector('.gram-feed'),
	gramItems = [],
	gramTemplate = document.querySelector('#gram-template').innerHTML,
	tubeEmbed = media.querySelector('.embed-container'),
	tubeTemplate = document.querySelector('#tube-template').innerHTML,
	mediaHeader = media.querySelector('h2'),
	mediaHeaderY = {
		min: -mediaHeader.clientHeight,
		max: 0,
		active: 100,
		current: 0,
	},

	// Display calculation constants
	WINDOW_WIDTH = 0,
	WINDOW_HEIGHT = 0,
	HALF_WINDOW_HEIGHT = 0,
	COVER_HEIGHT = cover.clientHeight,
	TEAM_HEIGHT = team.clientHeight,
	MEDIA_HEIGHT = media.clientHeight,
	HALF_MEDIA_HEIGHT = 0,
	FEED_TOP = 0,
	CONTACT_HEIGHT = contact.clientHeight;

// Media templating
var innerHTML = '';
for (var i = 0, l = FEEDS.INSTAGRAM.length; i < l; i++) {
	innerHTML += gramTemplate.replace('{{link}}', FEEDS.INSTAGRAM[i].link).replace('{{image}}', FEEDS.INSTAGRAM[i].image);
}
gramList.innerHTML = innerHTML;
gramItems = gramList.querySelectorAll('li');
tubeEmbed.innerHTML = tubeTemplate.replace('{{youtube_id}}', FEEDS.YOUTUBE[0].youtube_id);

// Make image loads count as a resize since otherwise they don't have height
var images = gramList.querySelectorAll('img');
for (i = 0, l = images.length; i < l; i++) {
	images[i].addEventListener('load', function(ev) {
		windowResize();
	});
}

// Window resize
function windowResize(ev) {
	WINDOW_WIDTH = window.innerWidth;
	WINDOW_HEIGHT = window.innerHeight;
	HALF_WINDOW_HEIGHT = WINDOW_HEIGHT / 2;

	teamHeaderY.max = WINDOW_HEIGHT + Math.abs(teamHeaderY.min);
	mediaHeaderY.max = WINDOW_HEIGHT + Math.abs(mediaHeaderY.min);

	COVER_HEIGHT = WINDOW_HEIGHT;

	MEDIA_HEIGHT = media.clientHeight;
	HALF_MEDIA_HEIGHT = MEDIA_HEIGHT / 2;
	FEED_TOP = parseInt(getComputedStyle(gramList).marginTop.replace(/[\D]/g, ''), 10);

	CONTACT_HEIGHT = contact.clientHeight;
}
window.addEventListener('resize', windowResize);
windowResize();

// Window scroll
function windowScroll(ev) {
	var scrollTop = ev === undefined ? window.scrollY : ev.target.scrollingElement.scrollTop;

	// Set nav opacity
	nav.style.opacity = Math.min(1, scrollTop / COVER_HEIGHT);

	// Determine what is the active section
	var newActive = null,
		oldActive = document.querySelector('.splash.active');

	if (scrollTop < COVER_HEIGHT) {
		newActive = cover;
		history.replaceState({}, '', '/');
	} else if (scrollTop >= COVER_HEIGHT && scrollTop < COVER_HEIGHT + TEAM_HEIGHT) {
		newActive = team;
		history.replaceState({}, '', '#team');
	} else if (scrollTop >= COVER_HEIGHT + TEAM_HEIGHT && scrollTop < COVER_HEIGHT + TEAM_HEIGHT + MEDIA_HEIGHT) {
		newActive = media;
		history.replaceState({}, '', '#media');
	} else if (scrollTop >= COVER_HEIGHT + TEAM_HEIGHT + MEDIA_HEIGHT && scrollTop < COVER_HEIGHT + TEAM_HEIGHT + MEDIA_HEIGHT + CONTACT_HEIGHT) {
		newActive = contact;
		history.replaceState({}, '', '#contact');
	}

	if (newActive !== oldActive) {
		if (oldActive !== null) {
			oldActive.classList.remove('active');
		}
		if (newActive !== null) {
			newActive.classList.add('active');
		}
	}

	// Do Team things
	if (newActive === team) {
		var didSet = false,
			teamLength = ANIM.team.length,
			percentage = (TEAM_HEIGHT / (teamLength + 1)) / TEAM_HEIGHT,
			// Change to TEAM_HEIGHT - WINDOW_HEIGHT if Team section is the bottom
			relativeTop = (scrollTop - WINDOW_HEIGHT) / TEAM_HEIGHT;

		if (relativeTop < percentage * teamLength) {
			teamHeader.style.opacity = 1;
			teamHeader.style.top = teamHeaderY.active+'px';
		} else {
			var opacity = 1 - ((relativeTop - (percentage * teamLength)) / percentage);
			teamHeader.style.opacity = opacity;
			teamHeader.style.top = teamHeaderY.min - ((teamHeaderY.min - teamHeaderY.active) * opacity)+'px';
		}

		for (var i = 0; i < teamLength; i++) {
			didSet = false;
			for (var j = 0, k = ANIM.team[i].length; j < k; j++) {
				if (relativeTop >= ANIM.team[i][j].time[0] && relativeTop < ANIM.team[i][j].time[1]) {
					didSet = true;
					setAnimPosition(teamNames[i], ANIM.team[i][j], relativeTop);
				}
			}
			if (didSet === false) {
				if (relativeTop <= 0) {
					setAnimPosition(teamNames[i], ANIM.team[i][0], 0);
				} else {
					setAnimPosition(teamNames[i], ANIM.team[i][ANIM.team[i].length - 1], 1);
				}
				teamList.className = '';
			} else if (relativeTop >= (percentage * i) && relativeTop < Math.min((percentage * (i + 1)), (percentage * teamLength))) {
				teamList.className = 'active-'+i;
			}
		}
	} else if (newActive === cover) {
		teamList.className = '';
		if (scrollTop > HALF_WINDOW_HEIGHT) {
			var opacity = (scrollTop - HALF_WINDOW_HEIGHT) / HALF_WINDOW_HEIGHT;
			teamHeader.style.opacity = opacity;
			teamHeader.style.top = teamHeaderY.max - ((teamHeaderY.max - teamHeaderY.active) * opacity)+'px';
		} else {
			teamHeader.style.opacity = 0;
			teamHeader.style.top = teamHeaderY.max+'px';
		}
		if (oldActive !== cover) {
			for (var i = 0, l = ANIM.team.length; i < l; i++) {
				setAnimPosition(teamNames[i], ANIM.team[i][0], 0);
			}
		}
	} else {
		teamList.className = '';
		teamHeader.style.opacity = 0;
		teamHeader.style.top = teamHeaderY.min+'px';
		if (oldActive === team) {
			for (var i = 0, l = ANIM.team.length; i < l; i++) {
				setAnimPosition(teamNames[i], ANIM.team[i][ANIM.team[i].length - 1], 1);
			}
		}
	}

	// Do Media things
	if (newActive === media) {
		var mediaBorder = COVER_HEIGHT + TEAM_HEIGHT,
			relativeTop = (scrollTop - mediaBorder) / MEDIA_HEIGHT,
			scrollBorder = mediaBorder + HALF_MEDIA_HEIGHT;

		if (scrollTop < scrollBorder) {
			mediaHeader.style.opacity = 1;
			mediaHeader.style.top = mediaHeaderY.active+'px';
		} else {
			var opacity = 1 - ((scrollTop - scrollBorder) / HALF_MEDIA_HEIGHT);
			mediaHeader.style.opacity = opacity;
			mediaHeader.style.top = mediaHeaderY.min - ((mediaHeaderY.min - mediaHeaderY.active) * opacity)+'px';
		}

		for (var i = 0, l = gramItems.length; i < l; i++) {
			gramItems[i].style.top = ((-1 / ((i + 1) * 2)) * ((relativeTop * WINDOW_HEIGHT) + (scrollTop - mediaBorder)))+'px';
		}
	} else if (newActive === cover || newActive === team) {
		var mediaBorder = COVER_HEIGHT + TEAM_HEIGHT,
			relativeTop = (scrollTop - mediaBorder) / MEDIA_HEIGHT,
			scrollBorder = mediaBorder - HALF_MEDIA_HEIGHT;

		if (scrollTop > scrollBorder) {
			var opacity = (scrollTop - scrollBorder) / HALF_MEDIA_HEIGHT;
			mediaHeader.style.opacity = opacity;
			mediaHeader.style.top = mediaHeaderY.max - ((mediaHeaderY.max - mediaHeaderY.active) * opacity)+'px';
		} else {
			mediaHeader.style.opacity = 0;
			mediaHeader.style.top = mediaHeaderY.min+'px';
		}

		for (var i = 0, l = gramItems.length; i < l; i++) {
			gramItems[i].style.top = ((-1 / ((i + 1) * 2)) * ((relativeTop * WINDOW_HEIGHT) + (scrollTop - mediaBorder)))+'px';
		}
	} else {
		mediaHeader.style.opacity = 0;
		mediaHeader.style.top = mediaHeaderY.min+'px';
	}
}
window.addEventListener('scroll', windowScroll);
windowScroll();

// Set the position of an element according to its percentage progress
function setAnimPosition(elem, item, progress) {
	var relativeTime = (progress - item.time[0]) / (item.time[1] - item.time[0]),
		scaledDiff = [
			(item.end[0] - item.start[0]) * relativeTime,
			(item.end[1] - item.start[1]) * relativeTime,
		];
	elem.style.left = ((item.start[0] + scaledDiff[0]) * WINDOW_WIDTH)+'px';
	elem.style.top = ((item.start[1] + scaledDiff[1]) * WINDOW_HEIGHT)+'px';
}
