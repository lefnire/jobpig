A Pandora-like job finder.

##Technologies

* React, React-Router, Webpack, Material UI
* Node v4.x / Express
* Postgres / Sequelize

##Setup

```shell
$ npm install -g nodemon
$ cp config.example.json config.json #then edit with your vals, particularly "development" per your Postgres db 
$ npm install
$ npm run server # in one terminal tab
$ npm run client # in another terminal tab, then go to localhost:3001
```