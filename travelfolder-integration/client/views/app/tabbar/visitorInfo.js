import moment from 'moment';

var message = null;
var messageListenerRegistered = false;
var travelfolderWindow = null;
const GRANT_URL = '';
const TRAVELFOLDER_URL = 'http://www.journey-concierge.com/';

Template.visitorInfo_travelFolder.helpers({
	user() {
		const user = Template.instance().user.get();
		return user;
	},

	room() {
		return ChatRoom.findOne({ _id: this.rid });
	},

	joinTags() {
		return this.tags && this.tags.join(', ');
	},

	customFields() {
		const fields = [];
		let livechatData = {};
		const user = Template.instance().user.get();
		if (user) {
			livechatData = _.extend(livechatData, user.livechatData);
		}

		const data = Template.currentData();
		if (data && data.rid) {
			const room = RocketChat.models.Rooms.findOne(data.rid);
			if (room) {
				livechatData = _.extend(livechatData, room.livechatData);
			}
		}

		if (!_.isEmpty(livechatData)) {
			for (const _id in livechatData) {
				if (livechatData.hasOwnProperty(_id)) {
					const customFields = Template.instance().customFields.get();
					if (customFields) {
						const field = _.findWhere(customFields, { _id: _id });
						if (field && field.visibility !== 'hidden') {
							fields.push({ label: field.label, value: livechatData[_id] });
						}
					}
				}
			}
			return fields;
		}
	},

	createdAt() {
		if (!this.createdAt) {
			return '';
		}
		return moment(this.createdAt).format('L LTS');
	},

	lastLogin() {
		if (!this.lastLogin) {
			return '';
		}
		return moment(this.lastLogin).format('L LTS');
	},

	editing() {
		return Template.instance().action.get() === 'edit';
	},

	forwarding() {
		return Template.instance().action.get() === 'forward';
	},

	editDetails() {
		const instance = Template.instance();
		const user = instance.user.get();
		return {
			visitorId: user ? user._id : null,
			roomId: this.rid,
			save() {
				instance.action.set();
			},
			cancel() {
				instance.action.set();
			}
		};
	},

	forwardDetails() {
		const instance = Template.instance();
		const user = instance.user.get();
		return {
			visitorId: user ? user._id : null,
			roomId: this.rid,
			save() {
				instance.action.set();
			},
			cancel() {
				instance.action.set();
			}
		};
	},

	roomOpen() {
		const room = ChatRoom.findOne({ _id: this.rid });

		return room.open;
	},

	guestPool() {
		return RocketChat.settings.get('Livechat_Routing_Method') === 'Guest_Pool';
	},

	showDetail() {
		if (Template.instance().action.get()) {
			return 'hidden';
		}
	},

	canSeeButtons() {
		if (RocketChat.authz.hasRole(Meteor.userId(), 'livechat-manager')) {
			return true;
		}

		const data = Template.currentData();
		if (data && data.rid) {
			const subscription = RocketChat.models.Subscriptions.findOne({ rid: data.rid });
			return subscription !== undefined;
		}
		return false;
	},
	notes(){
		notes = Template.instance().notes.get();
		if(notes)
		return notes;

		}

});

