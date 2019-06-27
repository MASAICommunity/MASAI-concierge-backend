import moment from 'moment';
import swal from 'sweetalert';

import { Template } from 'meteor/templating';
import { RocketChat } from 'meteor/rocketchat:lib';
import { t } from 'meteor/rocketchat:utils';
Template.watsonExport.helpers({
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
	 	if(datetime) {
			// can use other formats like 'lll' too
			return moment(datetime).format(format);
		}
		else {
			return "";
		}

	},
	
	duration(dur) {
		if (dur===0) {
			return "0:00:00"; 
		}
		if (dur) {
			var d = moment.duration(dur);
			var s = Math.floor(d.hours())+":"+Math.floor(d.minutes()) + ":"+Math.floor(d.seconds());
			return s;
		}
		return "";
	},
	diffDate(startAt, endDate) {
	 	if(startAt) {
		} else {
			return "";
		}
	 	if(endDate) {
			var ms = moment(endDate).diff(moment(startAt));
			var d = moment.duration(ms);
			var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
			// can use other formats like 'lll' too
			return s;
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
Template.watsonExport.events({
	'submit #searchFormWatson'(event) {
		event.preventDefault();
		Meteor.call('masai:botResults',
		$("#chatidWatson").val(), $("#datesearchWatson").val()==null || $("#datesearchWatson").val()==""?null:new Date($("#datesearchWatson").val()),
		$("#datesearchWatson2").val()==null || $("#datesearchWatson2").val()==""?null:new Date($("#datesearchWatson2").val()),
		$("#dienst").val()==null || $("#dienst").val()==""?null:$("#dienst").val(),
		$("#chatcategory").val()==null || $("#chatcategory").val()==""?null:$("#chatcategory").val(),
		 function(error, result){
			console.log(result);
			window.watsonExportSelf.chats.set(result);
			$("#initial-page-loading").remove();
		});
	},
	'click #buttonWatsonDownload' (event) {
		order = $("#chatidWatson").val();
		date = $("#datesearchWatson").val();
		date2 = $("#datesearchWatson2").val();
		dienst = $("#dienst").val();
		chatcategory = $("#chatcategory").val();
			window.open('watsoncsvdownload?order='+(order)+"&date1="+date+"&date2="+date2+"&service="+dienst+"&category="+chatcategory,"_blank");
	},
	'click #buttonClearFilter' (event) {
		$("#chatidWatson").val(null);
		$("#datesearchWatson").val(null);
		$("#datesearchWatson2").val(null);
		$("#dienst").val(null);
	},
	'click #buttonClearCache' (event) {
		Meteor.call('masai:clearWatsonCache', function(error, result){
			swal({
				title: 'Watson Cache',
				text: 'Cache wurde erfolgreich geleert',
				type: 'success',
				timer: 1000,
				showConfirmButton: false
			});
		});
	}
}); /* events */
Template.watsonExport.onRendered(function() {
	return Tracker.afterFlush(function() {
		SideNav.setFlex('adminFlex');
		return SideNav.openFlex();
	});
});

Template.watsonExport.onCreated(function() {
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

	if (currentData) {
		window.watsonExportSelf = this; 
		Meteor.call('masai:getHapaAssos', function(error, result){
			optionsV = "<option value=''> - </option>";
			$(result).each(function(idx, item) {
				optionsV += "<option value='"+item.name+"'>"+item.name+"</option>";
			});
			$("#dienst").html(optionsV);
		});
		Meteor.call('masai:findAllLCC2', function(error, result){ 
			optionsV = "<option value=''> - </option>";
			optionsV += "<option value='"+RocketChat.settings.get('Reisebuddy_WATSON_AUTOPROCESSING_CATEGORY')+"'> "+RocketChat.settings.get('Reisebuddy_WATSON_AUTOPROCESSING_CATEGORY')+" </option>";
			$(result).each(function(idx, item) {
				optionsV += "<option value='"+item.name+"'>"+item.name+"</option>";
			});
			$("#chatcategory").html(optionsV);
		});
		this.autorun(() => {
			Meteor.call('masai:botResults',null, null, function(error, result){
				console.log(result);
				window.watsonExportSelf.chats.set(result);
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
