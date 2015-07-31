var expect = require('expect.js')
    , sinon = require('sinon')
    , _ = require('underscore')
    , util = require('util')
    , joblib = require('../lib/api/jobs')

    , mocks = require('./mocks')
    , store = mocks.store('production') // pass in 'production' to use a real database
    , model = store.createModel()
//    , model = new mocks.DetachedModel
    ;

//Enhance sinon
//You can also pass a mocha as the second argument.
require('sinon-mocha').enhance(sinon);

describe('Jobs', function(){

    var Jobs, // the library object
        user,
        jobs; // the actual jobs

    //before (all) hooks are *NOT* automatically cleaned up for you.
    before(function(done){
        // Setup references
        user = model.at('users.1');
        jobs = model.at('jobs');

        // Login
        model.set('users.1', mocks.user);

        Jobs = new joblib.Jobs(user, jobs);

        //before (all) hooks are *NOT* automatically cleaned up for you.
        sinon.stub(Jobs, 'fetch', function(callback){
            model.set('jobs.jobs', mocks.jobs);
            callback(null, mocks.jobs);
        });

        // Store test jobs
        Jobs.fetch(function(err, data){
            // expect(err).to.be.null();
            expect(data[0].title).to.equal(mocks.jobs[0].title);
            return done()
        });
    });

    //You must `.restore` the method yourself.
    after(function(){
        Jobs.fetch.restore();
    });


    describe('Persistence', function(){

        it ('saved jobs as an array', function(){
            expect(_.isArray(model.get('jobs.jobs'))).to.be.equal(true);
        });

        it('stores fetches and stores jobs', function(done){
            expect(_.find(jobs.get('jobs'), function(job){
                return job.title===mocks.jobs[0].title;
            })).to.be.ok();
            return done();
        });
    });

    describe('Querying', function(){

        //TODO implement job retreival as a model.subscribe(query) rather than reseting user.jobs via underscore
        it.skip('sets up accessControl & motifs', function(done){
            /*var q = model.query('jobs').byUser(model.get('users.1'));
            model.fetch(q, function(err, results){
                if (err) return done(err);
                expect(results.get().length).to.be.greaterThan(0);
                done();
            });*/
        });

        it('limits user query to preferred jobs', function(done){

            Jobs.fetch(function(err, data){
                // expect(err).to.be.null(); // FIXME this should be working
                if (err) return done(err);
                Jobs.filter(function(err, data){
                    if (err) return done(err);
                    expect(_.find(data, function(job){
                        return job.title.indexOf('Programming')!==-1;
                    })).to.be.ok();
                    expect(_.find(data, function(job){
                        return job.title==='Cooking';
                    })).to.not.be.ok();
                    return done();
                });
            });
        });
    });

    describe('Upvote/Downvote', function(){

        it('updates user preferences', function(){

            Jobs.downvoteJob(mocks.jobs[0]);
            Jobs.upvoteJob(mocks.jobs[1]);

            user = model.get('users.1');
            console.log(user);

            expect(user.scores.skills.derby).to.be(0);
            expect(user.scores.skills.ruby).to.be(2);
        });

        it('updates user job-listing (based on query subscription)')
    });

    describe('Associate job with LinkedIn skills', function(){
        var config = {
            'profile' : {
                'skills':       ['java', 'c++', 'python', 'requirements'],
                'industry':     'kittens',
                'interests':    ['chess', 'washing machines', 'kumquats'],
                'location':     'Portland, OR'
            }
           },
           jobsArray = [
               {
                   'title': 'Technical Lead- Recommendation'
                   , 'company': 'Elance'
                   , 'location': 'Mountain View, CA'
                   , 'description': 'In this role, you will: Drive the requirements and own experiments throughout their life cycle Exhibit strong leadership and communication skills consistently Rock at prioritization and execution in a dynamic distributed application...'
                   , 'datePosted': '2012-12-19T21:07:57Z'
                   , 'link': 'http://api.simplyhired.com/a/job-details/view/jobkey-6503.6667a31c574334b37583a929c7aabf10/rid-hjpkggwgbggmjiqkfycuqdqvnccqwwfy/cjp-0/hits-430270'
               },
               {
                   'title': 'Recommender Systems Engineer'
                   , 'company': 'Intel'
                   , 'location': 'Santa Clara, CA'
                   , 'description': 'Title: Recommender Systems Engineer Location: USA-California, Santa Clara Job Number:_632661 Candidate will assist in project teams throughout a project\'s life cycle - exploration, planning, analysis, design, development, testing,...'
                   , 'datePosted': '2012-10-23T20:00:56Z'
                   , 'link': 'http://api.simplyhired.com/a/job-details/view/jobkey-5235.632661/rid-hjpkggwgbggmjiqkfycuqdqvnccqwwfy/cjp-3/hits-430270'
               },
               {
                   'title': 'Search/Recommendations Statistician'
                   , 'company': 'Apple'
                   , 'location': 'California'
                   , 'description': '* Job Number: 21708100 * Address: Santa Clara Valley, California, United States * Posted: Dec. 21, 2012 * Weekly Hours: 40.00 * Job Summary: As a Search and Recommendations Engineering Analyst/Statistician, you will evaluate and improve...'
                   , 'datePosted': '2012-12-31T10:29:23Z'
                   , 'link': 'http://api.simplyhired.com/a/job-details/view/jobkey-6eeea8b4df67fffba8d5ffbdad4df9a869a6d59/rid-hjpkggwgbggmjiqkfycuqdqvnccqwwfy/cjp-4/hits-430270'
               }
           ];

        it('takes one job and correlates it with a user\'s linkedin skills', function(){
            var job = addLinkedInSkillsToJob(jobsArray[0], config);
            expect(job.skills).to.contain('requirements');
        });

        // TODO test for full array of jobs

    });
});

