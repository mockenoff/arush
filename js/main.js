var nav = document.querySelector('#nav'),
	WINDOW_HEIGHT = 0;

function windowResize(ev) {
	WINDOW_HEIGHT = window.innerHeight;
}
window.addEventListener('resize', windowResize);
windowResize();

function windowScroll(ev) {
	var scrollTop = ev === undefined ? window.scrollY : ev.target.scrollingElement.scrollTop;
	nav.style.opacity = Math.min(1, scrollTop / WINDOW_HEIGHT);
}
window.addEventListener('scroll', windowScroll);
windowScroll();
