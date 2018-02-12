/* globals openRoom, LivechatInquiry */
/*
RocketChat.roomTypes.add('2', 5, {
	icon: 'Merge',
	label: 'Merge', 
	route: {
		name: 'merge',
		path: '/merge/:code(.+)',
		action(params) {
			openRoom("2", params.code);
		},
		link(sub) {
			return {
				code: sub.code
			};
		}
	},
	findRoom(identifier) {
		return ChatRoom.findOne({ _id: (identifier) });
	},
	condition() {
		return RocketChat.settings.get('Livechat_enabled') && RocketChat.authz.hasAllPermission('view-l-room');
	}
});*/

