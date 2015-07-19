// simplyhired api
var request = require('request')
    , xml2js = require('xml2js')
    , util = require('util')
    , _ = require('lodash')
    , qs = require('querystring')
    ;

// cache responses
require('./util').setupReplay();


// Constants
const SIMPLY_HIRED_API_URI = 'http://api.simplyhired.com/a/jobs-api/xml-v2/';
const SIMPLY_HIRED_QUERY_PARAM = 'qo-';
const SIMPLY_HIRED_LOC_PARAM = 'l-';
const SIMPLY_HIRED_API_FIXED_PARAMS = { 'pshid': '46874'
    , 'jbd': 'jobseed.jobamatic.com'
    , 'ssty': '2'
    , 'cflg': 'r'
    , 'clip': '127.0.0.1'
};

/**
 *
 * @param params
 * @return {string}
 */
function buildApiQueryString(params){
    var searchQuery = ''
        , fullQueryString = ''
        ;
    if(params.skills){
        // limit the amount of parameters in their search query, simplyhired errors
        searchQuery += buildQueryStringComponentFromCollection(params.skills.slice(0,10));
    }
    if(params.interests){
        // limit the amount of parameters in their search query, simplyhired errors
        searchQuery += buildQueryStringComponentFromCollection(params.interests.slice(0,10));
    }
    // remove tail '+'
    searchQuery = searchQuery.slice(0, -1);

    if(params.location){
        searchQuery += '/' + SIMPLY_HIRED_LOC_PARAM + qs.escape(params.location);
    }

    fullQueryString = SIMPLY_HIRED_API_URI + SIMPLY_HIRED_QUERY_PARAM + searchQuery + '?' +
        qs.stringify(SIMPLY_HIRED_API_FIXED_PARAMS);
    return fullQueryString;
}

/**
 *
 * @param collection
 * @return {string}
 */
function buildQueryStringComponentFromCollection(collection){
    var queryStringComponent = _.reduce(collection, function(memo, param){
                return memo + "%22"+qs.escape(param)+"%22+";
            }, '');
    return queryStringComponent;
}

/**
 *
 * @param {string} simplyHiredQueryUri
 * @param {function} callback
 */
function fetchXmlFromApi(simplyHiredQueryUri, callback) {
    request(simplyHiredQueryUri, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return callback(null, body);
        }
    });
}

/**
 *
 * @param {string} simplyHiredResponse
 * @param callback
 */
function returnJobsArray(simplyHiredResponse, callback) {
    var  parser = new xml2js.Parser()
        , jobsArray
        , unexpectedApiResponseMsg
    ;

    parser.parseString(simplyHiredResponse, function (err, result) {
        if(!err){
            // null check
            if(result.shrs && result.shrs.rs && result.shrs.rs[0]){
                jobsArray = result.shrs.rs[0].r;
            } else {
                unexpectedApiResponseMsg = 'XML returned from SimplyHired didn\'t contain expected shrs and rs elements.';
//                console.error(unexpectedApiResponseMsg);
                return callback(unexpectedApiResponseMsg, result);
            }
            return callback(null, jobsArray);
        }
    });
}

/**
 *
 * @param {Array} unprocessedJobsArray
 * @return {Array}
 */
function processJobsArray(unprocessedJobsArray){
    var processedJobsArray = [];
    _.each(unprocessedJobsArray, function(job){
        var processedJob = {
            'title': job.jt[0],
            'company': job.cn[0]._,
            'location': job.loc[0]._,
            'description': job.e[0],
            'datePosted': job.dp[0],
            'link': job.src[0].$.url // lol
        };
        processedJobsArray.push(processedJob);
    });
    return processedJobsArray;
}

/**
 *
 * @param params
 * @param callback
 */
module.exports.search = function (params, callback) {
    var apiQueryString = buildApiQueryString(params)
        , processedJobsArray = []
        ;

    fetchXmlFromApi(apiQueryString, function(err, xmlFromApi){
        if (!xmlFromApi) return callback(err);
        returnJobsArray(xmlFromApi, function(err, jobsArray){
            if(err) return callback(err);
            processedJobsArray = processJobsArray(jobsArray);
//            console.log(util.inspect(processedJobsArray, false, null))
            return callback(null, processedJobsArray);
        });
    });

};

// Export private functions FOR UNIT TESTING ONLY
if ((process.env.NODE_ENV) === 'test') {
    module.exports.fetchXmlFromApi = fetchXmlFromApi;
    module.exports.returnJobsArray = returnJobsArray;
    module.exports.buildApiQueryString = buildApiQueryString;
    module.exports.buildQueryStringComponentFromCollection = buildQueryStringComponentFromCollection;
    module.exports.processJobsArray = processJobsArray;
}