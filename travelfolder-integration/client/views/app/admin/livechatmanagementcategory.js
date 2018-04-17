import moment from 'moment';

Template.livechatmanagementcategory.helpers({
	isReady() {
		return Template.instance().ready.get();
	},
	user() {
		const user = Template.instance().user.get();
		return user;
	},
	categories() {
		const categories = Template.instance().categories.get();
		return categories;
	},
	formatDate(datetime, format) {
	 	if(datetime) {
			// can use other formats like 'lll' too
			return moment(datetime).format(format);
		}
		else {
			return "";
		}

	},
	formatPercent(per) {
		if(per) {
			// can use other formats like 'lll' too
			return ""+(Math.round(per * 100 * 100) / 100)+"%";
		}
		else {
			return "";
		}

	}
});
Template.livechatmanagementcategory.events({
	'submit #newCategory'(event) {
		Meteor.call('masai:createLCC', $("#categoryName").val(), function(error,result) {
			Meteor.call('masai:findAllLCC2', function(error,result) {
				window.livechatmanagementcategorySelf.categories.set(result);
			});
		});
		event.preventDefault();
	},
	'click .categorydeleter'(event) {
		uid = $(event.target).data("uid");
		Meteor.call('masai:removeLCC', uid, function(error,result) {
			Meteor.call('masai:findAllLCC2', function(error,result) {
				window.livechatmanagementcategorySelf.categories.set(result);
			});
		});
		event.preventDefault();
	},
	'click .categorydisable'(event) {
		uid = $(event.target).data("uid");
		state = $(event.target).data("state");
		Meteor.call('masai:enablerLCC', uid,state==1?0:1, function(error,result) {
			Meteor.call('masai:findAllLCC2', function(error,result) {
				window.livechatmanagementcategorySelf.categories.set(result);
			});
		});
		event.preventDefault();
	}
}); /* events */
Template.livechatmanagementcategory.onRendered(function() {
	return Tracker.afterFlush(function() {
		SideNav.setFlex('adminFlex');
		return SideNav.openFlex();
	});
});

Template.livechatmanagementcategory.onCreated(function() {
	
	const instance = this;
	this.visitorId = new ReactiveVar(null);
	this.customFields = new ReactiveVar([]);
	this.statistics = new ReactiveVar({});
	this.instances = new ReactiveVar({});
	this.ready = new ReactiveVar(false);
	this.chats = new ReactiveVar();
	this.categories = new ReactiveVar();
	this.roomId = null;
	this.user = new ReactiveVar();


	var currentData = Template.currentData();

	if (currentData) {
		window.livechatmanagementcategorySelf = this;

		this.autorun(() => {
			Meteor.call('masai:findAllLCC2', function(error,result) {
				window.livechatmanagementcategorySelf.categories.set(result);
			});
		});

	}

	this.autorun(() => {
		usr = null;
		usr = Meteor.users.findOne({ '_id': this.visitorId.get() });
		if (usr!=null) {
			this.user.set(usr);
		}
	});
});
