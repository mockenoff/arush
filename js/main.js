var nav = document.querySelector('#nav'),
	API_URL = '@@apiUrl',

	// Cover section
	cover = document.querySelector('#cover'),
	coverHeader = cover.querySelector('h1'),
	downer = cover.querySelector('.downer'),

	// Team section
	team = document.querySelector('#team'),
	teamList = team.querySelector('ul'),
	teamNames = teamList.querySelectorAll('.name'),
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
	tubeList = media.querySelector('.tube-feed'),
	tubeItems = [],
	tubeTemplate = document.querySelector('#tube-template').innerHTML,
	iframeTemplate = document.querySelector('#iframe-template').innerHTML,
	mediaHeader = media.querySelector('h2'),
	mediaHeaderY = {
		min: -mediaHeader.clientHeight,
		max: 0,
		active: 100,
		current: 0,
	},

	// Team section
	contact = document.querySelector('#contact'),
	contactHeader = contact.querySelector('h2'),
	contactHeaderY = {
		min: -contactHeader.clientHeight,
		max: 0,
		active: 100,
		current: 0,
	},

	// Display calculation constants
	WINDOW_WIDTH = window.innerWidth,
	WINDOW_HEIGHT = 0,
	HALF_WINDOW_HEIGHT = 0,
	COVER_HEIGHT = cover.clientHeight,
	TEAM_HEIGHT = team.clientHeight,
	MEDIA_HEIGHT = media.clientHeight,
	HALF_MEDIA_HEIGHT = 0,
	FEED_TOP = 0,
	CONTACT_HEIGHT = contact.clientHeight,
	HALF_CONTACT_HEIGHT = 0;

// Media templating
var innerHTML = '';
for (var i = 0, l = FEEDS.INSTAGRAM.length; i < l; i++) {
	innerHTML += gramTemplate.replace('{{link}}', FEEDS.INSTAGRAM[i].link).replace('{{image}}', FEEDS.INSTAGRAM[i].image);
}
gramList.innerHTML = innerHTML;
gramItems = gramList.querySelectorAll('li');

innerHTML = '';
for (i = 0, l = FEEDS.YOUTUBE.length; i < l; i++) {
	innerHTML += tubeTemplate.replace('{{thumbnail}}', FEEDS.YOUTUBE[i].thumbnail).replace(/{{youtube_id}}/g, FEEDS.YOUTUBE[i].youtube_id);
}
tubeList.innerHTML = innerHTML;
tubeItems = tubeList.querySelectorAll('li');

tubeList.addEventListener('click', function(ev) {
	ev.preventDefault();
	var container = ev.target.parentElement;
	if (container.dataset.id !== undefined) {
		container.parentElement.innerHTML = iframeTemplate.replace('{{youtube_id}}', container.dataset.id).replace('{{width}}', WINDOW_WIDTH).replace('{{height}}', (WINDOW_WIDTH * .5625));
	}
});

// Make image loads count as a resize since otherwise they don't have height
var images = gramList.querySelectorAll('img');
for (i = 0, l = images.length; i < l; i++) {
	images[i].addEventListener('load', function(ev) {
		windowResize();
	});
}

// Prevent FOUC
document.body.classList.add('loaded');

// Window resize
function windowResize(ev) {
	WINDOW_WIDTH = window.innerWidth;
	WINDOW_HEIGHT = window.innerHeight;
	HALF_WINDOW_HEIGHT = WINDOW_HEIGHT / 2;

	teamHeaderY.max = WINDOW_HEIGHT + Math.abs(teamHeaderY.min);
	mediaHeaderY.max = WINDOW_HEIGHT + Math.abs(mediaHeaderY.min);
	contactHeaderY.max = WINDOW_HEIGHT + Math.abs(contactHeaderY.min);

	COVER_HEIGHT = WINDOW_HEIGHT;

	MEDIA_HEIGHT = media.clientHeight;
	HALF_MEDIA_HEIGHT = MEDIA_HEIGHT / 2;
	FEED_TOP = parseInt(getComputedStyle(gramList).marginTop.replace(/[\D]/g, ''), 10);

	CONTACT_HEIGHT = contact.clientHeight;
	HALF_CONTACT_HEIGHT = CONTACT_HEIGHT / 2;

	windowScroll();
}
window.addEventListener('resize', windowResize);
windowResize();

