import { Meteor } from 'meteor/meteor';
import { RocketChat } from 'meteor/rocketchat:lib';
import _ from 'underscore';

import LivechatVisitors from '../models/LivechatVisitors';

Meteor.methods({
	'livechat:getInitialData'(visitorToken, departmentId, customerid) {
		const info = {
			enabled: null,
			title: null,
			color: null,
			registrationForm: null,
			room: null,
			visitor: null,
			triggers: [],
			departments: [],
			allowSwitchingDepartments: null,
			online: true,
			offlineColor: null,
			offlineMessage: null,
			offlineSuccessMessage: null,
			offlineUnavailableMessage: null,
			displayOfflineForm: null,
			videoCall: null,
			fileUpload: null,
			conversationFinishedMessage: null,
			nameFieldRegistrationForm: null,
			emailFieldRegistrationForm: null,
			registrationFormMessage: null
		};

		const options = {
			fields: {
				name: 1,
				t: 1,
				cl: 1,
				u: 1,
				usernames: 1,
				v: 1,
				servedBy: 1,
				departmentId: 1,
				origin: 1,
				hpid : 1,
			},
		};
		const room = (departmentId) ? RocketChat.models.Rooms.findOpenByVisitorTokenAndDepartmentId(visitorToken, departmentId, options).fetch() : RocketChat.models.Rooms.findOpenByVisitorToken(visitorToken, options).fetch();
		if (room && room.length > 0) {
			info.room = room[0];
		}

		const visitor = LivechatVisitors.getVisitorByToken(visitorToken, {
			fields: {
				name: 1,
				username: 1,
				visitorEmails: 1,
				department: 1,
			},
		});

		if (room) {
			info.visitor = visitor;
		}
		
		
		let customer = null;
		if (customerid) {
			customer = RocketChat.models.Extconf.findOne({_id:customerid});
		}

		const initSettings = RocketChat.Livechat.getInitSettings();

		info.title = initSettings.Livechat_title;
		info.color = initSettings.Livechat_title_color;
		info.enabled = initSettings.Livechat_enabled;
		info.registrationForm = initSettings.Livechat_registration_form;
		info.offlineTitle = initSettings.Livechat_offline_title;
		info.offlineColor = initSettings.Livechat_offline_title_color;
		info.offlineMessage = initSettings.Livechat_offline_message;
		info.offlineSuccessMessage = initSettings.Livechat_offline_success_message;
		info.offlineUnavailableMessage = initSettings.Livechat_offline_form_unavailable;
		info.displayOfflineForm = initSettings.Livechat_display_offline_form;
		info.language = initSettings.Language;
		info.videoCall = initSettings.Livechat_videocall_enabled === true && initSettings.Jitsi_Enabled === true;
		info.fileUpload = initSettings.Livechat_fileupload_enabled && initSettings.FileUpload_Enabled;
		info.transcript = initSettings.Livechat_enable_transcript;
		info.transcriptMessage = initSettings.Livechat_transcript_message;
		info.conversationFinishedMessage = initSettings.Livechat_conversation_finished_message;
		info.nameFieldRegistrationForm = initSettings.Livechat_name_field_registration_form;
		info.emailFieldRegistrationForm = initSettings.Livechat_email_field_registration_form;
		info.registrationFormMessage = initSettings.Livechat_registration_form_message;

		info.agentData = room && room[0] && room[0].servedBy && RocketChat.models.Users.getAgentInfo(room[0].servedBy._id);

		if (customerid) {
		
			if (customer) {  
				info.registrationForm = customer.register==1 || customer.withname==1;
				info.registrationFormOffline = customer.offlineregister==1;
				info.registerwithmail = customer.register;  
				info.withname = customer.withname;  
				info.nicknameplaceholder = customer.nicknameplaceholder;  
				info.withemail = customer.register;  
				
				info.startmessage = customer.startmessage; 
				info.extracss = customer.extracss; 
				info.colorguest = customer.colorguest;
				info.coloragent = customer.coloragent;
				info.colormessage  = customer.colormessage;
				info.colormessage2  = customer.colormessage2; 
				if (customer.color!=null) {
					info.offlineColor = customer.color;
					info.color = customer.color;
				}
				if (customer.coloroffline!=null) {
				info.offlineColor = customer.coloroffline;
				}
				info.agentLogo = customer.agentLogo;
				info.agentName = customer.agentName;
				
				info.enableClose = customer.enableClose; 
				info.title = customer.display;
				info.titleactive = customer.display;
				info.offlineTitle = customer.displayoffline;
				info.offlineTitleactive = customer.displayoffline;
				info.welcomeMessage = customer.welcomeMessage;  
				info.offlineMessage = customer.greetings2;
				info.offlineSuccessMessage = customer.messagereceived;
				if (customer.offlineregister) {
					info.offlineMessage = customer.greetings;
				}
				if (customer.transcriptMessage) {
					info.transcriptMessage = customer.transcriptMessage;
				}
				info.noun = customer.noun; 
				info.origin = customer.name;
				info.hpid = customer._id;
				if (room && room[0]) {
					RocketChat.models.Rooms.update({_id:room[0]._id}, {
						$set : { 
							origin:customer.name,
							hpid:customer._id
						}
					});
				}
			}
		}

		
		RocketChat.models.LivechatTrigger.findEnabled().forEach((trigger) => {
			info.triggers.push(_.pick(trigger, '_id', 'actions', 'conditions', 'runOnce'));
		});

		RocketChat.models.LivechatDepartment.findEnabledWithAgents().forEach((department) => {
			info.departments.push(department);
		});
		info.allowSwitchingDepartments = initSettings.Livechat_allow_switching_departments;

		info.online = RocketChat.models.Users.findOnlineAgents().count() > 0;
		return info;
	},
});
