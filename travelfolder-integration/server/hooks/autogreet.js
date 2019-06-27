RocketChat.tf = RocketChat.tf ? RocketChat.tf : {};
RocketChat.tf.calcGreet = function(room) {
	if (!room) {
		return null;
	}
	if (room.hp) {
		return room.hp.greet;
	}
	if (room.hpid) {
		const hp = RocketChat.models.Extconf.findOneById(room.hpid);
		room.hp = hp;
		if (hp && hp.greet) {
			return hp.greet; 
		}
	}
	if (room.origin) {
		let phone = RocketChat.models.Phoneasso.findOneByNum(room.origin);
		if (!phone) {
			phone = RocketChat.models.Phoneasso.findOne({name: room.origin});
		}
		if (phone && phone.hpid) {
			const hp = RocketChat.models.Extconf.findOneById(phone.hpid);
			if (hp) {
				return hp.greet;
			}
		}
	}
	return null;
};

RocketChat.callbacks.add('beforeSaveMessage', function(message) {
	// skips this callback if the message was edited
	if (!message.rid) {
		return message;
	}
	const room = RocketChat.models.Rooms.findOneById(message.rid);
	if (!room) {
		return message;
	}

	if (message.editedAt || !room || !room._id) {
		return message;
	}
	if (!room.code) {
		return message;
	} 
	
	if (!room.t) {
		return message;
	}
	if (room.t!="l") {
		return message;
	}
	if (room.closedBy) {
		return message;
	}
	if (!message.u || !room.v || room.v._id != message.u._id) { 
		const greeting = null;//RocketChat.tf.calcGreet(room);
		if (greeting) {
			message.msg = message.msg + "\n" + greeting; 
		}
		

		return message; // only communicate with visitors
	}
	
	
	return message;
});