Template.visitorInfo_travelFolder.events({
	'click .edit-livechat'(event, instance) {
		event.preventDefault();

		instance.action.set('edit');
	},
	'click .close-livechat'(event) {
		event.preventDefault();

		swal({
			title: t('Closing_chat'),
			type: 'input',
			inputPlaceholder: t('Please_add_a_comment'),
			showCancelButton: true,
			closeOnConfirm: false
		}, (inputValue) => {
			if (!inputValue) {
				swal.showInputError(t('Please_add_a_comment_to_close_the_room'));
				return false;
			}

			if (s.trim(inputValue) === '') {
				swal.showInputError(t('Please_add_a_comment_to_close_the_room'));
				return false;
			}

			Meteor.call('livechat:closeRoom', this.rid, inputValue, function(error/*, result*/) {
				if (error) {
					return handleError(error);
				}
				swal({
					title: t('Chat_closed'),
					text: t('Chat_closed_successfully'),
					type: 'success',
					timer: 1000,
					showConfirmButton: false
				});
			});
		});
	},

	'click .return-inquiry'(event) {
		event.preventDefault();

		swal({
			title: t('Would_you_like_to_return_the_inquiry'),
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: t('Yes')
		}, () => {
			Meteor.call('livechat:returnAsInquiry', this.rid, function(error/*, result*/) {
				if (error) {
					console.log(error);
				} else {
					Session.set('openedRoom');
					FlowRouter.go('/home');
				}
			});
		});
	},

	'click .forward-livechat'(event, instance) {
		event.preventDefault();

		instance.action.set('forward');
	},
	'click #travelfolder' (event, instance) {
		// open travelfolder in own window
		var w = 1000;
        var h = 800;
        // Fixes dual-screen position                         Most browsers      Firefox
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        var top = ((height / 2) - (h / 2)) + dualScreenTop;

		travelfolderWindow = 
			window.open(TRAVELFOLDER_URL + 'redirect.html', 'com_journey_concierge', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
		
		Meteor.call('masai:getJWT',instance.roomId,function(err, result) {
			if (!travelfolderWindow || travelfolderWindow.closed) {
				message = null;
				messageListenerRegistered = false;
				return;
			}
		
			if (result.user) {
				result.userId = Gravatar.hash(result.user).slice(16);
			}
			
			message = result;
			if (messageListenerRegistered) {
				travelfolderWindow.postMessage({'msg': message}, "*");
				message = null;
				messageListenerRegistered = false;
			}
		});

	},
	'click .ask-permission'(event, template) {
		event.stopPropagation();
		event.preventDefault();
		Meteor.call('sendMessage', {
			"_id": Random.id(), "rid": template.roomId, "msg": JSON.stringify({
				"url": GRANT_URL, "payload":
					{ "scope": ["personal","contact","address_private","address_billing","esta","passport","journey","preference"] }
			}) });
	},
	'submit .note-form' (event,template){

		event.preventDefault();
		event.stopPropagation();
		const val = $('.note-form textarea').val();
		$('.note-form textarea').val("");
		Meteor.call('masai:addNote', template.roomId,val, function(error, result){
			template.notes.set(result);


		});

	}

});
		
window.addEventListener('message', function(e) {
    if (e.data && e.data === 'message_listener_registered') {
		if (!travelfolderWindow || travelfolderWindow.closed) {
			message = null;
			messageListenerRegistered = false;
			return;
		}
		
		messageListenerRegistered = true;
        if (message) {
			travelfolderWindow.postMessage({'msg': message}, "*");
			message = null;
			messageListenerRegistered = false;
		}
    }
}, false);

Template.visitorInfo_travelFolder.onCreated(function() {
	this.visitorId = new ReactiveVar(null);
	this.customFields = new ReactiveVar([]);
	this.action = new ReactiveVar();
	this.user = new ReactiveVar();
	this.notes = new ReactiveVar();

	this.roomId = null;


	var currentData = Template.currentData();

	if (currentData && currentData.rid) {
		var self = this;
		Meteor.call('masai:getNotes',currentData.rid, function(error, result){
			self.notes.set(result);
		});
		this.autorun(() => {
			const room = ChatRoom.findOne(currentData.rid);
			this.roomId = Template.currentData().rid;
			if (room && room.v && room.v._id) {
				this.visitorId.set(room.v._id);
				} else {
				this.visitorId.set();
				}
		});

		this.subscribe('livechat:visitorInfo', { rid: currentData.rid });
	}

	this.autorun(() => {
		this.user.set(Meteor.users.findOne({ '_id': this.visitorId.get() }));

	});
});
