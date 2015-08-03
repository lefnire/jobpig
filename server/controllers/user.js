var db = require('../models/models');
var _ = require('lodash');

exports.get = function(req, res, next){
  db.User.findOne({
    where:{id:req.user.id},
    include:[db.Tag],
    order:[[sequelize.col('tags.user_tags.score'), 'DESC']]
  }).then(function(user){
    res.send(user);
  })
}

exports.lock = function(req, res, next) {
  db.UserTag.lock(req.user.id, req.params.tag_id);
}

exports.setPref = function(req, res, next) {
  console.log(req.body);
  db.User.update(req.body, {where:{id:req.user.id}}).then(()=>res.sendStatus(200));
}