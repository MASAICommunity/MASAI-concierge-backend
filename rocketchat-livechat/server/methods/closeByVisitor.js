import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { RocketChat } from 'meteor/rocketchat:lib';
import LivechatVisitors from '../models/LivechatVisitors';

Meteor.methods({
	'livechat:closeByVisitor'({ roomId, token }) {
		const visitor = LivechatVisitors.getVisitorByToken(token);
		const room = RocketChat.models.Rooms.findOneById(roomId);

		const language = (visitor && visitor.language) || RocketChat.settings.get('Language') || 'en';
		
		if (!room || !room.open) {
			return false;
		}

		let closer = visitor;
		let res = null;
		let alreadyClosed = false;
		
		const extOf = RocketChat.models.Extconf.getByRoom(room);
		if (extOf && extOf.closeMessageCustomer) {
			RocketChat.sendMessage(closer, {
				rid: room._id,
				_id: Random.id(), 
				bot: 1,
				msg: extOf.closeMessageCustomer,
				noinq: 1
			},room);
		}
		
		if (room.servedBy && room.servedBy._id) {
			closer = RocketChat.models.Users.findOneById(room.servedBy._id);
			
			if (!closer) {
				alreadyClosed = true;
				res = RocketChat.Livechat.closeRoom({
					visitor,
					room: RocketChat.models.Rooms.findOneOpenByRoomIdAndVisitorToken(roomId, token),
					comment: TAPi18n.__('Closed_by_visitor', { lng: language }),
				});
			}
		}
		
		if (!alreadyClosed) {
			res = RocketChat.Livechat.closeRoom({
				visitor,
				room: RocketChat.models.Rooms.findOneOpenByRoomIdAndVisitorToken(roomId, token),
				comment: TAPi18n.__('Closed_by_visitor', { lng: language }),
			});
		}
			
		RocketChat.models.Rooms.update({
				_id: room._id
			}, 
			{
				$set: {
					closecomment: RocketChat.settings.get("Reisebuddy_Travelfolder_CLOSEBYVISITOR"),
					closereason: RocketChat.settings.get("Reisebuddy_Travelfolder_CLOSEBYVISITOR")
				}
		});
		const query = {
			rid: room._id
		};
		RocketChat.models.Subscriptions.remove(query);
		
		RocketChat.tf.closeMasaiRoom(
			closer,
			room,
			RocketChat.settings.get("Reisebuddy_Travelfolder_CLOSEBYVISITOR"), RocketChat.settings.get("Reisebuddy_Travelfolder_CLOSEBYVISITOR")
		);
		const inqs = RocketChat.models.LivechatInquiry.find({
			'rid' : room._id
		});
		inqs.fetch().forEach(function(iq) {
			RocketChat.models.LivechatInquiry.remove({
				_id : iq._id
			});
		});

		return res;
	},
});
