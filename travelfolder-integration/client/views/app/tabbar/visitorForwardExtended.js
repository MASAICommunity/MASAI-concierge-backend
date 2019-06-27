import toastr from 'toastr';
import swal from 'sweetalert';

import { Template } from 'meteor/templating';
import { RocketChat } from 'meteor/rocketchat:lib';
import { t } from 'meteor/rocketchat:utils';
import { modal, ChatRoom } from 'meteor/rocketchat:ui';
import { LivechatDepartment } from 'meteor/rocketchat:livechat';
import { AgentUsers } from 'meteor/rocketchat:livechat';

Template.visitorForwardExtended.helpers({
	visitor() {
		return Template.instance().visitor.get();
	},
	hasDepartments() {
		return LivechatDepartment.find({ enabled: true }).count() > 0;
	},
	departments() {
		return LivechatDepartment.find({ enabled: true });
	},
	agents() {
		return AgentUsers.find({ _id: { $ne: Meteor.userId() } }, { sort: { name: 1, username: 1 } });
	},
	agentName() {
		return this.name || this.username;
	}
});

Template.visitorForwardExtended.onCreated(function() {
	this.visitor = new ReactiveVar();
	this.room = new ReactiveVar();

	this.autorun(() => {
		this.visitor.set(Meteor.users.findOne({ _id: Template.currentData().visitorId }));
	});

	this.autorun(() => {
		this.room.set(ChatRoom.findOne({ _id: Template.currentData().roomId }));
	});

	this.subscribe('livechat:departments');
	this.subscribe('livechat:agents');
});


Template.visitorForwardExtended.events({
	'submit form'(event, instance) {
		event.preventDefault();

		const transferData = {
			roomId: instance.room.get()._id
		};

		if (instance.find('#forwardUser').value) {
			transferData.userId = instance.find('#forwardUser').value;
		} else if (instance.find('#forwardDepartment').value) {
			transferData.departmentId = instance.find('#forwardDepartment').value;
		}
    
    /*
    if(instance.find('#forwardMessage').value) {
      transferData.comment = instance.find('#forwardMessage').value;
    }*/

		Meteor.call('masai:transfer', transferData, (error, result) => {
			if (error) {
				toastr.error(t(error.error));
			} else if (result) {
				this.save();
				toastr.success(t('Transferred'));
				FlowRouter.go('/');
			} else {
				toastr.warning(t('No_available_agents_to_transfer'));
			}
		});
	},

	'change #forwardDepartment, blur #forwardDepartment'(event, instance) {
		if (event.currentTarget.value) {
			instance.find('#forwardUser').value = '';
		}
	},

	'change #forwardUser, blur #forwardUser'(event, instance) {
		if (event.currentTarget.value) {
			instance.find('#forwardDepartment').value = '';
		}
	},

	'click .cancel'(event) {
		event.preventDefault();

		this.cancel();
	}
});
