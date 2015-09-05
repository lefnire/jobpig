var db = require('../models/models');
var _ = require('lodash');

exports.get = function(req, res, next){
  db.User.findOne({
    where:{id:req.user.id},
    include:[
      {model:db.Tag, order:[['key', 'ASC']]},
      {model:db.UserCompany, order:[['title', 'ASC']]}
    ],
  }).then(user=>res.json(user))
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

exports.seedTags = function(req, res, next) {
  var tags = req.body.tags.split(',').map(t=>t.trim().toLowerCase());
  db.Tag.findAll({where: {key: {$in:tags}}, attributes: ['id']})
  .then(_tags=> sequelize.model('user_tags').bulkCreate(
    _tags.map(t=>{return {tag_id:t.id, user_id:req.user.id, score:5} })
  ))
  .then(()=>res.sendStatus(200))
  .catch(next);
}
