Meteor.methods({
  'masai:getPartners'() {
	if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
		axo = RocketChat.models.Extconf.find({}).fetch();
	// mark inquiry as open
	return {partners: axo, categories: RocketChat.models.LCCCategories.findAll()};
  },
  'masai:createPartner'(name, domain) {
	if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
		
	// mark inquiry as open
	RocketChat.models.Extconf.createExtconf(Meteor.userId(), name, domain);
	axo = RocketChat.models.Extconf.find({}).fetch();
	return axo;
  },
  'masai:deleteExtconf'(uid) {
	if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
		throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
	}
		
	// mark inquiry as open
	return RocketChat.models.Extconf.remove({
		_id : uid
	});
  },
  'masai:saveExtconf'(uid, data) {
	if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
		throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
	}
	data._id = uid;
	// mark inquiry as open
	return RocketChat.models.Extconf.update(uid, data);
  }
});