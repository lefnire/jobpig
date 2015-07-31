var _ = require('lodash');
require('sepia'); // mocked http requests (testing)

describe('Adaptors', function() {
  var app = require('../index');
  before(function(done){
    app.listen(3000, ()=>{
      global.sequelize.sync({force:true}).then(()=>done());
    });
  })
  //after(app.close)
  it('something', function(done) {
    var adaptors = require('../lib/adaptors');

    adaptors.refresh().then(()=>{
      console.log("adaptors");
      done()
    });
  })
})