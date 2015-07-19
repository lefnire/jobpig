var linkedin = require('../lib/api/linkedin')
    , expect = require('expect.js')
    , _ = require('underscore')
    , mocks = require('./mocks')
    ;

describe('LinkedIn', function(){

    describe('Profile', function(){

        it('fetches and processes profile data', function(done){

            // FIXME: This will fail, linkedin.fetchUserInfo does not exist
            // It was removed because fetching a random user by ID (our own id in this case) will not give us
            // detailed information. Instead, you have to get all detailed information on registration. There's no
            // easy way to test this, so revisit when we come up with something
            linkedin.fetchUserInfo('TrBg7sWZrZ', function(err, data){
                if (err) return done(err);
                linkedin.processUserInfo(data, function(err, data){
                    if (err) return done(err);
                    expect(data.profile.name).to.equal('Tyler Renelle');
                    expect(_.contains(data.profile.skills, 'JavaScript')).to.equal(true);
                    expect(_.find(data.scores.skills, function(score, skill){
                        return skill==='JavaScript';
                    })).to.be.ok();
                    done();
                });
            })
        });
    });

    describe('Search', function(){});
});

