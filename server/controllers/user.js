var db = require('../models/models');
var _ = require('lodash');

exports.get = function(req, res, next){
  db.User.findOne({
    where:{id:req.user.id},
    include:[db.Tag],
    order:[sequelize.col('tags.user_tags.score')]
  }).then(function(user){
    res.send(user);
  })
}