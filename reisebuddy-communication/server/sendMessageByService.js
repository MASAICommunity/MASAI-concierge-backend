
/**
 * Sends messages by with reisebuddy CommunicationService.
 * @author jakobpannier
 */
RocketChat.callbacks.add('afterSaveMessage', function (message, pRoom) {
	// skips this callback if the message was edited
	if (message.editedAt || !pRoom || !pRoom._id) {
		return message;
	}
	const room = RocketChat.models.Rooms.findOneById(pRoom._id); // sometimes not complete
	// only proceed if room: is livechat with source and visitor information
	if (!(room && room.t === 'l' && room.v && room.rbInfo && room.rbInfo.serviceName && room.rbInfo.visitorSendInfo)) {
		return message;
	}
	// if the message has a token or a special type, it was sent from the visitor, so ignore it

	if (message.token || message.t) {
		return message;
	}
	const service = _dbs.getCommunicationService(room.rbInfo.serviceName);
	if (!service) {
		return message;
	}
	if (message._hidden) {
		return message;
	}
	da = RocketChat.models.Botresult.findMatching(room.code,null,null);
	if (da==null || da.length<=0) {
		
		userid = message.u._id;
	} /* then */
	greetings = "";
	
	if (room.rbInfo!=null && room.rbInfo.asso!=null && room.rbInfo.asso.greetings!=null) {
		greetings = room.rbInfo.asso.greetings;
	} else if (room.rbInfo!=null && room.rbInfo.origin!=null){
		as = RocketChat.models.Phoneasso.find({num:room.rbInfo.origin}).fetch();
		if (as !=null && as.length>0) {
			greetings = as[0].greetings;
		}
	}
	if (room.rbInfo!=null && room.rbInfo.dbsms==1) {
		var email = require('emailjs');
		var server 	= email.server.connect({
		   user:    RocketChat.settings.get('Reisebuddy_GATEWAY_USER'), 
		   password:RocketChat.settings.get('Reisebuddy_GATEWAY_PASSWORT'), 
		   port: RocketChat.settings.get('Reisebuddy_GATEWAY_PORT'),
		   tls : true,
		   host:    RocketChat.settings.get('Reisebuddy_GATEWAY_HOST'), 
		 
		});
		
		
		
		server.send({
		   text:    message.msg + greetings, 
		   from:    RocketChat.settings.get('Reisebuddy_GATEWAY_USER'), 
		   to:      "smsrbud#"+(room.rbInfo.visitorSendInfo)+"@ums.db.de",
		   subject: ""
		}, function(err, message) {
			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"); 
			console.log(err || message);
			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"); 
		});
		
		
		return message;
	}

	service.send({
		to: room.rbInfo.visitorSendInfo,
		message: message.msg + greetings
	});
	return message;
}, RocketChat.callbacks.priority.MEDIUM);
