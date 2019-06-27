Meteor.methods({
	'masai:sendSMS'(num, txt, assoid) {
		
		const user = RocketChat.models.Users.findOneById(Meteor.userId());
		const agent = {
			agentId: user._id,
			username: user.username
		};
		const me = user;
		let visitor = RocketChat.models.Users.findOneByUsername(num);
		if (visitor) {
			
		} else {
			visitor = RocketChat.models.LivechatVisitors.findOneVisitorByPhone(num);
			if (visitor) {
				visitor.profile = visitor;
			}
		}
		asso =  RocketChat.models.Phoneasso.find({_id:assoid}).fetch();
		if (asso!=null && asso.length>0) {
			asso = asso[0];
		} else {
			asso = {
				interfacet : 0,
				num : 0
			};
		}
		let sendStub = {
			message: {
				_id: Random.id(),
				msg: txt,
				u: user,
				noinq: 1,
					asso : asso,
				origin : asso.num,
				dbsms : asso.interfacet
			},
			roomInfo: {
				rbInfo: {
					asso : asso,
					source: "mail",
					origin : asso.num,
					visitorSendInfo: num,
					serviceName: "lotusMail",
					dbsms : asso.interfacet
				},
				origin : asso.num,
					asso : asso,
				dbsms : asso.interfacet
			}
		};
		if (visitor) {
			const rooms = RocketChat.models.Rooms.findOpenByVisitorToken(visitor.profile.token).fetch();
			if (rooms && rooms.length > 0) {
				sendStub.message.rid = rooms[0]._id;
			} else {
				sendStub.message.rid = Random.id();
			}
			sendStub.username = num;
		} else {
			sendStub.message.rid = Random.id();

			sendStub.phone = {number: num}; //no @ => most probably was a phone address
			sendStub.username = num;
			sendStub.token = sendStub.message.token==null?  Random.id():sendStub.message.token;
			const guestInfo = sendStub;
			console.log(guestInfo);
            const userId = RocketChat.Livechat.registerGuest(guestInfo);
			visitor = RocketChat.models.LivechatVisitors.findById(userId).fetch();
			if (visitor==null || visitor.length <= 0) {
			visitor = RocketChat.models.Users.findById(userId);
			}
			else {
				visitor = visitor[0];
			} 
		
		}
		sendStub.u = user;
		sendStub.v = visitor;
		sendStub.guest = user;
		sM = RocketChat.Livechat.sendMessage(sendStub);
		room = RocketChat.models.Rooms.findById(sM.rid).fetch();
		room1 = room[0];
		room1.name = num;
		room1 = RocketChat.models.Rooms.update({_id:room1._id},{
			$set : {
				label : num,
				u: {
					_id: visitor._id,
					username: visitor.username
				},
				servedBy : {
					_id: agent.agentId,
					username: agent.username
				},
				v : {
					_id : visitor._id,
					username : visitor.username,
					token: visitor.token==null?visitor.profile.token:visitor.token
				}
			}
		});
		
		
		RocketChat.tf.closeMasaiRoom(me, room[0], null, null);

		// mark inquiry as open
		return room1;
	}
});
