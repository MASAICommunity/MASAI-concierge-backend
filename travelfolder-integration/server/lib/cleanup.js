/*clean up */
import { RocketChat } from 'meteor/rocketchat:lib';
const moment = Npm.require("moment");
RocketChat.tf = RocketChat.tf ? RocketChat.tf : {};
RocketChat.models.LivechatVisitors.getVisitorByToken = function(token, options) {
		const query = {  
			token
		};

		return this.findOne(query, options);
	};
RocketChat.tf.transfer = function (transferData) {
	if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:transfer' });
		}

		check(transferData, {
			roomId: String,
			userId: Match.Optional(String),
			departmentId: Match.Optional(String)
		});
		RocketChat.models.Rooms.update({
		_id: transferData.roomId
		}, 
		{
			$set: {
				transfered: 1,
				fname: transferData.comment
			}
		});


		const room = RocketChat.models.Rooms.findOneById(transferData.roomId);

		let guest = RocketChat.models.Users.findOneById(room.v._id);
		
		if (!guest) {
			
                guest = RocketChat.models.LivechatVisitors.findOneById(room.v._id);
		}

		const user = Meteor.user();

		RocketChat.models.Botresult.update({code: room.code, output: null}, {
			$set : {
				userid : user._id,
				code : room.code,
				intent: 'Transfer',
				output: 'Transfer',
				origin : room.origin,
				respondedAt: new Date(),
				}
			}, {multi: true});
		if (transferData.userId) {
			const record = {
				intent : 'Transfer',
				userid: transferData.userId,
				code: room.code,
				origin: room.origin,
				input: 'Transfer',
				transfer: 1,
				alternative : null,
				output: null,
				ts: new Date(),
				channel: null,
				conversation: null,
				msg: null
			}
			RocketChat.models.Botresult.insert(record);
		}
		return RocketChat.Livechat.transfer(room, guest, transferData);
};
Meteor.setInterval(function() {
	const autoClose = RocketChat.settings.get('Reisebuddy_TRAVELFOLDER_AUTOCLOSE_USER');
	const userName = autoClose;
	if (!userName) {
		return;
	}
	const rooms = RocketChat.models.Rooms.find({
		open: true,
		t: 'l' 
	}).fetch();
	
	
	const autoCloseUser = RocketChat.models.Users.findOneByUsername(userName, {});
	if (!autoCloseUser) {
		return;
	}
	if (rooms) {	
		for (var i=0;i<rooms.length;i++) {
			const ro = rooms[i];
			if (!ro.lm) {
				continue;
			}
			if (ro.transfered) {
				continue;
			}
			if (!ro.servedBy) {
				continue;
			}
			var ms = moment().diff(moment(ro.lm));
			ms = moment.duration(ms);
			const hp = RocketChat.models.Extconf.getByRoom(ro);
			if (hp) {
				ro.hp = hp;
				if (hp && hp.closemin && ms.asSeconds() > hp.closemin) {
					  // Reisebuddy_WATSON_AUTOCLOSE_CATEGORY
				    const options = {
						sort: {
							ts: -1
						},
						limit: 1
					};
					const lastMessage2 = RocketChat.models.Messages.find({
						rid: ro._id,
						_hidden: { $ne: true },
						t: { $exists: false }
					}, options).fetch();
					
					const lastMessage1 = lastMessage2 && lastMessage2.length >= 1 ? lastMessage2[0] : null;
					if (RocketChat.tf.isCustomerMessage(lastMessage1, ro)) {
						continue;
					}
					
					RocketChat.tf.closeHandling(ro, autoCloseUser, RocketChat.settings.get('Reisebuddy_WATSON_AUTOCLOSE_CATEGORY'), null,
						RocketChat.settings.get('Reisebuddy_WATSON_AUTOCLOSE_CATEGORY'), true);
					if (ro.bot) {
						RocketChat.models.Rooms.changeAgentByRoomId(ro._id, autoCloseUser);
					}
				}
			}
			
		}
	} 
}, 25000);