import moment from 'moment';

var message = null;
var messageListenerRegistered = false;
var travelfolderWindow = null;
//const GRANT_URL = 'https://qjchuhm517.execute-api.eu-central-1.amazonaws.com/latest/users/me/access/grants/911d8e9f13d86045';//ef4e96c41922d5af';
const TRAVELFOLDER_URL = 'http://www.journey-concierge.com/';

Template.watson_travelFolder.helpers({
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
	hints() {
		return Template.instance().hints.get();
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

		return room.open
	},

	showTravelfolder() {
		//hide travel folder functionallity on incoming sms requests
		const instance = Template.instance();
		const user = instance.user.get();

		return !(user.phone instanceof Array && user.phone.length > 0);
	},

	guestPool() {
		return RocketChat.settings.get('Livechat_Routing_Method') === 'Guest_Pool';
	}

});

Template.watson_travelFolder.events({
	'click .intentexpander' (event, instance) {
		btn = $(event.target);
		watsonhint = $(btn).parents(".watsonhint");
		$(watsonhint.find(".collapseit")).toggle();
	},
	'click .intermediateWatsonbutton' (event, instance) {
		$("textarea.rc-message-box__textarea").val(Template.instance().intermediateMessage.get());
		$(".rc-message-box__send.js-send").trigger("click");
		var msgs = window.watsonMessages;
		var msg = ""
		if(msgs.length > 0) {
			msg = msgs[msgs.length -1];
		}
		Meteor.call('masai:storeIntermediateWatson', Template.instance().code.get(),msg, function(err, res) {});
	},
	'click .transferWatsonbutton' (event, instance) {
		btn = $(event.target);
		watsonhint = $(btn).parents(".watsonhint");
		txt = watsonhint.find("textarea").val();
		code = watsonhint.data("code");
		txt2 = txt;
		if (txt==null || txt=="") {
			txt = watsonhint.find("p.hintext").text().trim();
		} /* then */

		$("textarea.rc-message-box__textarea").val(txt);
		$(".rc-message-box__send.js-send").trigger("click");
		watsn = watsonhint.data("watson");
		Meteor.call('masai:storeWatson',code,JSON.stringify(watsn),txt2,
			function(err, result) {

			}
		) ;
	},
	'click .customWatsonRequest' (event, instance) {
		textArea = $(".customWatsonText");
		window.customWatsonText = textArea.val();
		checkWatson(Template.currentData().rid);
		/*
		console.log("clicked");
		console.log( this.rid ); */
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


	}



});


Template.watson_travelFolder.onCreated(function() {
	var currentData = Template.currentData();

	this.visitorId = new ReactiveVar(null);
	this.customFields = new ReactiveVar([]);
	this.action = new ReactiveVar();
	this.user = new ReactiveVar();
	this.notes = new ReactiveVar();
	this.hints = new ReactiveVar();
	this.code = new ReactiveVar();
	this.intermediateMessage = new ReactiveVar();
	this.roomId = null;

	window.watsonInstance = this;

	if (currentData && currentData.rid) {
		var self = this;
		Meteor.call('masai:getWatsonIntermediate', function(error, result){
			console.log("Result:", result);
			self.intermediateMessage.set(result);
		});

		this.autorun(() => {
			const room = ChatRoom.findOne(currentData.rid);
			this.code.set(room.code);
			this.roomId = Template.currentData().rid;
			if (room && room.v && room.v._id) {
				this.visitorId.set(room.v._id);
				} else {
				this.visitorId.set();
				}
		});

		this.subscribe('livechat:visitorInfo', { rid: currentData.rid });
	}
	$(".message .body").removeClass("validated");

	this.autorun(() => {
		//ensure that only one instance of the timer is running concurrently
		if(window.watsonTimer) {
			clearInterval(window.watsonTimer);
		}
		window.watsonMessages = [];
		window.customWatsonText = "";

		checkWatson(currentData.rid);
		window.watsonTimer = setInterval(function() {
			checkWatson(currentData.rid);
		}, 1800);
	});

});


function concatAndFilterMessages(messages, guestId) {
	var newMessage = true;
	var curMessage = "";
	var transformedMessages = [];
	messages.forEach(function(message) {
		//append Messages
		if(message.u._id === guestId) {
			//ignore empty and control messages
			if(message.msg !== "" && !message.msg.startsWith("{")) {
				if(newMessage === true) {
					newMessage = false;
					curMessage = message.msg;
				} else {
					curMessage = curMessage + " " + message.msg;
				}
			}
		} else { //admin sent message
			newMessage = true;
			if(curMessage !== "") {
					transformedMessages.push(curMessage);
			}
			curMessage = "";
		}
	});

	//make sure the current message buffer is added to the transformed Messages
	if(curMessage !== "") {
			transformedMessages.push(curMessage);
	}
	return transformedMessages;

}

