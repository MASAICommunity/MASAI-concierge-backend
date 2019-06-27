
import { RocketChat } from 'meteor/rocketchat:lib';
var Future = Npm.require('fibers/future');

const auth0 = Npm.require('auth0-js');


Meteor.methods({
	
	'masai:getRoom' : function (id) {
		let room = RocketChat.models.Rooms.findOneById(id); 
		if (room && room.hpid) {
			const hp = RocketChat.models.Extconf.findOneById(room.hpid);
			room.hp = hp;
		} else if (room && room.origin) { 
			let asso= RocketChat.models.Phoneasso.findOneByNum(room.origin);
			
			if (!asso) {
				asso= RocketChat.models.Phoneasso.findOne({name: room.origin});
			}
			if (asso && asso.hpid) {
				const hp = RocketChat.models.Extconf.findOneById(asso.hpid);
				room.hp = hp;
				return room;
			}
		} 
		if (room) {
			const hp = RocketChat.models.Extconf.getByRoom(room);
			if (hp) {
				room.hp = hp;
				return room;
			}
		}
		return room;
	},
	'masai:getDelayedRooms' : function () {
		rooms = RocketChat.models.Rooms.find({
			restart : {
				$lte : new Date(),
				$exists : true
			}
		});

		rooms = rooms.fetch();
		return rooms;
	},
	'masai:unmark' : function (roomId) {
		room = RocketChat.models.Rooms.findOneById(roomId);
		RocketChat.models.Rooms.update( { _id : room._id }, { $unset : { restart : "" } });
		room = RocketChat.models.Rooms.findOneById(roomId);
		const user = RocketChat.models.Users.findOneById(Meteor.userId());
		let guest = RocketChat.models.Users.findOneById(room.v._id);
		if (guest) {
			
		} else {
			
			guest = RocketChat.models.LivechatVisitors.findById(room.v._id).fetch();
			if (guest==null || guest.length <= 0) {
			}
			else {
				guest = guest[0];
			}
		}
		const agent = {
			agentId: user._id,
			username: user.username
		};
		const me = user;
		room1 = {
			fname:room.fname,
			t: 'l',
			origin: room.origin,
			code : RocketChat.models.Rooms.getNextLivechatRoomCode(),
			label : room.label,
			ts : new Date(),
			open : true,
			servedBy : {
				_id: agent.agentId,
				username: agent.username
			},
			_updatedAt : new Date(),
			v : {
				_id : room.v._id,
				username : room.v.username,
				token: room.v.token
			},
			usernames:room.usernames,
			cl: false,
			open: true,
			waitingResponse: true,
			msgs: 0,
			u: {
				_id: Meteor.userId(),
				username: me.username
			}
		};
		//make room eligible for sms sending
		if(room.rbInfo) {
			room1.rbInfo = room.rbInfo;
		}
		room1._id = RocketChat.models.Rooms.insert(room1);
		_dbs.travel_folder_notes.find({rid : room._id}).fetch().forEach(function(itm) {
			_dbs.travel_folder_notes.insert({rid: room1._id, note: itm.note});
		});
		
		const agentIds = [agent.agentId];
		const inquiry = {
			rid: room1._id,
			message: 'Restarting ...',
			name: guest.name || guest.username,
			ts: new Date(),
			code: room1.code,
			origin: room1.origin,
			department: guest.department,
			agents: agentIds,
			status: 'open',
			v: {
				_id: guest._id,
				username: guest.username
			},
			t: 'l'
		};
		inquiry._id = RocketChat.models.LivechatInquiry.insert(inquiry);
		
		let sendStub = {
			u: user,
			v: guest,
			guest: guest,
			user: user,
			message: {
				rid: room1._id,
				_hidden:true,
				_allowhidden : true,
				imuserid : me._id,
				_id: Random.id(),
				msg: "Wiedervorlage ChatID "+(room.code)+": "+(room.closecomment),
				u: user,
				noinq: 1,
				department: guest.department
			},
			roomInfo: {
				
			}
		};
		
		RocketChat.Livechat.sendMessage(sendStub);
		
		return inquiry;
	},
	'masai:remark' : function (roomId, date,comment) {
		room = RocketChat.models.Rooms.findOneById(roomId);
		const now = new Date();
		RocketChat.models.Rooms.update( {
			_id : room._id
		}, {
			$set : {
				restart : new Date(Date.parse(date))
			}
		});
		const user = RocketChat.models.Users.findOneById(Meteor.userId());
		
		RocketChat.models.Rooms.closeByRoomId(room._id, {
			closedBy : {
				_id : user._id,
				username: user.username
			},
			user : {
				_id : user._id,
				username: user.username
			},
			closedAt : new Date(),
			closecomment : room.code+":"+comment,
			chatDuration : (now.getTime() - room.ts) / 1000
		});
		room = RocketChat.models.Rooms.findOneById(roomId);
		RocketChat.tf.closeMasaiRoom(user, room, comment, comment);
		inqs = RocketChat.models.LivechatInquiry.find({
			'rid' : room._id
		});
		RocketChat.models.Subscriptions.remove({
			rid: room._id
		});
		inqs.fetch().forEach(function(iq) {
			RocketChat.models.LivechatInquiry.remove({
				_id : iq._id
			});
		});
		return room;
	},
	'masai:chatHistory' : function (roomId, filter) {
		room = RocketChat.models.Rooms.findOneById(roomId);

		query = {
			'v._id': room.v._id,
			open: { $exists : false }
		};
		if (filter!=null && filter.chatid!=null && filter.chatid!="") {
			query._id = filter.chatid;
		} /* then */
		if (filter!=null && filter.category!=null && filter.category!="") {
			query.closecomment = filter.category;
		} /* then */

		if (filter!=null && filter.code!=null  && filter.code!="") {
			query.code = parseInt(filter.code);
		} /* then */

		if (filter!=null && filter.date!=null  && filter.date!="") {
			query.ts = {
					$gte: Date.parse(filter.date),
					$lt: Date.parse(filter.date) + (24 * 60 * 60 * 1000)
			};
		} /* then */
		chatomatic = RocketChat.models.Rooms.find(query);
		lis = chatomatic.fetch();
		if (filter!=null && filter.text!=null && filter.text!="") {
			target = [];
			lis.forEach(function(r) {
				if (r.closecomment != null &&  (""+r.closecommment).toLowerCase().indexOf(filter.text.toLowerCase())>=0) {
					target.push(r);
					return;
				}
				qrx = {
					'rid': r._id,
					"msg" :  {'$regex' : '.*' + filter.text + '.*', '$options' : 'i'}
				};
				msgs = RocketChat.models.Messages.find(qrx).fetch();
				if (msgs.length>0) {
					target.push(r);
				}
			});
			lis = target;



		} /* then */
		return {listing:lis, user: RocketChat.tf.getUser(roomId)};
	}
});
