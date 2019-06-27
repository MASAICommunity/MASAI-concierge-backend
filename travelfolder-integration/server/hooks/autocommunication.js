RocketChat.tf = RocketChat.tf ? RocketChat.tf : {};

RocketChat.tf.closeHandling = function(room, user, comment, lx, autoclosecategory, nomessage) {
	const endTxt = RocketChat.tf.formatting(RocketChat.settings.get('Reisebuddy_Travelfolder_AUTOANSWER'), [room.code]);
	if (!room) {
		return;
	}
	const hp = RocketChat.models.Extconf.getByRoom(room);
	
	if ((hp === null || hp.sendChatId) && !nomessage) {
		RocketChat.sendMessage(user, {
			rid: room._id,
			_id: Random.id(), 
			bot: 1,
			msg: (lx?(lx+"\n"+endTxt):endTxt),
			noinq: 1
		},room);
	}
	RocketChat.models.LivechatInquiry.closeByRoomId(room._id, {
		closer: {
			_id: user._id,
			username: user.username
		},
		closedBy: user.username,
		closedAt: new Date(),
		chatDuration: 1
	});
	const query = {
		rid: room._id
	};
	RocketChat.models.Subscriptions.remove(query);
	let inqs = RocketChat.models.LivechatInquiry.find({
		'rid' : room._id
	});
	inqs.fetch().forEach(function(iq) {
		RocketChat.models.LivechatInquiry.remove({
			_id : iq._id
		});
	});
	return RocketChat.tf.closeMasaiRoom(
		user,
		room,
		comment, autoclosecategory?autoclosecategory:RocketChat.settings.get('Reisebuddy_WATSON_AUTOPROCESSING_CATEGORY')
	);
}
RocketChat.tf.calcConfLevel = function(room) {
	if (!room) {
		return 201;
	}
	if (room.hpid) {
		const hp = RocketChat.models.Extconf.findOneById(room.hpid);
		room.hp = hp;
		if (hp && hp.autotrigger) {
			return hp.autotrigger; 
		}
	}
	if (room.origin) {
		
		let phone = RocketChat.models.Phoneasso.findOneByNum(room.origin);
		if (!phone) {
			phone = RocketChat.models.Phoneasso.findOne({name: room.origin});
		}
		if (phone && phone.hpid) {
			const hp = RocketChat.models.Extconf.findOneById(phone.hpid);
			if (hp && hp.autotrigger) {
				return hp.autotrigger;
			}
		}
	}
  return RocketChat.settings.get('Reisebuddy_Watson_Minimum');
};
RocketChat.tf.getUsername = function(room, defaultusername) {
	if (!defaultusername) {
    return null;
  }
  if (defaultusername=="") {
    return null;
  }
  if (!room) {
    return null;
  }

  return defaultusername;
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
	if (room.transfered) {
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
	const userName = RocketChat.tf.getUsername(room,RocketChat.settings.get('Reisebuddy_Travelfolder_AUTOANSWERUSER'));
	
	
	if (!message.u || !room.v || room.v._id != message.u._id) { 
		return message; // only communicate with visitors
	}
	if (!userName) {
		return message;
	}
	const extConf = RocketChat.models.Extconf.getByRoom(room);
	let count = 0;
	if (extConf && extConf.maxRep !== null && extConf.maxRep !== undefined && extConf.maxRep >= 0) {
		count = !room.botAnswerCount ? 0 : room.botAnswerCount;
		if (count + 1 > extConf.maxRep) {
			return message;
		}
	} else {
		if (room.servedBy && room.servedBy.username != userName) {
			return message;
		}
	}
	let minConf = RocketChat.tf.calcConfLevel(room);
	const possibleAnswers = RocketChat.tf.checkWatson (room.code, JSON.stringify([message.msg]));

	if (possibleAnswers && possibleAnswers.length > 0) {
		if (possibleAnswers[0].confidence > minConf) {
			const lm = possibleAnswers[0].text;
			const org = possibleAnswers[0].org;
			const user = RocketChat.models.Users.findOneByUsername(userName, {});

			if (user && lm) {
				const stopText = RocketChat.settings.get('Reisebuddy_WATSON_CONTINUEPROCESSING');
				const lx = stopText == null ? lm : lm.split(stopText).join("");
				if (!lm.endsWith(stopText)) { 
					RocketChat.models.Rooms.changeAgentByRoomId(room._id, user);
				} /* then */ 
				RocketChat.models.LivechatInquiry.update({
					rid: room._id,
				}, {
					$set : { 
						autoprocessing: 1,
						unread: 0
					}
				});
				message.bot = 1;
				RocketChat.models.Rooms.update( { _id:room._id }, {
						$set: {
							bot: user._id,
							lm: new Date(),
							botAnswerCount: count + 1,
							unread: 0
						}
					} );
					
				if (true) {
					
					RocketChat.sendMessage(user, {
						rid: room._id,
						_id: Random.id(), 
						msg: lx,
						bot: 1,
						noinq: 1 
					},room);
				}
				let msgX = null;
				try {
				msgX = JSON.parse(possibleAnswers[0].watson);
				}
				catch(ex) {
					
				}
				RocketChat.models.Botresult.createResult(room.code,msgX, user._id, null, new Date());
			} 
		}
	}
	
	return message;
});