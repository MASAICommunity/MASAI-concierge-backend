Template.travelfolder_tpl.helpers({
	journeys(){
        var journeys  =   Template.instance().userJourneys.get();
		return _.sortBy(journeys, 'created').reverse();
	},
	messages() {
		return RocketChat.models.LivechatExternalMessage.findByRoomId(this.rid, {ts: 1});
	},

	userId(){
		const instance = Template.instance();
		if(instance.user.get())
		return Gravatar.hash(instance.user.get()).slice(16);
		else return "";
	},
   number(){
		return Template.instance().numberOfJourneys.get();
   }
});

Template.travelfolder_tpl.events({

	'click .div_result': function(event){
		event.preventDefault();
	const target = 	$(event.currentTarget).parents(".li_result");
	$(event.currentTarget).toggleClass('lightblue');

	},
	'submit .permissions'(event, template) {
		event.stopPropagation();
		event.preventDefault();
		Meteor.call('sendMessage', {
			"_id": Random.id(), "rid": template.roomId, "msg": JSON.stringify({
				"url": "https://ir282jbq9b.execute-api.eu-west-1.amazonaws.com/latest/users/me/access/grants/4f0b6c263ed66619", "payload":
				{ "scope": ["journey", "preference", "personal", "contact"] }
			}) });
	},
	'submit .journeys' (event ,template){
		event.stopPropagation();
		event.preventDefault();

		Meteor.call('masai:getUser',template.roomId, function(error, result){
			if(result){//callback Hell
				template.user.set(result);
				getJourneys(template);
				}
		})



},
	'submit .add-segment' (event, template){
		event.stopPropagation();
		event.preventDefault();
		var target = $(event.target);
		var journey = target.parents('li.li_journey').data('resultindex');
		var currentJourney = $.grep(template.userJourneys.get(), function(e){return e.JourneyId == journey})[0];
		const oldsegments = currentJourney.segments;
		const newsegment = $('form#'+journey);
		var result = {};
		newsegment.find('input.inputsegment').map(function(){
            if($(this).val())
			result[$(this).attr('name')] = $(this).val();
			 });
                if(Object.getOwnPropertyNames(result).length >0){    
		var userId = Gravatar.hash(template.user.get()).slice(16);
		Meteor.call('masai:addSegment',userId, journey,currentJourney.title,oldsegments,result, function(error,result){
			if(error)
				console.log(error);
                         getJourneys(template);
                         $('.add-segment').each(function() {this.reset()}); 
		});}
	},
	'submit .add-journey' (event, template){
		event.stopPropagation();
		event.preventDefault();
		var target = $(event.target);
                $("button.journeyadd").attr("disabled",true);   
		var title = target.parent().find('input.input-journey').val();
		var userId = null;
		var user = template.user.get();
		if (user) {
                        console.log(user);  
			userId = Gravatar.hash(template.user.get()).slice(16);
		}
                console.log("id: " + userId);
		if (userId) {
			Meteor.call('masai:addJourney', userId, title, function (error, result) {
				if (error){
					console.log(error);}
					else {
				target.parent().find('input.input-journey').val("");
 $('.add-segment').each(function() {this.reset()});
               	getJourneys(template);}
			});

		}
	}
});

Template.travelfolder_tpl.onCreated(function () {
	this.visitorId = new ReactiveVar(null);
	this.roomId = null;
	this.user = new ReactiveVar(null);
	this.userJourneys = new ReactiveVar();
	this.autorun(() => {
		this.roomId = Template.currentData().rid;

	});

    	});
Template.travelfolder_tpl.onRendered(function(){
	this.$('.datetime-field').each(function(indx, inputFieldItem) {
		$.datetimepicker.setDateFormatter({
			parseDate: function (date, format) {
				var d = moment(date, format);
				return d.isValid() ? d.toDate() : false;
			},
			formatDate: function (date, format) {
				return moment(date).format(format);
			}
		});
		$(inputFieldItem).datetimepicker({
			dayOfWeekStart: 1,
			format: 'L LT',
			formatTime: 'LT',
			formatDate: 'L',
			validateOnBlur:false // prevent validation to use questionmark as placeholder
		});
	});
this.$(".add-journey").on("submit", function(e){e.preventDefault();});

	}

);
function getJourneys(template){
	var userId = template.user.get();
	if(userId.startsWith('auth0')|| userId.startsWith('google-oauth2')|| userId.startsWith('facebook')|| userId.startsWith('twitter') ||userId.startsWith('linkedin')){
		Meteor.call('masai:getJourneysForUser',Gravatar.hash(userId).slice(16),function(err, result) {
			template.userJourneys.set(result);
            this.$("button.journeyadd").attr("disabled",false);
		}) ;
	}
}
