Meteor.methods({
	'masai:findAllLCC'() {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
		
		// mark inquiry as open
		return RocketChat.models.LCCCategories.findAll();
	},
	
	'masai:createLCC'(name) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
		
		// mark inquiry as open
		return RocketChat.models.LCCCategories.createLCC(name,Meteor.userId());
	},
	
	'masai:removeLCC'(id) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
		
		// mark inquiry as open
		return RocketChat.models.LCCCategories.remove(id);
	}
});
