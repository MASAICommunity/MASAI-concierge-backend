import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { RocketChat, handleError } from 'meteor/rocketchat:lib';
import { modal, ChatSubscription, KonchatNotification } from 'meteor/rocketchat:ui';
import { t } from 'meteor/rocketchat:utils';
import { LivechatInquiry } from '../../../lib/LivechatInquiry';
import swal from 'sweetalert';

Template.livechat.helpers({
	isActive() {
		const query = {
			t: 'l',
			f: { $ne: true },
			open: true,
			rid: Session.get('openedRoom'),
		};

		const options = { fields: { _id: 1 } };

		if (ChatSubscription.findOne(query, options)) {
			return 'active';
		}
	},

	rooms() {
		const query = {
			t: 'l',
			open: true,
		};

		const user = RocketChat.models.Users.findOne(Meteor.userId(), {
			fields: { 'settings.preferences.sidebarShowUnread': 1 },
		});

		if (RocketChat.getUserPreference(user, 'sidebarShowUnread')) {
			query.alert = { $ne: true };
		}

		return ChatSubscription.find(query, { sort: {
			t: 1,
			fname: 1,
		} });
	},

	inquiries() {
		// get all inquiries of the department
		const inqs = LivechatInquiry.find({
			agents: Meteor.userId(),
			status: 'open',
		}, {
			sort: {
				ts : 1,
			},
		});

		// for notification sound
		inqs.forEach((inq) => {
			KonchatNotification.newRoom(inq.rid);
		});

		return inqs;
	},

	guestPool() {
		return RocketChat.settings.get('Livechat_Routing_Method') === 'Guest_Pool';
	},

	available() {
		const statusLivechat = Template.instance().statusLivechat.get();

		return {
			status: statusLivechat === 'available' ? 'status-online' : '',
			icon: statusLivechat === 'available' ? 'icon-toggle-on' : 'icon-toggle-off',
			hint: statusLivechat === 'available' ? t('Available') : t('Not_Available'),
		};
	},

	isLivechatAvailable() {
		return Template.instance().statusLivechat.get() === 'available';
	},

	showQueueLink() {
		if (RocketChat.settings.get('Livechat_Routing_Method') !== 'Least_Amount') {
			return false;
		}
		return RocketChat.authz.hasRole(Meteor.userId(), 'livechat-manager') || (Template.instance().statusLivechat.get() === 'available' && RocketChat.settings.get('Livechat_show_queue_list_link'));
	},

	activeLivechatQueue() {
		FlowRouter.watchPathChange();
		if (FlowRouter.current().route.name === 'livechat-queue') {
			return 'active';
		}
	},
});

Template.livechat.events({
	'click .livechat-status'() {
		Meteor.call('livechat:changeLivechatStatus', (err /* , results*/) => {
			if (err) {
				return handleError(err);
			}
		});
	},

	'click .inquiries .sidebar-item'(event) {
		if($(event.currentTarget).find(".restarttrigger").length>0) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		const textmessage = t('Message')+": "+this.message;
		console.log(textmessage);
		swal({
				title: t('Livechat_Take_Confirm'),
				text: `${ t('Message') }: ${ this.message }`,
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33', 
				buttons: {
					cancel: true,
					confirm: true
				},
				confirmButtonText: t('Take_it')
			}).then((isConfirm) => { 
				if (isConfirm) {
					Meteor.call('livechat:takeInquiry', this._id, (error, result) => {
						if (!error) {
							RocketChat.roomTypes.openRouteLink(result.t, result);
						}
					});
				}
			});/*
		modal.open({
			title: t('Livechat_Take_Confirm'),
			text: textmessage,
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: t('Take_it'),
		}, (isConfirm) => {
			if (isConfirm) {
				Meteor.call('livechat:takeInquiry', this._id, (error, result) => {
					if (!error) {
						RocketChat.roomTypes.openRouteLink(result.t, result);
					}
				});
			}
		});*/
	},
});

Template.livechat.onCreated(function() {
	this.statusLivechat = new ReactiveVar();

	this.autorun(() => {
		if (Meteor.userId()) {
			const user = RocketChat.models.Users.findOne(Meteor.userId(), { fields: { statusLivechat: 1 } });
			this.statusLivechat.set(user.statusLivechat);
		} else {
			this.statusLivechat.set();
		}
	});

	this.subscribe('livechat:inquiry');
});
