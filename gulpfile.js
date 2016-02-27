var gulp = require('gulp');
var iife = require("gulp-iife");
var gulpif = require('gulp-if');
var concat = require('gulp-concat');
var uglify = require("gulp-uglify");
var cssnano = require('gulp-cssnano');
var replace = require('gulp-replace-task');

var minimist = require('minimist');

var options = minimist(process.argv.slice(2), {
	string: 'env',
	default: { env: process.env.NODE_ENV || 'production' }
});

gulp.task('templates', function() {
	var replacements = {
		name: 'Adrenaline Rush Dodgeball',
		title: 'Adrenaline Rush — Premier Texas Dodgeball',
		keywords: [
			'Adrenaline Rush',
			'dodgeball',
			'Dallas dodgeball',
			'Texas dodgeball',
			'Scott Strittmatter',
			'Tim Poon',
			'Troy Eggeling',
			'Zack Clower',
			'Chris Allbright',
			'Parker Smart',
			'Justin Carroll',
			'Matt DeRouen',
		],
		url: 'http://arushdball.com/',
		twitter: {
			site: '@arushdball',
			creator: '@mockenoff',
		},
		image: {
			url: 'http://arushdball.com/images/cover.jpg',
			width: 851,
			height: 361,
			type: 'image/jpeg',
		},
		sameAs: [
			'https://facebook.com/arushdball/',
			'https://twitter.com/arushdball',
			'https://instagram.com/arushdball/',
			'https://youtube.com/user/arushdball/',
		],
		description: 'Adrenaline Rush — A Texas-based dodgeball team from Dallas that competes nationally in the Elite Dodgeball Invitation, National Dodgeball League, and more.',
	};
	return gulp.src(['index.html']).pipe(replace({
		patterns: [
			{
				match: 'title',
				replacement: replacements.title,
			},
			{
				match: 'description',
				replacement: replacements.description,
			},
			{
				match: 'url',
				replacement: replacements.url,
			},
			{
				match: 'keywords',
				replacement: replacements.keywords.join(', '),
			},
			{
				match: 'imageUrl',
				replacement: replacements.image.url,
			},
			{
				match: 'imageWidth',
				replacement: replacements.image.width,
			},
			{
				match: 'imageHeight',
				replacement: replacements.image.height,
			},
			{
				match: 'imageType',
				replacement: replacements.image.type,
			},
			{
				match: 'twitterSite',
				replacement: replacements.twitter.site,
			},
			{
				match: 'twitterCreator',
				replacement: replacements.twitter.creator,
			},
			{
				match: 'jsonLd',
				replacement: JSON.stringify([{
					"@context": "http://schema.org",
					"@id": "#amt-organization",
					"@type": "Organization",
					"name": replacements.name,
					"description": replacements.description,
					"logo":[{
						"@type": "ImageObject",
						"name": replacements.name,
						"text": replacements.name,
						"url": replacements.image.url,
						"contentUrl": replacements.image.url,
						"encodingFormat": replacements.image.type
					}],
					"url": replacements.url,
					"sameAs": replacements.sameAs,
					"mainEntityOfPage": replacements.url,
				}, {
					"@context": "http://schema.org",
					"@id": "#amt-website",
					"@type": "WebSite",
					"name": replacements.title,
					"headline": replacements.title,
					"url": replacements.url,
				}]),
			},
		],
	})).pipe(gulp.dest('build/'));
});

gulp.task('scripts', function() {
	return gulp.src(['js/feeds.js', 'js/anim.js', 'js/main.js'])
		.pipe(concat('all.js'))
		.pipe(iife({
			params: ['window', 'document', 'undefined'],
			args: ['window', 'document'],
		}))
		.pipe(gulpif(options.env === 'production', uglify()))
		.pipe(gulp.dest('build/'));
});

gulp.task('styles', function() {
	return gulp.src('css/*.css')
		.pipe(concat('all.css'))
		.pipe(gulpif(options.env === 'production', cssnano()))
		.pipe(gulp.dest('build/'));
});

gulp.task('default', function() {
	console.log(options);
});