/* eslint new-cap: [2, {"capIsNewExceptions": ["Match.Optional"]}] */
RocketChat.tf = RocketChat.tf ? RocketChat.tf : {};

Meteor.methods({
	
	'masai:transferSecond'(roomId) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:transfer' });
		}
		const room = RocketChat.models.Rooms.findOneById(roomId);
		const current = RocketChat.models.Users.findOneById(Meteor.userId());
		const extConf = RocketChat.models.Extconf.getByRoom(room);
		if (extConf !=null) {
			RocketChat.sendMessage(current, {
							rid: roomId,
							_id: Random.id(), 
							msg: extConf.transfermessage,
							bot: 1,
							noinq: 1 
						},room);
						
			return RocketChat.tf.transfer({
				roomId: roomId, 
				userId: extConf.transferuser
			});
		} /* then */
		return null;
	},
	'masai:transfer'(transferData) {
		return RocketChat.tf.transfer(transferData);
	}
});
