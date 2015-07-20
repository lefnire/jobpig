import _ from 'lodash';

var setupHotkeys = function(shortcuts) {
  return _.reduce(shortcuts, (m,v,k)=>{
    let mode = v.enabledWhenEditing ? 'editing' : 'default';
    m[mode].keys[k] = v.k;
    m[mode].handlers[k] = v.fn;
    return m;
  }, {default:{keys:{},handlers:{}}, editing:{keys:{},handlers:{}}});
}

export default {setupHotkeys};