const nconf = require('nconf');
//TODO nix this file in favor of Heroku env vars? https://docs.newrelic.com/docs/agents/nodejs-agent/hosting-services/nodejs-agent-heroku

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['Jobpig'],
  /**
   * Your New Relic license key.
   */
  license_key: nconf.get('newrelic:license'),
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: nconf.get('newrelic:log_level')
  }
}
