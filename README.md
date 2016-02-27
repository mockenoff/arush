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

You're going to need to install all of the dependencies first.

```
$ pip install -r requirements.txt
$ npm install
```

The `watch` Gulp task is pretty handy for local development. It'll monitor for file changes and build when necessary.

```
$ gulp watch --env local
```

For the API endpoints (really just `/contact/`), you can just let Flask do its barebones thing.

```
$ python lib/api.py
```

Now to serve the build files. Just running a command line Python server would be simplest.

```
$ cd build/
$ python -m http.server 8000
```
