import moment from 'moment';
import swal from 'sweetalert';
import { Template } from 'meteor/templating';
import { RocketChat } from 'meteor/rocketchat:lib';
import { t } from 'meteor/rocketchat:utils';
import { modal, ChatRoom } from 'meteor/rocketchat:ui';

var message = null;
var messageListenerRegistered = false;
var travelfolderWindow = null;
//const GRANT_URL = 'https://qjchuhm517.execute-api.eu-central-1.amazonaws.com/latest/users/me/access/grants/911d8e9f13d86045';//ef4e96c41922d5af';
var GRANT_URL = 'https://qjchuhm517.execute-api.eu-central-1.amazonaws.com/latest/users/me/access/grants/ce244c43eec449f0';
var TRAVELFOLDER_URL = 'http://www.journey-concierge.com/';

Template.visitorInfo_travelFolder.helpers({
	user() {
		const user = Template.instance().user.get();
		return user;
	},
	
	phone () {
		if (Template.instance().vx.get() == null) {
			return;
		}
		return Template.instance().vx.get().phone;
	},
	visitorPhone () {
		if (Template.instance().vx.get() == null || Template.instance().vx.get().phone == null || Template.instance().vx.get().phone.length == 0) {
			return;
		}
		return Template.instance().vx.get().phone[0];
	},
	vx () {
		return Template.instance().vx.get();
	},
	
	
	visitorEmail () {
		if (Template.instance().vx.get() == null || Template.instance().vx.get().visitorEmails == null || Template.instance().vx.get().visitorEmails.length == 0) {
			return; 
		}
		return Template.instance().vx.get().visitorEmails[0];
	},
	visitorEmails () {
		if (Template.instance().vx.get() == null || Template.instance().vx.get().visitorEmails == null || Template.instance().vx.get().visitorEmails.length == 0) {
			return;
		}
		return Template.instance().vx.get().visitorEmails;
	},
	
	ip () {
		if (Template.instance().vx.get() == null) {
			return;
		}
		return Template.instance().vx.get().ip;
	},
	
	userAgent () {
		if (Template.instance().vx.get() == null) {
			return;
		}
		return Template.instance().vx.get().userAgent;
	},
	
	formatDate(datetime, format) {
	 
		// can use other formats like 'lll' too
		return moment(datetime).format(format);
	  
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
		if (!room) {
			return false;
		}
		return room.open
	},

	showTravelfolder() {
		//hide travel folder functionallity on incoming sms requests
		const instance = Template.instance();
		const user = instance.user.get(); 
		return user!=null;
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
		if (RocketChat.authz.hasRole(Meteor.userId(), 'admin')) {
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
	'click .travelfolder-restart' (event, instance) {
		event.preventDefault();
		var el = document.createElement("div");
		el.innerHTML = t("Restart_desc")+'<br/><fieldset><input type="datetime-local" id="restartdate" style="display:block;"  placeholder="'+t("Restart_date")+'"> '+
			'<input type="text" id="restartReason" style="display:block;"  placeholder="'+t("Restart_reason")+'"></fieldset>';
		swal({
			title: t('Restart_title'),
			html : true,
			content : el,
			buttons: {
				cancel: true,
				confirm: true
			  },
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: t('Yes'),
			closeOnConfirm: false
		}).then((ok)=>{
			if (ok) {
				restartDate = $("#restartdate").val();

				if (restartDate==null || restartDate=="") {
					
					swal({
						title: t('Error'),
						text: t('Provide_restart_date'),
						type: 'error',
						timer: 5000,
						showConfirmButton: false
					});
					return false;
				} /* then */

				restartReason = $("#restartReason").val();
				if (restartReason==null || restartReason=="") {
					swal({
						title: t('Error'),
						text: t('Provide_restart_reason'),
						type: 'error',
						timer: 5000,
						showConfirmButton: false
					});
					return false;
				} /* then */
				now = new Date();
				$lastDate = new Date(new Date(restartDate).getTime() + 0 * now.getTimezoneOffset() * 60000);
				Meteor.call('masai:remark', instance.roomId,$lastDate.toISOString(),restartReason, function(error, result){
					swal({
						title: t('Chat_remarked'),
						text: t('Chat_remarked_successfully'),
						type: 'success',
						timer: 1000,
						showConfirmButton: false
					});
					setTimeout(function() {
						RocketChat.tf.syncDelayed ();
						Session.set('openedRoom');
						FlowRouter.go('/home');
					}, 1100);
				});
			}
		});
	},
	
	'click .close-wlivechat'(event) {
		event.preventDefault();
		optionsV = "";
		$(window.visitorInfo_travelFolderSelf.categories).each(function(idx, item) {
			optionsV += "<option value='"+item.name+"'>"+item.name+"</option>";
		});
		var el = document.createElement("div");
		el.innerHTML = t("Please_add_a_comment_desc")+'<br/><fieldset><select class="p-10 full-width" type="text" id="closechatid" '+
			' style="display:block;margin-top:10px;" placeholder="'+t("Closereason")+'">'+optionsV+
			'</select><br/></fieldset>';
		swal({
			title: t('Closing_chat'),
			html : true,
			content : el,
			buttons: {
				cancel: true,
				confirm: true
			  },
			closeOnConfirm: false
		}).then((ok) => {
			if (ok) {
				inputValue = $("#closecomment").val();
				inputValue2 = $("#closechatid").val(); 

				Meteor.call('masai:closeRoom2', this.rid, inputValue,inputValue2, function(error/*, result*/) {
					if (error) {
						return handleError(error);
					}
					swal({
						title: t('Chat_closed'),
						text: t('Chat_closed_successfully'),
						type: 'success',
						timer: 1000
					});
				});
			}
		});
	},
	'click .close-livechat'(event) {
		event.preventDefault();
		optionsV = "";
		$(window.visitorInfo_travelFolderSelf.categories).each(function(idx, item) {
			optionsV += "<option value='"+item.name+"'>"+item.name+"</option>";
		});
		var el = document.createElement("div");
		el.innerHTML = t("Please_add_a_comment_desc")+'<br/><fieldset><select class="p-10 full-width" type="text" id="closechatid" '+
			' style="display:block;margin-top:10px;" placeholder="'+t("Closereason")+'">'+optionsV+
			'</select><br/></fieldset>';
		swal({
			title: t('Closing_chat'),
			html : true,
			content : el,
			buttons: {
				cancel: true,
				confirm: true
			  },
			closeOnConfirm: false
		}).then((ok) => {
			if (ok) {
				inputValue = $("#closecomment").val();
				inputValue2 = $("#closechatid").val();

				Meteor.call('masai:closeRoom', this.rid, inputValue,inputValue2, function(error/*, result*/) {
					if (error) {
						return handleError(error);
					}
					swal({
						title: t('Chat_closed'),
						text: t('Chat_closed_successfully'),
						type: 'success',
						timer: 1000
					});
				});
			}
		});

	},

	'click .return-inquiry'(event) {
		event.preventDefault();

		swal({
			text : t('Would_you_like_to_return_the_inquiry'),
			buttons: {
				cancel: true,
				confirm: true
			  },
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: t('Yes')
		}).then((ok) => {
		  if (ok) {
			Meteor.call('masai:returnAsInq', this.rid, null, function(error/*, result*/) {
				if (error) {
					console.log(error);
				} else {
					Session.set('openedRoom');
					FlowRouter.go('/home');
				}
			});
		  }
		});
	},

	'click .forward-livechat'(event, instance) {
		event.preventDefault();

		instance.action.set('forward');
	},
	'click #travelfolder2' (event, instance) {
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

		order = FlowRouter.current().params.code;
		travelfolderWindow =
			window.open(TRAVELFOLDER_URL + 'redirect2.html?chatid='+(order), 'com_journey_concierge', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

		Meteor.call('masai:getJWT',instance.roomId,function(err, result) {
			if (!travelfolderWindow || travelfolderWindow.closed) {
				message = null;
				messageListenerRegistered = false;
				return;
			}

			if (result.user) {
				result.userId = Gravatar.hash(result.user).slice(16);
			}
			result.code = FlowRouter.current().params.code;
			message = result;

			if (messageListenerRegistered) {
				travelfolderWindow.postMessage({'msg': message}, "*");
				message = null;
				messageListenerRegistered = false;
			}
		});

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
	'click .travelfolder-merge' (event, instance) {
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

		mergefolderWindow =
			window.open("livechatmerge/"+instance.roomId, 'com_journey_concierge', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

		//mergefolderWindow.document.write("<html>here we go</html>");

	},


	'click .travelfolder-history' (event, instance) {
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

		mergefolderWindow =
			window.open("livechathistory/"+instance.roomId, 'com_journey_concierge', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

		//mergefolderWindow.document.write("<html>here we go</html>");

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


window.addEventListener('room-opened', function(e) {
	try{
		
		var id = window.location.href.substr(window.location.href .lastIndexOf('/') + 1);
		var room = RocketChat.models.Rooms.findOne({_id: id});

		if(room && room.fname){
			setTimeout(function() {
				$(".room-title").text(room.label + " - " + room.fname)
			}, 1000);
		} 
		try {
			
			
			if (room.open && $(".active button[aria-label='Watson']").length <= 0) {
				
				Meteor.call('masai:getRoom',room._id, function(error, roomx){
					
					if (roomx && roomx.hp && roomx.hp.showwatson) {
					$("button[aria-label='Watson']").click();
					}
				});
			}
			
		}
		catch(ex) {
			
		}
	}
	catch(e) {
		console.log("error", e);
	}
});

Template.visitorInfo_travelFolder.onCreated(function() {
	this.visitorId = new ReactiveVar(null);
	this.customFields = new ReactiveVar([]);
	this.action = new ReactiveVar();
	this.user = new ReactiveVar();
	this.notes = new ReactiveVar();
	this.vx = new ReactiveVar();

	this.roomId = null;


	var currentData = Template.currentData();
	
	if (currentData && currentData.rid) {
		var self = this;
		window.visitorInfo_travelFolderSelf = this;
		Meteor.call('masai:getNotes',currentData.rid, function(error, result){
			self.notes.set(result);
		});
		this.autorun(() => {
			const room = ChatRoom.findOne(currentData.rid);
			console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
			console.log(room);
			console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
			this.roomId = Template.currentData().rid;
			
		Meteor.call('masai:findAllLCC', currentData.rid, function(error, result){
			window.visitorInfo_travelFolderSelf.categories = result;
		});
			if (room && room.v && room.v._id) {
				self.visitorId.set(room.v._id);
				if (self.user.get()==null) {
					self.user.set(Meteor.users.findOne({ '_id': self.visitorId.get() }));
				}
				if (self.user.get()==null) {
					Meteor.call('masai:getUser2',currentData.rid, function(error, result){
						self.vx.set(result);
						self.user.set(result);
					});
				}
				else {
					self.vx.set(self.user.get());
				}
			} else {
			self.visitorId.set();
			}
		});

		this.subscribe('livechat:visitorInfo', { rid: currentData.rid });
	}

});

Meteor.startup(function(){
	if(Meteor.isClient){
		$(document).ready(function() {
			Meteor.call('masai:retrieveAPI2',JSON.stringify([]),
				function(err, result) {
				GRANT_URL = result;
			}) ;
			
			Meteor.call('masai:retrieveAPI3',function(error, result){
				TRAVELFOLDER_URL = result;
			});
		});
	}
});
