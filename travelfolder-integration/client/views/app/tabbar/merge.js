import moment from 'moment';

var message = null;
var messageListenerRegistered = false;
var travelfolderWindow = null;
//const GRANT_URL = 'https://qjchuhm517.execute-api.eu-central-1.amazonaws.com/latest/users/me/access/grants/911d8e9f13d86045';//ef4e96c41922d5af';
var GRANT_URL = 'https://qjchuhm517.execute-api.eu-central-1.amazonaws.com/latest/users/me/access/grants/ce244c43eec449f0';


Template.merge_travelFolder.helpers({
	user() {
		const user = Template.instance().user.get();
		return user;
	},


});

Template.merge_travelFolder.events({
	'click .edit-livechat'(event, instance) {
		event.preventDefault();

		instance.action.set('edit');
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

Template.merge_travelFolder.onCreated(function() {
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

Meteor.startup(function(){
	if(Meteor.isClient){
		$(document).ready(function() {
			Meteor.call('masai:retrieveAPI',JSON.stringify([]),
			function(err, result) {
				console.log(result);
				GRANT_URL = result;
			});
			
		});
	}
});
