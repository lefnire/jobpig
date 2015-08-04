var db = require('../models/models');
var _ = require('lodash');

exports.get = function(req, res, next){
  db.User.findOne({
    where:{id:req.user.id},
    include:[
      {model:db.Tag, order:[['key', 'ASC']]},
      {model:db.UserCompany, order:[['title', 'ASC']]}
    ],
  }).then(function(user){
    res.send(user);
  })
}

exports.lock = function(req, res, next) {
  if (!_.contains(['user_tags', 'user_companies'], req.params.table))
    return res.send(403, {err:'Table must be one of user_tags|user_companies'});
  var where={user_id:req.user.id};
  where[req.params.table == 'user_companies' ? 'id' : 'tag_id'] = req.params.id;
  sequelize.model(req.params.table)
    .update({locked:sequelize.literal('NOT locked')}, {where})
    .then(()=>res.sendStatus(200));
}

exports.setPref = function(req, res, next) {
  db.User.update(req.body, {where:{id:req.user.id}}).then(()=>res.sendStatus(200));
}