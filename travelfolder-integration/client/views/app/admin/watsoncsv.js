import moment from 'moment';

Template.watsoncsv.helpers({
	isReady() {
		return Template.instance().ready.get();
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
		return moment(datetime).format(format);
	},
	formatPercent(per) {
	 
		// can use other formats like 'lll' too
		return ""+(Math.round(per * 100 * 100) / 100)+"%";
	  
	}
});
Template.watsoncsv.events({
}); /* events */
Template.watsoncsv.onRendered(function() {
	return Tracker.afterFlush(function() {
		return SideNav.openFlex();
	});
});

Template.watsoncsv.onCreated(function() {
	
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

	if (currentData) {
		window.watsoncsvSelf = this;
		
		this.autorun(() => {
			Meteor.call('masai:botResults2',null, null, function(error, result){
				window.watsoncsvSelf.chats.set(result);
				$("#initial-page-loading").remove();
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
