/**
 * The driver of all job-searching capability.
 * 1) new Jobs(user, jobs) creates a new object with a user & jobs reference on file, which are updated over Jobs object lifecycle
 * 2) Jobs.fetch() Runs job searches through the various APIs and saves them to db.jobs
 * 3) Jobs.upvote() and Jobs.downvote() votes on a job, altering user (which is stored by reference)
 * 4) Jobs.filter() gets a list of Jobs filtered by the user's preferences
 */

// TODO db.jobs should be an array of jobs. We should model.setNull, then merge / push / upsert (not set)
// However, top-level collections (aka, db.jobs) cannot be arrays - they must be a hash, so we do some
// duct-taping here

var _ = require('lodash'),
    async = require('async'),
    util = require('util'),
    linkedin = require('./linkedin');




/**
 *
 * @param jobsList
 * @param config
 * @return {*}
 */
function addSkillsToJobList(jobsList, config){
    var jobsListWithSkills = _.map(jobsList, function(oneJob){
        addLinkedInSkillsToJob(oneJob, config);
    });
    return jobsListWithSkills;
}

/**
 *
 * @param job
 * @param config
 * @return {*}
 */
function addLinkedInSkillsToJob(job, config){
    job.skills = [];
    _.each(config.profile.skills, function(skillString){
        var skillStringLowerCase = skillString.toLowerCase();
        if(job.description.contains(skillStringLowerCase)){
            job.skills.push(skillStringLowerCase);
        }
    });

    return job;
}



module.exports.Jobs = function(user, jobs){

    /**
     * Add supplied integer (positive/negative) to a user's job preferences when a user's skills
     * are found in the title or body text of the job listing.
     *
     * @param job
     * @param {integer} plusMinusBy
     */
    function plusMinusUserScoresByJobText(job, plusMinusBy){
        var userObj = user.get(),
            skillsAltered = [];

        if(typeof job.at === 'function') job = job.get()
        // else it's an object

        user.setNull('scores', {skills:{}})
        _.each(userObj.scores.skills, function(score, skill){
            var lower = skill.toLowerCase(),
                jobCombined = (job.title + job.body).toLowerCase();

            if(jobCombined.indexOf(lower) !== -1){
                userObj.scores.skills[skill] += plusMinusBy;
                skillsAltered.push(skill);
            }
        });
        user.set('scores.skills', userObj.scores.skills);
        return skillsAltered;
    }


    return {

        /**
         * Fetches jobs from all the implemented job-boards, each API called concurrently
         * @param {callback} of signature(err, jobsArray)
         */
        fetch: function(callback){
            var simplyhired = require('./simplyhired');
            var config = user.get('profile.linkedin')
                , processedJobsArrayWithSkills = [];

            simplyhired.search(config, function(err, processedJobsArray){
                if (err) return callback(err);
                processedJobsArrayWithSkills = addSkillsToJobList(processedJobsArray, config);
                jobs.set('jobs', processedJobsArrayWithSkills); // TODO this should be merge / upsert rather than replace, later
                return callback(null, processedJobsArray)
            });
        },

        /**
         * Filters the total jobs array down to just the user-visible jobs, based on the user's preferences
         * @return an array of filtered jobs based on the user
         */
        filter: function(callback){
            var userObj = user.get(),
                jobsObj = jobs.get('jobs'),
                filtered = [];
            if (_.isEmpty(jobsObj)) return callback('db.jobs empty');

            function bySkills(job) {

                // have a tracker variable up here, because in the body of each test function, returning `true` will just
                // return us from that function, not from keepJob
                var keep = false;

                var combined = (job.title + job.body).toLowerCase();

                // Trick - use find to exit early when we've determined to keep or ditch, there's no array-breaking in javascript
                // If we don't exit early, the determined keep/ditch will be overridden next iteration
                _.find(userObj.scores.skills, function(score, skill){
                    if (combined.indexOf(skill.toLowerCase())!==-1) { // job contains one of the user's skills
                        if (score < 0) { // however, that's a skill the user doesn't like
                            keep = false;
                            return true;
                        } else { // it's a good skill, keep this job!
                            keep = true;
                            return true;
                        }
                    }
                    return false;
                });
                return keep;
            }

            function byCompany(job){}
            function byIndustry(job){}
            function byLocation(job){}

            // One-by-one, re-add jobs back to the user's list if they match user's criteria
//            async.forEach(jobsObj, function (data, done){
            _.each(jobsObj, function (job){
                if (
                    bySkills(job) ||
                    byCompany(job) ||
                    byIndustry(job) ||
                    byLocation(job)
                ) {
                    filtered.push(job);
                }
            });
            console.log(filtered);
            return callback(null, filtered);
        },

        /**
         * TODO
         * Upvote or downvote a job. The user's preferences are updated to reflect the voting (-1 for Rails, -1 for non-profit)
         * @param job
         */
        upvoteJob: function(job) {
            return plusMinusUserScoresByJobText(job, 1);
        },

        /**
         * TODO
         * Upvote or downvote a job. The user's preferences are updated to reflect the voting (-1 for Rails, -1 for non-profit)
         * @param job
         */
        downvoteJob: function(job) {
            return plusMinusUserScoresByJobText(job, -1);
        }

    }
};

// Export private functions FOR UNIT TESTING ONLY
if ((process.env.NODE_ENV) === 'test') {
    module.exports.addSkillsToJobList = addSkillsToJobList;
    module.exports.addLinkedInSkillsToJob = addLinkedInSkillsToJob;
}