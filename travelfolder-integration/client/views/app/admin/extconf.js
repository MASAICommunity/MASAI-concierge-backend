import moment from 'moment';
import swal from 'sweetalert';
import s from 'underscore.string';

import { Template } from 'meteor/templating';
import { RocketChat } from 'meteor/rocketchat:lib';
import { t } from 'meteor/rocketchat:utils';
Template.extconf.helpers({
	baseurl() {
		return s.rtrim(RocketChat.settings.get('Site_Url'), '/');
	},
	isReady() {
		return Template.instance().ready.get();
	},
	user() {
		const user = Template.instance().user.get(); 
		return user;
	},
	partners() {
		const partners = Template.instance().partners.get();
		return partners; 
	},
	categories() {
		const categories = Template.instance().categories.get();
		return categories; 
	},
	
	iscatchecked(category, partner) {
		if (partner.categories) {
			if (partner.categories.includes(category)) {
				return 'selected';
			}
		}
		return '';
	},
	stripnewline(tx) {
		return tx?tx.split("\n").join(""):"";
	},
	formatDate(datetime, format) {
		return datetime?moment(datetime).format(format):"";
	},
	formatPercent(per) {
	 
		// can use other formats like 'lll' too
		return ""+(Math.round(per * 100 * 100) / 100)+"%";
	  
	}
});
Template.extconf.events({
	'submit #createFormPartner'(event) {
		event.preventDefault();
		Meteor.call('masai:createPartner',
		$("#partnerName").val(), $("#partnerDomain").val(),function(error, result){
			
			window.partnerSelf.partners.set(result);
			$("#initial-page-loading").remove();
		});
	},
	
	'click .hapaexpand' (event) {
		
		hapaSetting = $(event.currentTarget).attr("data-uid");
		$(".hapaSetting[data-uid='"+hapaSetting+"']").toggle();
	},
	'click .saveAsso' (event) {
		order = $(event.currentTarget).attr("data-uid");
		var at = 101;
		try {
			at = parseInt($("[name='autotrigger_"+order+"']").val());
		} catch(ex) {
			
		}
		var count = null;
		try { 
			count = parseInt($("[name='maxRep_"+order+"']").val());
		} catch(ex) {
			count = null;
		}
		let cat = [];
		cat = $("[name='category_"+order+"']").val();/*.each(function(idx, item) {
			cat.push($(item).val());
		});*/
		data = {//  
			"categories": cat,
			
			"transcriptMessage": $("[name='transcriptMessage_"+order+"']").val(),
			"closeMessageCustomer": $("[name='closeMessageCustomer_"+order+"']").val(),
			"questionbackground": $("[name='questionbackground_"+order+"']").val(),
			"questioncolor": $("[name='questioncolor_"+order+"']").val(),
			"moreQuestions": $("[name='moreQuestions_"+order+"']").val(),
			"extracss": $("[name='extracss_"+order+"']").val(),
			"closemin": $("[name='closemin_"+order+"']").val(),
			"greet": $("[name='greet_"+order+"']").val(),
			"startmessage": $("[name='startmessage_"+order+"']").val(),
			"intermediate": $("[name='intermediate_"+order+"']").val(),
			"messagereceived": $("[name='messagereceived_"+order+"']").val(),
			"welcomeMessage": $("[name='welcomeMessage_"+order+"']").val(),
			"headertitle": $("[name='headertitle_"+order+"']").val(),
			"autoagent": $("[name='autoagent_"+order+"']").val(),
			"agentName": $("[name='agentName_"+order+"']").val(),
			"agentLogo": $("[name='agentLogo_"+order+"']").val(),
			"name": $("[name='name_"+order+"']").val(),   
			"domain": $("[name='domain_"+order+"']").val(),
			"enableClose": $("[name='enableClose_"+order+"']").is(":checked")?1:0,
			"offlineregister": $("[name='offlineregister_"+order+"']").is(":checked")?1:0, 
			"showCallTwoAction": $("[name='showCallTwoAction_"+order+"']").is(":checked")?1:0,
			"showNoButton": $("[name='showNoButton_"+order+"']").is(":checked")?1:0,
			"showNoOverlay": $("[name='showNoOverlay_"+order+"']").is(":checked")?1:0,
			"sendChatId": $("[name='sendChatId_"+order+"']").is(":checked")?1:0,
			"noun": $("[name='noun_"+order+"']").is(":checked")?1:0, 
			"display": $("[name='display_"+order+"']").val(),
			"displayoffline": $("[name='displayoffline_"+order+"']").val(),
			"color": $("[name='color_"+order+"']").val(),
			"coloroffline": $("[name='coloroffline_"+order+"']").val(),
			"register": $("[name='register_"+order+"']").is(":checked")?1:0,
			"greetings": $("[name='greetings_"+order+"']").val(),
			"greetings2": $("[name='greetings2_"+order+"']").val(),
			"infomessage": $("[name='infomessage_"+order+"']").val(),
			"withname": $("[name='withname_"+order+"']").is(":checked")?1:0,
			"nicknameplaceholder": $("[name='nicknameplaceholder_"+order+"']").val(), 
			"transfermessage": $("[name='transfermessage_"+order+"']").val(),
			"coloragent": $("[name='coloragent_"+order+"']").val(),
			"colorguest": $("[name='colorguest_"+order+"']").val(),
			"colormessage": $("[name='colormessage_"+order+"']").val(),
			"colormessage2": $("[name='colormessage2_"+order+"']").val(),
			"transferuser": $("[name='transferuser_"+order+"']").val(),
			"autotrigger": at,//  
			"maxRep": count,//  
			"showwatson": $("[name='showwatson_"+order+"']").is(":checked")?1:0,
			"watsonchannel": $("[name='watsonchannel_"+order+"']").val(),
			"watsonendpoint": $("[name='watsonendpoint_"+order+"']").val(),
			"watsonuser": $("[name='watsonuser_"+order+"']").val(),
			"watsonpass": $("[name='watsonpass_"+order+"']").val(),
			"watsonskillid": $("[name='watsonskillid_"+order+"']").val(),
		};
		Meteor.call('masai:saveExtconf',order,data, function(error, result){
			Meteor.call('masai:getPartners',function(error, result){
				window.partnerSelf.partners.set(result.partners);
				window.partnerSelf.categories.set(result.categories);
				$("#initial-page-loading").remove();
			});
		});
	},
	
	'click .copyId' (event) {
		order = $(event.currentTarget).attr("data-uid");
		const str = order;
		
		const el = document.createElement('textarea');
		  el.value = str;
		  document.body.appendChild(el);
		  el.select();
		  document.execCommand('copy');
		  document.body.removeChild(el);
		  
		  swal({
			text: 'HaPa-ID erfolgreich in die Zwischenablage kopiert',
			buttons: {
				confirm: true
			  },
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: t('OK')
		}).then((ok) => {
		  
		});
	},
	'click .htmlcopy' (event) {
		order = $(event.currentTarget).attr("data-uid");
		const str = $("[name='code_"+order+"']").html();
		const unescapeHTML = function(str) {
			return str.replace(/&[#\w]+;/g, function (s) {
				var entityMap = {
					"&amp;": "&",
					"&lt;": "<",
					"&gt;": ">",
					'&quot;': '"',
					'&#39;': "'",
					'&#x2F;': "/"
				};

				return entityMap[s];
			});
		};
		
		const el = document.createElement('textarea');
		  el.value = unescapeHTML(str);
		  document.body.appendChild(el);
		  el.select();
		  document.execCommand('copy');
		  document.body.removeChild(el);
		  
		  swal({
			text: 'HTML erfolgreich in die Zwischenablage kopiert',
			buttons: {
				confirm: true
			  },
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: t('OK')
		}).then((ok) => {
		  
		});
	},
	'click .deleteAsso' (event) {
		order = $(event.currentTarget).attr("data-uid");
		Meteor.call('masai:deleteExtconf',order, function(error, result){
			Meteor.call('masai:getPartners',function(error, result){
				window.partnerSelf.partners.set(result);
				$("#initial-page-loading").remove();
			});
		});
	}
}); /* events */
Template.extconf.onRendered(function() {
	return Tracker.afterFlush(function() {
		SideNav.setFlex('adminFlex');
		return SideNav.openFlex();
	});
});

Template.extconf.onCreated(function() {
	
	const instance = this;
	this.visitorId = new ReactiveVar(null);
	this.customFields = new ReactiveVar([]);
	this.statistics = new ReactiveVar({});
	this.instances = new ReactiveVar({});
	this.ready = new ReactiveVar(false);
	this.partners = new ReactiveVar();
	this.categories = new ReactiveVar();
	this.roomId = null;
	this.baseurl = new ReactiveVar(null);
	this.baseurl.set(s.rtrim(RocketChat.settings.get('Site_Url'), '/'));
	this.user = new ReactiveVar();


	var currentData = Template.currentData();

	if (currentData) {
		window.partnerSelf = this;
		
		this.autorun(() => {
			Meteor.call('masai:getPartners',null, null, function(error, result){
				window.partnerSelf.partners.set(result.partners);
				window.partnerSelf.categories.set(result.categories);
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
