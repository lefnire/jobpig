'use strict';

// Take Adwords list of world cities goo.gl/wKNrY5, widdle it down, convert to csv needed for client and server
// Note: when done here, copy/paste the result to client/src/www. We need it in both locations (so don't cut); and
// we don't want to require() it from client (isomorophic) because we want Cloudront to cache it, and only serve it
// when requested on client (SeedTags or CreateJob)

const csv = require('csv');
const _ = require('lodash');
const fs = require('fs');
const async = require('async');
const path = require('path');

const testing = false;

const Criteria_ID = 0,
  Name = 1,
  Canonical_Name = 2,
  Parent_ID = 3,
  Country_Code = 4,
  Target_Type = 5,
  Status = 6;

let levels = {};

const buildHierarchy = (row, rows, level) => {
  row = {
    Criteria_ID: row[0],
    Name: row[1],
    Canonical_Name: row[2],
    Parent_ID: row[3],
    Country_Code: row[4],
    Target_Type: row[5],
    Status: row[6]
  }
  let children = _.remove(rows, c => c[Parent_ID] === row.Criteria_ID);
  if (children.length) {
    row.$children = children.map(r => buildHierarchy(r, rows, level+1));
  }
  levels[level] = _.union(levels[level], [row.Target_Type]);
  return row;
};

async.waterfall([
  cb => fs.readFile(path.join(__dirname, `AdWords API Location Criteria 2016-03-29.csv`), cb),
  (data, cb) => csv.parse(data, cb),

  // Mess around with determining administrative division sizes
  (rows, cb) => {
    if (testing) {
      rows = rows.slice(1);
      let hierarchy = _.remove(rows, r => !r[Parent_ID]).map(r => buildHierarchy(r, rows, 0));
      console.dir(levels);
      return fs.writeFile(path.join(__dirname, 'locations.json'), JSON.stringify(hierarchy), cb);
    }

    let xformed = _(rows)
      .slice(1) // Remove headers

      // Filter only reasonably-sized administrative divisions
      .filter(r => _.includes([ 'Country', 'Region', 'State', 'City', 'Province', ], r[Target_Type]))
      .map(r => ({
        value: r[Criteria_ID],
        label: r[Canonical_Name]
      }))
      .value();

      //// Get a sampling of 'administrative division' types (I'm not sure which of the above types we should use)
      //.groupBy('[5]')
      //.map(row => _.sampleSize(row, 25))
      //.flatten()
      //csv.stringify(xformed, cb);
      //(str, cb) => fs.writeFile('./output.csv', str, cb)

      fs.writeFile(path.join(__dirname, 'locations.json'), JSON.stringify(xformed), cb);
  },
], err => {
  if (err) console.error(err);
});