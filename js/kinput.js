var KINPUT_ACTIVE = null,
	KINPUT_SEQUENCE = {
		'249104610': [
			[107, false], // k
			[105, false], // i
			[100, false], // d
			[36, true],   // $
			[109, false], // m
			[97, false],  // a
			[114, false], // r
			[116, false], // t
		],
		'245666397': [
			[100, false], // d
			[75, true],   // K
			[101, false], // e
			[84, true],   // T
		],
	};

document.addEventListener('keypress', function(ev) {
	var keyCode = ev.keyCode || ev.which,
		shiftKey = ev.shiftKey;

	if (KINPUT_ACTIVE === null) {
		for (var key in KINPUT_SEQUENCE) {
			if (KINPUT_SEQUENCE[key][0][0] === keyCode && KINPUT_SEQUENCE[key][0][1] === shiftKey) {
				KINPUT_ACTIVE = [key, 0];
			}
		}
	} else {
		var nextStep = KINPUT_SEQUENCE[KINPUT_ACTIVE[0]][KINPUT_ACTIVE[1]+1];
		if (keyCode === nextStep[0] && shiftKey === nextStep[1]) {
			KINPUT_ACTIVE[1]++;
			if (KINPUT_ACTIVE[1] + 1 >= KINPUT_SEQUENCE[KINPUT_ACTIVE[0]].length) {
				var container = document.querySelector('#soundcloud-container'),
					template = document.querySelector('#soundcloud-template').innerHTML;
				if (container === null) {
					container = document.createElement('div');
					container.id = 'soundcloud-container';
					document.body.appendChild(container);
				}
				container.innerHTML = template.replace('{{song_id}}', KINPUT_ACTIVE[0]);
				KINPUT_ACTIVE = null;
			}
		} else {
			KINPUT_ACTIVE = null;
		}
	}
});
