/* globals Push */
import moment from 'moment';


RocketChat.callbacks.add('afterSaveMessage', function(message, room) {
	// skips this callback if the message was edited
	if (message.editedAt) {
		return message;
	}

	if (message.ts && Math.abs(moment(message.ts).diff()) > 60000) {
		return message;
	}

	//notification should only trigger for livechat
	if(room.t !== 'l') {
		return message;
	}
	
	var guest = RocketChat.models.Users.findOneById(room.v._id);

	if (Push.enabled === true) {
		var pushObject = {
			roomId: message.rid,
			roomName: '',
			username: '',
			message:  message.msg,
			payload: {
				host: Meteor.absoluteUrl(),
				rid: message.rid,
				sender: message.u,
				type: room.t,
				name: ''
			},
			usersTo: {
				userId: guest._id
			}
		};
		console.log(pushObject);

		RocketChat.PushNotification.send(pushObject);
	}

	return message;
}, RocketChat.callbacks.priority.LOW, 'sendNotificationOnMessageForLiveChat');
