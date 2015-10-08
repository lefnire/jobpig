// TODO this is

var request = require('request')
    , Strategy = require('passport-linkedin').Strategy
    , _ = require('lodash')

    // LinkedIn Specifics
    , apiHost = 'https://api.linkedin.com/v1'

    , oauth = {
        consumer_key: process.env.LINKEDIN_API_KEY
        , consumer_secret: process.env.LINKEDIN_SECRET_KEY
        , token: process.env.LINKEDIN_DEFAULT_TOKEN
        , token_secret: process.env.LINKEDIN_DEFAULT_SECRET
    }
    ;

require('./util').setupReplay();

var originalUserProfile = Strategy.prototype.userProfile;
/**
 * Overrides Passport-Linkedin's Strategy to provide more user-profile information
 */
Strategy.prototype.userProfile = function(token, tokenSecret, params, done) {
    var url = apiHost + '/people/~:(id,first-name,last-name,headline,location:(name,country:(code)),industry,num-connections,num-connections-capped,summary,specialties,proposal-comments,associations,honors,interests,positions,publications,patents,languages,skills,certifications,educations,three-current-positions,three-past-positions,num-recommenders,recommendations-received,phone-numbers,im-accounts,twitter-accounts,date-of-birth,main-address,member-url-resources,picture-url,site-standard-profile-request:(url),api-standard-profile-request:(url,headers),public-profile-url)?format=json';
    this._oauth.get(url, token, tokenSecret, function (err, body, res) {
        if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

        try {
            var json = JSON.parse(body);

            var profile = { provider: 'linkedin' };
            profile.id = json.id;
            profile.displayName = json.firstName + ' ' + json.lastName;
            profile.name = { familyName: json.lastName,
                givenName: json.firstName };

            profile._raw = body;
            profile._json = json;

            done(null, profile);
        } catch(e) {
            done(e);
        }
    });
}

module.exports.Strategy = Strategy;

module.exports.fetchUserInfo = function(userId, callback){
    var url = apiHost + '/people/~:(id,first-name,last-name,headline,location:(name,country:(code)),industry,num-connections,num-connections-capped,summary,specialties,proposal-comments,associations,honors,interests,positions,publications,patents,languages,skills,certifications,educations,three-current-positions,three-past-positions,num-recommenders,recommendations-received,phone-numbers,im-accounts,twitter-accounts,date-of-birth,main-address,member-url-resources,picture-url,site-standard-profile-request:(url),api-standard-profile-request:(url,headers),public-profile-url)?format=json'

    request.get({url:url, oauth:oauth, json:true}, function (e, r, body) {
        if (e) return callback(e);
        console.log(body);
        return callback(null, body);
    });
}

module.exports.processUserInfo = function(data, callback){
    var skillsArray = _.map(data.skills.values, function(skill){ return skill.skill.name });
    var data = {
        profile: {
            id: data.id
            , name: data.firstName + ' ' + data.lastName
            , headline: data.headline
            , industry: data.industry
            , interests: data.interests.split(',') //TODO trim these
            , location: data.mainAddress // TODO geolocate this
            , skills: skillsArray
        },
        scores: {
            skills: _.object(skillsArray, _.map(skillsArray, function(s){return 1;}))
        }
    };
    return callback(null, data);
}
