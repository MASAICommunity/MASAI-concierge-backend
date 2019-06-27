
import { RocketChat } from 'meteor/rocketchat:lib';
RocketChat.models.Rooms.removeUsernameById = function(_id, username) {
		const query = {_id};

		const update = {
			$pull: {
				usernames: username
			}
		};

		return this.update(query, update);
	};
Meteor.methods({
	'masai:returnAsInq'(rid,comment) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
    RocketChat.models.Rooms.update({_id: rid}, {$set: {fname: comment}});

    // //delete agent and room subscription
		RocketChat.models.Subscriptions.removeByRoomId(rid);

		// remove user from room
		const username = Meteor.user().username;

		RocketChat.models.Rooms.removeUsernameById(rid, username);

		// find inquiry corresponding to room
		const inquiry = RocketChat.models.LivechatInquiry.findOne({rid});

		// mark inquiry as open
		return RocketChat.models.LivechatInquiry.openInquiry(inquiry._id);
	}
});
