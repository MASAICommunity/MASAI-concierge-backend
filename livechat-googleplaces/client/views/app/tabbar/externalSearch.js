const API_URL = "https://qjchuhm517.execute-api.eu-central-1.amazonaws.com/latest";

for (var tpl in Template) {
	if (Template.hasOwnProperty(tpl) && tpl.startsWith('dynamic_redlink_')) {
		Template[tpl].onRendered(function () {
			this.$('.field-with-label').each(function(indx, wrapperItem) {
				const inputField = $(wrapperItem).find(".knowledge-base-value");
				$(wrapperItem).find(".icon-cancel").data("initValue", inputField.val());
			});
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
		});
	}
}
Meteor.startup(function(){
	if(Meteor.isClient){
	$(document).ready(function() {
		var observer = new MutationObserver( function(mutations, observer) {

 $("li.message >div:contains('" + API_URL + "')").html(function(index,html){                                         return html.replace(/{(.*)}/, '<p><i>asked for permission</i></p>');                                 })      ;
 $('button.user.user-card-message.color-primary-font-color:contains("guest")').text($('.room-title').text());
     $("li.message >div:contains('denied')").html(function(index,html){                                         return html.replace(/{(.*)}/, '<p><i>permission denied</i></p>');                                 })      ;
$("li.message >div:contains('granted')").html(function(index,html){                                         return html.replace(/{(.*)}/, '<p><i>permission granted</i></p>');                                 })      ;

if($("li.message >div:contains('html_attributions')").length > 0){
				$("li.message >div:contains('html_attributions')").html(function(index, txt) {
					var json = txt.match(/({.*})/)[0].replace(/<a[^>]*>([^<]*)<\/a>/g,"$1");

 					var val=JSON.parse(json);
                    if(val.html_attributions.length > 0)
					return "<p><i>suggestions sent</i></p>" + val.html_attributions.map(function(e){
						return "<img src=\"" + e +"\"/>";
						}).join(" ");
					return txt.replace(/{(.*)}/, '<p><i>suggestions sent</i></p>')

				});

			$("li.message >div:contains('suggestions sent')").find('figure').remove();
			$("li.message >div:contains('suggestions sent')").find('blockquote').remove();
			$("li.message >div:contains('suggestions sent')").find('span.collapse-switch').remove();
			$("li.message >div:contains('suggestions sent')").find('a').each(function() {$(this).replaceWith("<img src=" + $(this).attr('href') +" />");});


		}});
		observer.observe(document,
			{
				subtree: true,
				attributes: true,
				characterData: true
			}
		);

	});



	}

})

Template.google_places_search.helpers({
	places(){
		return Template.instance().places_results.get();
	},
	messages() {
		return RocketChat.models.LivechatExternalMessage.findByRoomId(this.rid, {ts: 1});
	},
    show_places(){
	return Template.instance().show_places.get();
	}
});


Template.google_places_search.events({
	/**
	 * Notifies that a query was confirmed by an agent (aka. clicked)
	 */


	'click .div_result': function(event){
		event.preventDefault();
	const target = 	$(event.currentTarget).parents(".li_result");
	$(event.currentTarget).toggleClass('lightblue');

	},

	'click .search_button': function(event,template){

	event.preventDefault();
	const target = $(".search_box_input");
	if(!target.val())
		return;
	const place =  target.val().split(" ");
	const checkedItems = $("input[type=checkbox]:checked");
	var terms = checkedItems.map(function(index, item){return item.name;}).toArray();
	terms = terms.concat(place);
	const serviceName= terms.join("_");

	Meteor.call('masai:retrieveGoogleMapResults',JSON.stringify([{'servicename': serviceName, 'searchterms': terms}]),function(err, result) {
		template.places_results.set(result);}) ;

	var containerTemplate= document.getElementById('places_container');
	template.show_places.set(true);


	},
	'click .delete_results' : function(event,template){
		event.preventDefault();
		event.stopPropagation();
		template.show_places.set(false);
	},
	'click .send_ok': function(event, template) {
		event.stopPropagation();
		event.preventDefault();
		template.checked_items = _.map($("div.div_result.lightblue"), function (item) { return item.dataset.resultIndex });
		var arrayOfResults = Array.from(template.places_results.get());
		var results = arrayOfResults.filter(function (item, index) { return template.checked_items.includes(index.toString()); });// if( template.checked_items.includes(index.toString())){ return item;} } );
		var images = results.map(function(item){return item.references})
		results = results.map(function (item) { return item.google_result; });

		if(!!results && results.length > 0)
		Meteor.call('sendMessage',
			{ "_id": Random.id(), "rid": template.roomId, "msg": JSON.stringify({ "html_attributions": images, "results": results })}
					);
		$('.lightblue').toggleClass('lightblue');

	}


});

Template.google_places_search.onCreated(function () {
	this.show_places= new ReactiveVar(false);
    this.places_results = new ReactiveVar([]);
    this.checked_items = new Array();
    this.roomId = null;
	this.autorun(() => {
		this.roomId = Template.currentData().rid;

	});

    	});
