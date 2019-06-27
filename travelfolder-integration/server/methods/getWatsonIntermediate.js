Meteor.methods({
  'masai:getWatsonIntermediate'(roomId) {
	let msg = RocketChat.settings.get('Reisebuddy_WATSON_Intermediate_Message');
	if (!roomId) {
		return msg;
	}
	
	room = RocketChat.models.Rooms.findOneById(roomId);
	if (room) {
		const hp = RocketChat.models.Extconf.getByRoom(room);
		room.hp =hp;
		if (hp && hp.intermediate) {
			msg = hp.intermediate;
		}
	}
    return msg;
  }
})
