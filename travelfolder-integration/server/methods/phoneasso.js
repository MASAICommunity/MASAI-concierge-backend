Meteor.methods({
  'masai:getHapaAssos'() {
	if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		} 
		
	// mark inquiry as open
	const assos = RocketChat.models.Phoneasso.find({}).fetch();
	const targets = new Map();
	assos.forEach((phone) => {
		targets.set(phone.name, phone);
	});
	const assos2 = RocketChat.models.Extconf.find({}).fetch();
	assos2.forEach((et) => {
		targets.set(et.name, et);
	});
	return [...targets.values()];
  },
  'masai:getPhoneAssos'() {
	if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
		
	// mark inquiry as open
	return RocketChat.models.Phoneasso.find({}).fetch();
  },
  'masai:createPhoneAsso'(name, num, deptarments,greeting,interfacet,hpid) {
	if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
		
	// mark inquiry as open
	RocketChat.models.Phoneasso.createAsso(Meteor.userId(), num, deptarments,name,greeting,interfacet,hpid);
	axo = RocketChat.models.Phoneasso.find({}).fetch();
	return axo;
  },
  'masai:deletePhoneasso'(uid) {
	if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
		throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
	}
		
	// mark inquiry as open
	return RocketChat.models.Phoneasso.remove({
		_id : uid
	});
  }
})