// Window scroll
function windowScroll(scrollTop) {
	if (typeof scrollTop !== 'number') {
		scrollTop = window.scrollY;
	}

	// Get rid of the downer
	if (downer !== null && scrollTop > HALF_WINDOW_HEIGHT) {
		downer.classList.remove('animate');
		downer = null;
	}

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

	// Do Cover things
	if (newActive === cover) {
		var relativeTop = scrollTop / COVER_HEIGHT;
		cover.style.opacity = 1 - relativeTop;
		coverHeader.style.backgroundPosition = 'center '+(50 + (50 * relativeTop))+'%';
	} else {
		cover.style.opacity = 0;
		coverHeader.style.backgroundPosition = 'center 100%';
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
			setTransform(teamHeader, 0, teamHeaderY.active);
		} else {
			var opacity = 1 - ((relativeTop - (percentage * teamLength)) / percentage);
			teamHeader.style.opacity = opacity;
			setTransform(teamHeader, 0, (teamHeaderY.min - ((teamHeaderY.min - teamHeaderY.active) * opacity)));
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
			setTransform(teamHeader, 0, (teamHeaderY.max - ((teamHeaderY.max - teamHeaderY.active) * opacity)));
		} else {
			teamHeader.style.opacity = 0;
			setTransform(teamHeader, 0, teamHeaderY.max);
		}
		if (oldActive !== cover) {
			for (var i = 0, l = ANIM.team.length; i < l; i++) {
				setAnimPosition(teamNames[i], ANIM.team[i][0], 0);
			}
		}
	} else {
		teamList.className = '';
		teamHeader.style.opacity = 0;
		setTransform(teamHeader, 0, teamHeaderY.min);
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
			setTransform(mediaHeader, 0, mediaHeaderY.active);
		} else {
			var opacity = 1 - ((scrollTop - scrollBorder) / HALF_MEDIA_HEIGHT);
			mediaHeader.style.opacity = opacity;
			setTransform(mediaHeader, 0, mediaHeaderY.min - ((mediaHeaderY.min - mediaHeaderY.active) * opacity));
		}

		for (var i = 0, l = gramItems.length; i < l; i++) {
			setTransform(gramItems[l-1-i], 0, ((-1 / ((i + 1) * 3)) * ((relativeTop * WINDOW_HEIGHT) + (scrollTop - mediaBorder))));
		}

		for (i = 0, l = tubeItems.length; i < l; i++) {
			setTransform(tubeItems[i], 0, ((-1 / ((i + 1) * 6)) * ((relativeTop * WINDOW_HEIGHT) + (scrollTop - mediaBorder))));
		}
	} else if (newActive === cover || newActive === team) {
		var mediaBorder = COVER_HEIGHT + TEAM_HEIGHT,
			relativeTop = (scrollTop - mediaBorder) / MEDIA_HEIGHT,
			scrollBorder = mediaBorder - HALF_MEDIA_HEIGHT;

		if (scrollTop > scrollBorder) {
			var opacity = (scrollTop - scrollBorder) / HALF_MEDIA_HEIGHT;
			mediaHeader.style.opacity = opacity;
			setTransform(mediaHeader, 0, mediaHeaderY.max - ((mediaHeaderY.max - mediaHeaderY.active) * opacity));
		} else {
			mediaHeader.style.opacity = 0;
			setTransform(mediaHeader, 0, mediaHeaderY.max);
		}

		for (var i = 0, l = gramItems.length; i < l; i++) {
			setTransform(gramItems[l-1-i], 0, ((-1 / ((i + 1) * 3)) * ((relativeTop * WINDOW_HEIGHT) + (scrollTop - mediaBorder))));
		}

		for (i = 0, l = tubeItems.length; i < l; i++) {
			setTransform(tubeItems[i], 0, ((-1 / ((i + 1) * 6)) * ((relativeTop * WINDOW_HEIGHT) + (scrollTop - mediaBorder))));
		}
	} else {
		mediaHeader.style.opacity = 0;
		setTransform(mediaHeader, 0, mediaHeaderY.max);
	}

	// Do Contact things
	if (newActive === contact) {
		contactHeader.style.opacity = 1;
		setTransform(contactHeader, 0, contactHeaderY.active);
	} else if (newActive === media) {
		var scrollBorder = COVER_HEIGHT + TEAM_HEIGHT + MEDIA_HEIGHT - HALF_CONTACT_HEIGHT;
		if (scrollTop > scrollBorder) {
			var opacity = (scrollTop - scrollBorder) / HALF_CONTACT_HEIGHT;
			contactHeader.style.opacity = opacity;
			setTransform(contactHeader, 0, contactHeaderY.max - ((contactHeaderY.max - contactHeaderY.active) * opacity));
		} else {
			contactHeader.style.opacity = 0;
			setTransform(contactHeader, 0, contactHeaderY.max);
		}
	} else {
		contactHeader.style.opacity = 0;
		setTransform(contactHeader, 0, contactHeaderY.max);
	}
}