function checkWatson(roomId) {
	//get local messages
	var currentRoom = RocketChat.models.Rooms.findOne(roomId);
	//bail out if this is not a live chat room
	if(!currentRoom || currentRoom.t !== "l" || !currentRoom.v) {
		return;
	}

	if(!currentRoom.open) {
		window.watsonInstance.hints = [];
		$("#aboutWatson").text(t("Watson_Deactivated"));
		$("#watsonManualRequest").hide();
	}

	var guestId = currentRoom.v._id;
	var messages = RocketChat.models.Messages.find({rid: roomId}).fetch().reverse();
	//transform data, i.e. filter out non guest messages and concat guest messages
	var watsonMessages = concatAndFilterMessages(messages, guestId);

	if(window.customWatsonText && window.customWatsonText !== "") {
		watsonMessages.push(window.customWatsonText);
	}

	//make sure that there has been some kind of change
	if(JSON.stringify(watsonMessages) === JSON.stringify(window.watsonMessages)) {
		return;
	}
	window.watsonMessages = watsonMessages;

	$("#loadinginfo").show();
	Meteor.call('masai:checkWatson',FlowRouter.current().params.code,JSON.stringify(watsonMessages),
	function(err, result) {
		totals =result;
		console.log(totals);
		window.watsonInstance.hints.set(totals);
		$("#loadinginfo").hide();
		setTimeout(function() {
			$($(".collapseit").eq(1)).show();
		}, 350);
	}) ;


	return;

	var wsmgs = [];
	if ($(".message[data-username*=00],.message[data-username*=guest-]").not("own").not(".system").find(".body").not(".validated").length <= 0) {
		return;
	}  /* then */
	var atLeastOne = false;
	/*
	if ($($(".message[data-username*=00],.message[data-username*=guest-]").not(".own").not(".system").find(".body.validated")).last().html()!=null &&
	    $($(".message[data-username*=00],.message[data-username*=guest-]").not(".own").not(".system").find(".body.validated")).last().html().trim()!="") {
		wsmgs.push($($(".message[data-username*=00],.message[data-username*=guest-]").not(".own").not(".system").find(".body.validated")).last().html().trim());
	}
	if ($($(".message[data-username*=00],.message[data-username*=guest-]").not(".own").not(".system").find(".body.validated")).last().prev(".body.validated")!=null &&
	    $($(".message[data-username*=00],.message[data-username*=guest-]").not(".own").not(".system").find(".body.validated")).last().prev(".body.validated").html()!=null &&
		$($(".message[data-username*=00],.message[data-username*=guest-]").not(".own").not(".system").find(".body.validated")).last().prev(".body.validated").html().trim()!="") {
		wsmgs.push($($(".message[data-username*=00],.message[data-username*=guest-]").not(".own").not(".system").find(".body.validated")).last().prev(".body.validated").html().trim());
	} */
	$($(".message[data-username*=00],.message[data-username*=guest-]").not(".own").not(".system").find(".body").not(".validated").get().reverse()).each(function(idx, item) {
		$(item).addClass("validated");
		if ($(item).text().trim()=="") {
			return;
		} /* then */
		if (idx>3) {
			return;
		} /* then */
		wsmgs.push($(item).text().trim());
		atLeastOne = true;
	});
	if (!atLeastOne) {
		return;
	} /* then */
	if (wsmgs.length<=0) {
		return;
	} /* then */
	if (location.href.indexOf("/live/")<=5) {
		return;
	}
	$("#loadinginfo").show();
	Meteor.call('masai:checkWatson',FlowRouter.current().params.code,JSON.stringify(wsmgs),
	function(err, result) {
		totals =result;
		console.log(totals);
		window.watsonInstance.hints.set(totals);
		$("#loadinginfo").hide();
		setTimeout(function() {
			$($(".collapseit").eq(0)).show();
		}, 350);
	}) ;

}

Meteor.startup(function(){
	if(Meteor.isClient){

		$(document).ready(function() {
			$(".message .body .validated").removeClass("validated");
		});
	} /* then */
});
