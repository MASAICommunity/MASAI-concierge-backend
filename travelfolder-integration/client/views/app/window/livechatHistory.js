import moment from 'moment';

Template.livechatHistory.helpers({
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
Template.livechatHistory.events({
	'click .liveChatOpenBtn'(event, instance) {
		event.preventDefault();
		tr = $($(event.target).parents(".liveChatOpenRow"));
		code = $(event.target).data("code");
		$(".openerframe").remove();
		tr.after("<tr class='openerframe'><td colspan='7'><iframe src='/live/"+code+"?nosidebar=1' style='width:100%;height: 600px;'></iframe></td></tr>")
	}, /* click */
	'submit #searchForm'(event, instance) {
		event.preventDefault();
		meMySelfAndI = instance;
		Meteor.call('masai:chatHistory',FlowRouter.current().params.code, 
			{
				
				category:$("#lccategory").val(),
				text:$("#textsearch").val(),
				code:$("#chatid").val(),
				date:$("#datesearch").val()
			}, function(error, result){
			console.log(result);
			meMySelfAndI.chats.set(result.listing);
		});
	}
}); /* events */
Template.livechatHistory.onRendered(function() {
	
	return Tracker.afterFlush(function() {
		SideNav.setFlex('adminFlex');
		return SideNav.openFlex();
	});
});

Template.livechatHistory.onCreated(function() {
	setInterval(function() {
		try { $($($(".openerframe iframe").eq(0)[0].contentWindow.document).find(".sidebar")).remove(); }
		catch(ex) {}
	},250);
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

	window.livechatHistory = this;
	
	Meteor.call('masai:findAllLCC', function(error, result){
		window.livechatHistory.categories = result;
		optionsV = "<option value=''> - </option>";
		$(window.livechatHistory.categories).each(function(idx, item) {
			optionsV += "<option value='"+item.name+"'>"+item.name+"</option>";
		});
		$("#lccategory").html(optionsV);
	});
	if (currentData && currentData.rid) {
		var self = this;
		
		
		
		Meteor.call('masai:chatHistory',currentData.rid, {}, function(error, result){
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
