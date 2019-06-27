import moment from 'moment';
import swal from 'sweetalert';

import { Template } from 'meteor/templating';
import { RocketChat } from 'meteor/rocketchat:lib';
import { t } from 'meteor/rocketchat:utils';
Template.phone.helpers({
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
Template.phone.events({
	'submit #createFormPhone'(event) {
		event.preventDefault();
		Meteor.call('masai:createPhoneAsso',
		$("#phoneName").val(), $("#phoneNum").val(),
		$("#phoneDept").val(),$("#phoneGreetings").val(), $("#phoneInterfacet").val(),$("#hpid").val(),function(error, result){
			
			window.phoneSelf.chats.set(result);
			$("#initial-page-loading").remove();
		});
	},
	'click .deleteAsso' (event) {
		order = $(event.currentTarget).attr("data-uid");
		Meteor.call('masai:deletePhoneasso',order, function(error, result){
			Meteor.call('masai:getPhoneAssos',function(error, result){
				window.phoneSelf.chats.set(result);
				$("#initial-page-loading").remove();
			});
		});
	}
}); /* events */
Template.phone.onRendered(function() {
	return Tracker.afterFlush(function() {
		SideNav.setFlex('adminFlex');
		return SideNav.openFlex();
	});
});

Template.phone.onCreated(function() {
	
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
		window.phoneSelf = this;
		
		this.autorun(() => {
			Meteor.call('masai:getPhoneAssos',null, null, function(error, result){
				window.phoneSelf.chats.set(result);
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