var lastScroll = 0,
	ticking = false;

window.addEventListener('scroll', function() {
	lastScroll = window.scrollY;
	if (ticking === false) {
		window.requestAnimationFrame(function() {
			windowScroll(lastScroll);
			ticking = false;
		});
	}
	ticking = true;
});

windowScroll();

// Set the transform of an element
function setTransform(elem, xPos, yPos) {
	var transform = '';
	xPos = parseInt(xPos, 10);
	yPos = parseInt(yPos, 10);
	if (typeof xPos === 'number' && typeof yPos === 'number') {
		transform = 'translate('+xPos+'px, '+yPos+'px)';
	} else if (isNaN(xPos) === false) {
		transform = 'translateX('+xPos+'px)';
	} else if (isNaN(yPos) === false) {
		transform = 'translateY('+yPos+'px)';
	}
	elem.style.transform = elem.style['-webkit-transform'] = elem.style['-ms-transform'] = transform;
}

// Set the position of an element according to its percentage progress
function setAnimPosition(elem, item, progress) {
	var relativeTime = (progress - item.time[0]) / (item.time[1] - item.time[0]),
		scaledDiff = [
			(item.end[0] - item.start[0]) * relativeTime,
			(item.end[1] - item.start[1]) * relativeTime,
		];
	setTransform(elem, ((item.start[0] + scaledDiff[0]) * WINDOW_WIDTH), ((item.start[1] + scaledDiff[1]) * WINDOW_HEIGHT));
}

// Intercept the contact form submission
var form = contact.querySelector('.user-form'),
	formEmail = form.querySelector('input[type="email"]'),
	formBody = form.querySelector('textarea'),
	formSubmit = form.querySelector('input[type="submit"]'),
	formLoader = form.querySelector('.loader'),
	formSuccess = form.querySelector('.success');

formEmail.addEventListener('focus', function(ev) {
	formSuccess.classList.remove('flash');
});

formEmail.addEventListener('blur', function(ev) {
	if (formEmail.checkValidity() === true) {
		formEmail.classList.remove('error');
	}
});

formBody.addEventListener('focus', function(ev) {
	formSuccess.classList.remove('flash');
});

formBody.addEventListener('blur', function(ev) {
	if (formBody.checkValidity() === true) {
		formBody.classList.remove('error');
	}
});

form.addEventListener('submit', function(ev) {
	ev.preventDefault();

	var submit = true;
	formSuccess.classList.remove('flash');

	if (formEmail.checkValidity() === false) {
		submit = false;
		formEmail.classList.add('error');
	} else {
		formEmail.classList.remove('error');
	}

	if (formBody.checkValidity() === false) {
		submit = false;
		formBody.classList.add('error');
	} else {
		formBody.classList.remove('error');
	}

	if (submit === true) {
		formEmail.disabled = true;
		formBody.disabled = true;
		formSubmit.disabled = true;
		formLoader.classList.add('show');

		reqwest({
			url: API_URL+'/contact/',
			method:'POST',
			data: {
				email: formEmail.value,
				body: formBody.value,
			},
		}).then(function(resp) {
			formEmail.value = '';
			formBody.value = '';
			formSuccess.classList.add('flash');
		}).always(function(resp) {
			formEmail.disabled = false;
			formBody.disabled = false;
			formSubmit.disabled = false;
			formLoader.classList.remove('show');
		});
	}
});
