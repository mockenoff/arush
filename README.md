# arush

Redesign of the [Adrenaline Rush homepage](http://arushdball.com/).

Probably gonna use Gulp or something for a build process.

## Build Process

First off, a `feeds.js` file needs to be generated with the `social_feed` module. It'll contain an object of YouTube and Instagram feed items.

```
$ python lib/social_feed.py
```

The file will get dumped into `/js/`. The next step is for Gulp to aggregate everything into the `/build/` directory.

```
$ gulp build --env production
```

If you pass in `--env local`, then it'll avoid minifying the JavaScript and CSS files, though they'll still get concatenated.

## Local Development

Just running a command line Python server would be simplest.

```
$ cd build/
$ python -m http.server 8000
```
