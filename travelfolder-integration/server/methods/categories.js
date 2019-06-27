Meteor.methods({
	'masai:findAllLCC'(roomId) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
		const room = RocketChat.models.Rooms.findOneById(roomId);
		if (room) {
			const extConf = RocketChat.models.Extconf.getByRoom(room);
			if (extConf && extConf.categories) {
				const res = [];
				extConf.categories.forEach((e) => {
					res.push({name: e});
				});
				res.sort(function(a, b) {
					return a.name.localeCompare(b.name);  
				});
				return res;
			}
		}
		// mark inquiry as open
		return RocketChat.models.LCCCategories.findAll(false);
	},
	'masai:findAllLCC2'() {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
		
		// mark inquiry as open
		return RocketChat.models.LCCCategories.findAll(true);
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
	},
	'masai:enablerLCC'(id, state) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
		
		// mark inquiry as open
		return RocketChat.models.LCCCategories.update({
				_id:id
			}, {
				$set : {
					disabled : state
				}
			}
		);
	}
});
