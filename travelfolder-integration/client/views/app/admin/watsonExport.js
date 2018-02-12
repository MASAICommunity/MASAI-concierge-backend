import moment from 'moment';

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
		$("#datesearchWatson2").val()==null || $("#datesearchWatson2").val()==""?null:new Date($("#datesearchWatson2").val()), function(error, result){
			console.log(result);
			window.watsonExportSelf.chats.set(result);
			$("#initial-page-loading").remove();
		});
	},
	'click #buttonWatsonDownload' (event) {
		order = $("#chatidWatson").val();
		date = $("#datesearchWatson").val();
		date2 = $("#datesearchWatson2").val();
			window.open('watsoncsvdownload/'+(order)+"/"+date+"/"+date2,"_blank");
	},
	'click #buttonClearFilter' (event) {
		$("#chatidWatson").val(null);
		$("#datesearchWatson").val(null);
		$("#datesearchWatson2").val(null);
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
