RocketChat.tf = RocketChat.tf ? RocketChat.tf : {};
RocketChat.tf.cutText = function(msg) {
	try {
		if (msg) {
			msg.input.text = msg.input.text.length < 1024 ? msg.input.text: msg.input.text.substring(0, 1024)+"...";
			return msg;
		}
	} catch(ex) {}
	return null;
};
RocketChat.tf.isCustomerMessage = function(message, room) {
	if (room && message && room.v && message.u && room.v._id == message.u._id) {
		return true;
	}
	return false;
};

RocketChat.callbacks.add('afterSaveMessage', function(message, room) {
	// skips this callback if the message was edited
	
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
	
	if (message.bot) {
		return message;
	}
	if (!message.u) {
		return message;
	}
	const options = {
		sort: {
			ts: -1
		},
		limit: 2
	};
	const lastMessage2 = RocketChat.models.Messages.find({
			rid: room._id,
			_hidden: { $ne: true },
			t: { $exists: false }
		}, options).fetch();
	const lastMessage = lastMessage2 && lastMessage2.length >= 2 ? lastMessage2[1] : null;
	const lastMessage1 = lastMessage2 && lastMessage2.length >= 2 ? lastMessage2[0] : null;
	
	if (RocketChat.tf.isCustomerMessage(message, room)) {
		
		if (lastMessage && lastMessage.u && lastMessage1 && lastMessage1.u && lastMessage.u._id == lastMessage1.u._id) {
			return message; 
		}
		const record = {
			userid: message.u._id,
			code: room.code,
			origin: room.origin,
			input: RocketChat.tf.cutText(message.msg),
			ts: new Date()
		};
		record._id = RocketChat.models.Botresult.insert(record);
	} else if (lastMessage && lastMessage.u && message.u && lastMessage.u._id == message.u._id) {  
		let upDate = RocketChat.models.Botresult.find({
			code: room.code
		}, {
			sort: {
				ts: -1
			},
			limit: 1
		}).fetch()[0];
		
		const id = upDate._id;
		RocketChat.models.Botresult.update({_id: id},{
			$set : {
				output: message.msg,
				respondedAt: new Date(),
				}
			});
	} else {
		RocketChat.models.Botresult.update({code: room.code, output: null}, {
			$set : {
				userid : message.u._id,
				code : room.code,
				output: RocketChat.tf.cutText(message.msg),
				origin : room.origin,
				respondedAt: new Date(),
				}
			}, {multi: true});
	}
	
	
	return message;
});