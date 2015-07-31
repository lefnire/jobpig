var simplyhired = require('../lib/api/simplyhired.js')
    , expect = require('expect.js')
    , util = require('util')
    ;

describe('SimplyHired', function(){

    describe('FetchJobs', function(){

        it('grabs an XML blob (non-zero-length string) from a supplied URL', function(done){
            simplyhired.fetchXmlFromApi('http://api.simplyhired.com/a/jobs-api/xml-v2/q-recommended?pshid=46874&ssty=2&cflg=r&jbd=jobseed.jobamatic.com&clip=76.105.146.254', function(err, data){
                    if (err) return done(err);
                    expect(typeof data).to.equal('string');
                    expect(data.length).to.be.greaterThan(0);
                    done();
                })
        });

        it('returns an array of matching jobs', function(done){
            simplyhired.fetchXmlFromApi('http://api.simplyhired.com/a/jobs-api/xml-v2/q-recommended?pshid=46874&ssty=2&cflg=r&jbd=jobseed.jobamatic.com&clip=76.105.146.254', function(err, data){
                if (err) return done(err);
                simplyhired.returnJobsArray(data, function(err, jobsArray){
                    if(err) return done(err);
                    expect(jobsArray).to.be.an('array');
                    done();
                });
            });
        });

        it('creates a query string for Simply Hired based on supplied configuration object', function(){
            var queryParameters = {
                'skills':       ['java', 'c++', 'python'],
                'industry':     'kittens',
                'interests':    ['chess', 'washing machines', 'kumquats'],
                'location':     'Portland, OR'
            };
            expect(simplyhired.buildQueryStringComponentFromCollection(queryParameters.skills))
                .to.be('%22java%22+%22c%2B%2B%22+%22python%22+');
            expect(simplyhired.buildApiQueryString(queryParameters))
                .to.be('http://api.simplyhired.com/a/jobs-api/xml-v2/qo-%22java%22+%22c%2B%2B%22+%22python%22+%22chess%22+%22washing%20machines%22+%22kumquats%22/l-Portland%2C%20OR?pshid=46874&jbd=jobseed.jobamatic.com&ssty=2&cflg=r&clip=127.0.0.1');
        });

        it('produces an array of sanitized, standardized jobs', function(done){
            var processedJobs = [];
            simplyhired.fetchXmlFromApi('http://api.simplyhired.com/a/jobs-api/xml-v2/q-recommended?pshid=46874&ssty=2&cflg=r&jbd=jobseed.jobamatic.com&clip=76.105.146.254', function(err, data){
                if (err) return done(err);
                simplyhired.returnJobsArray(data, function(err, jobsArray){
                    if(err) return done(err);
                    processedJobs = simplyhired.processJobsArray(jobsArray);
                    expect(processedJobs).to.be.an('array'); // TODO: this is a pretty weak test
                    done();
                });
            });
        });


        it('provides a public search, which returns a sanitized array of jobs', function(done){
            var config = {
                'profile' : {
                    'skills':       ['java', 'c++', 'python'],
                    'industry':     'kittens',
                    'interests':    ['chess', 'washing machines', 'kumquats'],
                    'location':     'Portland, OR'
                }
            };

            simplyhired.search(config, function(err, processedJobsArray){
                if (err) return done(err);
                expect(processedJobsArray).to.be.an('array'); // TODO: this is a pretty weak test
                done();
            });
        });

    });
});
