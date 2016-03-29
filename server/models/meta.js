'use strict';
const Sequelize = require('sequelize');

let Meta = sequelize.define('meta', {
  key: {type:Sequelize.STRING, primaryKey:true},
  val: Sequelize.STRING
}, {
  classMethods:{
    needsCron(){
      return sequelize.query(`SELECT EXTRACT(DOY FROM meta.val::TIMESTAMP WITH TIME ZONE)!=EXTRACT(DOY FROM CURRENT_TIMESTAMP) val FROM meta WHERE key='cron'`,
        {type:sequelize.QueryTypes.SELECT}).then(res => Promise.resolve((res[0].val)));
    },
    /**
     * @param skipScrape for tests (testing if refresh happens properly after #days)
     * @returns Promise
     */
    runCronIfNecessary(skipScrape) {
      return Meta.needsCron().then(val => {
        if (!val)
          return Promise.resolve();
        console.log('Refreshing jobs....');
        // Update cron, delete stale jobs
        return sequelize.query(`
          -- Update cron
          UPDATE meta SET val=CURRENT_TIMESTAMP WHERE key='cron';
          -- And prune old listings (10d for scraped, 30d for sponsored)
          DELETE FROM jobs WHERE
            (user_id IS NULL AND created_at < CURRENT_TIMESTAMP - INTERVAL '10 days') OR
            (user_id IS NOT NULL AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 days');
        `).then(() =>
          //FIXME require here, circular reference models.js/adaptors.js
          skipScrape ? Promise.resolve() : require('../lib/adaptors').refresh()
        );
      });
    }
  }
});

module.exports = Meta;