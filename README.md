A Pandora-like job board/scraper.

##Technologies

* React, React-Router, Webpack, Material UI
* Node v4.x / Express (v4.x because lotta es6, use [nvm](https://github.com/creationix/nvm) if need previous version for other projects)
* Postgres / Sequelize

##Setup


```shell
$ npm install -g nodemon
$ cp config.example.json config.json #then edit with your vals, particularly "development" per your Postgres db 
$ npm install
$ npm run server # in one terminal tab
$ npm run client # in another terminal tab, then go to localhost:3001
```

TODO: better this README