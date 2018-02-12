import moment from 'moment';

Template.livechatMerge.helpers({
	isReady() {
		return Template.instance().ready.get();
	},
	statistics() {
		return Template.instance().statistics.get();
	},
	user() {
		const user = Template.instance().user.get();
		return user;
	},
	chats() {
		const chats = Template.instance().chats.get();
		return chats; 
	},
	formatDate(datetime, format) {
	 
		// can use other formats like 'lll' too
		return moment(datetime).format(format);
	  
	}
});
Template.livechatMerge.events({
	'click .mergebutton'(event, instance) {
		event.preventDefault();
		len = $(".mergechat:checked").length;
		if (len<=1) {
			return;
		}
		targetValues = [];
		targetValues2 = [];
		optionsV = "";
		$(".mergechat:checked").each(function(idx, item) {
			targetValues.push($(item).data("chat"));
			targetValues2[$(item).data("chat")] = $(item).data("name");
			optionsV = $(item).data("chat");
		});
		swal({
			title: t('Merge_chat'),
			html : true,
			text : t("Merge_chat_desc")+'<br/><fieldset><input type="hidden" id="mergechatid" value="'+optionsV+'"><br/><input type="text" id="mergecomment" style="display:block;"  placeholder="'+t("Merge_chat_comment")+'"></fieldset>',
			showCancelButton: true,
			closeOnConfirm: false
		}, () => {
			inputValue = $("#mergechatid").val();
			if (!inputValue) {
				swal.showInputError(t('Please_provide_chat_id'));
				return false;
			} /* then */

			if (s.trim(inputValue) === '') {
				swal.showInputError(t('Please_provide_chat_id'));
				return false;
			} /* then */
			inputValue2 = $("#mergecomment").val();
			Meteor.call('masai:mergeRoom', inputValue,inputValue2,targetValues, function(error/*, result*/) {
				if (error) {
					return handleError(error);
				}
				swal({
					title: t('Chat_merge'),
					text: t('Chat_merge_successfully'),
					type: 'success',
					timer: 5000,
					showConfirmButton: false
				});
				
				setTimeout(function() {
					location.reload();
				},5200);
			});
		});
	}
});
Template.livechatMerge.onRendered(function() {
	return Tracker.afterFlush(function() {
		SideNav.setFlex('adminFlex');
		return SideNav.openFlex();
	});
});

Template.livechatMerge.onCreated(function() {
	const instance = this;
	this.visitorId = new ReactiveVar(null);
	this.customFields = new ReactiveVar([]);
	this.statistics = new ReactiveVar({});
	this.instances = new ReactiveVar({});
	this.ready = new ReactiveVar(false);
	this.chats = new ReactiveVar();
	this.roomId = null;
	this.user = new ReactiveVar();


	var currentData = Template.currentData();
	currentData.rid = FlowRouter.current().params.code;

	if (currentData && currentData.rid) {
		var self = this;
		Meteor.call('masai:getMergeCandidates',currentData.rid, function(error, result){
			console.log(result);
			self.chats.set(result.listing);
			$("#initial-page-loading").remove();
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
		usr = null;
		usr = Meteor.users.findOne({ '_id': this.visitorId.get() });
		if (usr!=null) {
		this.user.set(usr);
		}
	});
});
