var DetachedModel, Model, ResMock, write;

Model = require('racer')["protected"].Model;

DetachedModel = exports.DetachedModel = function() {
    Model.apply(this, arguments);
};

DetachedModel.prototype = {
    __proto__: Model.prototype,
    _commit: function() {}
};

ResMock = exports.ResMock = function() {
    this.html = '';
};

ResMock.prototype = {
    getHeader: function() {},
        setHeader: function() {},
    write: write = function(value) {
        return this.html += value;
    },
    send: write,
    end: function(value) {
        write(value);
        return typeof this.onEnd === "function" ? this.onEnd(this.html) : void 0;
    }
};

exports.store = function(environment) {
    var racer = require('racer');

    if(environment=='production') {
        // TODO use mongoskin to wipe database
        var derby = require('derby');
        derby.use(require('racer-db-mongo'));
        var store = derby.createStore({
            db: { type: 'Mongo', uri: 'mongodb://localhost/jobseed-test' }
        });
        return store;
    } else {
        var racer = require('racer')
            , store = racer.createStore();
        store.racer.protected.Model = DetachedModel;
        return store;
    }

}

exports.jobs = [
    {id:1, link: 'http://google.com', title: 'Programming 1', body: 'Derby'},
    {id:2, link: 'http://google.com', title: 'Programming 2', body: 'Ruby'},
    {id:3, link: 'http://google.com', title: 'Programming 3', body: 'Python'},
    {id:4, link: 'http://google.com', title: 'Cooking', body: ''}
]

exports.user = {
    id: 1,
    name: "Tyler Renelle",
    profile: { // keeps useful social networking data around
        linkedin: {
            skills: ["Programming"]
        },
        github: {}
    },
    auth: { // added by derby-auth, keeps Passport authentication objects around
        linkedin:{ id: 'TrBg7sWZrZ' }
    },
    scores: {
        skills:{
            derby: 1,
            ruby: 1,
            python: 1
        },
        companies:{},
        industries:{}
    },
    jobs: [] /// this is set after Jobs.filter, so that it will update in realtime in the user's UI
}