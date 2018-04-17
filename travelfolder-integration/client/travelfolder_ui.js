import moment from 'moment';
/**
 * Created by Wolfgang on 22.02.2017.
 */
  AccountBox.addItem({
	name: 'Phone',
	icon: 'phone',
	href: 'phone-asso',
	condition: () => {
		return RocketChat.settings.get('Livechat_enabled') && RocketChat.authz.hasAllPermission('view-privileged-setting');
	}
});
 AccountBox.addItem({
	name: 'Watson',
	icon: 'hubot',
	href: 'watson-export',
	condition: () => {
		return RocketChat.settings.get('Livechat_enabled') && RocketChat.authz.hasAllPermission('view-privileged-setting');
	}
});
 AccountBox.addItem({
	name: 'Category',
	icon: 'post',
	href: 'livechatmanagement-categories',
	condition: () => {
		return RocketChat.settings.get('Livechat_enabled') && RocketChat.authz.hasAllPermission('view-privileged-setting');
	}
});

 AccountBox.addItem({
	name: 'Send SMS',
	icon: 'message',
	condition: () => {
		return RocketChat.settings.get('Livechat_enabled') ;
	}
});
RocketChat.TabBar.removeButton('visitor-info');
RocketChat.TabBar.removeButton('visitor-history');
RocketChat.TabBar.removeButton('external-search');
RocketChat.TabBar.removeGroup('starred-messages',['live']);
RocketChat.TabBar.addButton({
	groups: ['live'],
	id: 'travelfolder',
	i18nTitle: 'Travelfolder',
	icon: 'info-circled',
	template: 'visitorInfo_travelFolder',
	order: 0,
	initialOpen: true
});
RocketChat.TabBar.addButton({
	groups: ['live'],
	id: 'travelfolderwatson',
	i18nTitle: 'Watson',
	icon: 'hubot',
	template: 'watson_travelFolder',
	order: 0,
	initialOpen: true
});
RocketChat.tf = {};
RocketChat.tf.validateIncoming = function() {
	$($(".livechat-section h3.rooms-list__type").eq(1).find(".incomingcount")).remove();//"Hallo");
	var num = $(".livechat-section .rooms-list__list.inquiries .sidebar-item").length;
	if (num>0) {
		$($(".livechat-section h3.rooms-list__type").eq(1)).append("<span class='incomingcount'>"+num+"</span>")
	}
	if ($(".rooms-list__toolbar-search").length<=0 && $(".rc-input__element").val()!=null && $(".rc-input__element").val()!="") {
		$(".rc-input__element").val(null);
	}
	$(".livechat-section .sidebar-item-small").each(function(idx, item) {
		var ts = $(item).attr("data-ts");
		if (ts!=null && ts!="") {
			endDate = moment(new Date());
			
				var ms = endDate.diff(moment(new Date(ts)));
				var d = moment.duration(ms);
				var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
			$(item).html(s);
		} /* then */
		else {
			ts = $(item).attr("data-ts1");
			if (ts!=null && ts!="") {
				endDate = moment(new Date());
					var s =  moment(new Date(ts)).format("HH:mm:ss");
				$(item).html(s);
			} /* then */
		}
		
	});
	$(".rooms-list__list.inquiries .groupset").each(function(idx, item) {
		if($(item).find("li").length<=0) {
			$(item).remove();
		}
	});
	$(".rooms-list__list.inquiries > li a").each(function(idx, item) {
		var org = $(item).attr("data-origin");
		if (org!=null) {
			if ($(".rooms-list__list.inquiries #"+org).length<=0) {
				$(".rooms-list__list.inquiries").prepend("<div id='"+org+"' class='groupset'><h4>"+org+"</h4><div class='groupsetcontent'></div></div>");
			}
			$($(item).parents(".sidebar-item")).detach().appendTo( $(".rooms-list__list.inquiries #"+org+" .groupsetcontent"));
		} /* then */
	});
};
RocketChat.tf.syncDelayed = function () {
	Meteor.call('masai:getDelayedRooms',function(err, result) {

		if ($(".rooms-list__list.inquiries").length>0) {
			$(".restart-item").remove();
			$(".rooms-list__empty-room").show();
			htx = "";
			$(result).each(function(idx, item) {
			$(".rooms-list__empty-room").hide();

			htx +=	'<li class="sidebar-item restart-item" data-message="'+(item.closecomment)+'" data-id="'+(item._id)+'">'+
					'<div class="sidebar-item__user-status sidebar-item__user-status--offline"></div>'+
					'<a class="sidebar-item__link outdatetrigger restarttrigger "  data-message="'+(item.closecomment)+'"  data-id="'+(item._id)+'" href="javascript:void(0);" data-href="/live/'+(item.code)+'" title="'+(item.label)+'">'+
					'	<div class="sidebar-item__picture">'+
					'		<svg class="rc-icon sidebar-item__icon sidebar-item__icon--livechat" aria-hidden="true">'+
					'			<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-livechat"></use>'+
					'		</svg>'+
					'	</div>'+
					'	<div class="sidebar-item__name">'+(item.label)+'</div>'+
					'	<div class="sidebar-item__menu">'+
					'		<svg class="rc-icon sidebar-item__menu-icon sidebar-item__menu-icon--menu" aria-hidden="true">'+
					'			<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-menu"></use>'+
					'		</svg>'+
					'	</div>'+
					'</a>'+
				'</li>';
			});
      
			$(".rooms-list__list.inquiries").append(htx);
		}
	});
};


Meteor.startup(function(){
	if(Meteor.isClient){
          TAPi18n.loadTranslations(
		{
			en: {
				targettext:'SMS Text',
				targetnumber : 'SMS Nummer (Empfänger) bitte mit Ländervorwahl',
				Send_SMS: 'Über diese Funktion kannst du einen SMS versenden. Für diese SMS wird eine Chat-ID vergeben. Der Chat wird nach dem versenden geschlossen. Du kannst diesen Chat über "Chat Suchen" oder "SMS-Nummer suchen" anzeigen lassen',
				SMS_Send: 'SMS Senden',
				About_Watson: "Dieser Supportassistent verarbeitet die Anfragen Ihres Klients und gibt mögliche Antworten vor.",
          Watson_Deactivated: "Der Supportassistent ist in geschlossenen Anfragen nicht aktiv.",
					SMS_Channel : "Eingang via SMS",
					WEB_Channel : "Eingang via WEB",
					Chat_merge : "Chat zusammengeführt",
					Loading_Watson : "Anfrage läuft",
					Alternative_Watson : "Text passt nicht, bitte eine Alternative vorschlagen ...",
					Use_Watson : "Übernehmen",
					Restart_title: "Chat Backtemplate",
					Restart_desc: "Choose backtemplate Date",
					Please_add_a_comment_desc: "Choose close reason",
					close_reason1: "Aktionszeitraum LIDL Ticket",
					close_reason2: "Tarifbedingungen LIDL Ticket",
					close_reason3: "Erstattung LIDL Ticket",
					close_reason4: "Beschwerde LIDL Ticket",
					close_reason5: "Beschwerde Allgemein",
					close_reason6: "Beschwerde Personal",
					close_reason7: "Technisches Problem Einlösung LIDL",
					close_reason8: "LIDL online",
					close_reason9: "Anfragen zum Service Reisebuddy",
					close_reason10: "Allgemein",
					Please_add_a_comment_to_close_the_room: "Enter reason to close the room",
					Merge_chat: "Merge chats",
					Merge_chat_desc : "Wollen Sie die Chats in einen neuen zusammenführen?",
					Merge_chat_comment: "Merge chats",
					Please_provide_chat_id: "Enter chat id",
					Chat_merge_successfully: "Chats successfully merged",
          Chat_remarked_successfully: "Chat wurde erfolgreich wiedervorgelegt",
          Chat_remarked: "Chat Wiedervorlage",
          Restart_reason: "Wiedervorlage Anlass",
          Provide_restart_date: "Bitte Datum wählen",
					Image_Uploaded: "An image was shared with you",
					File_Uploaded: "A file was shared with you",
					Location_Shared: "A location was shared with you",
					Request_Access: "Request for Travelfolder access permission",
					New_Message: "New Message",
          Custom_Request_Hint : "Geben Sie den Text für die manuelle Anfrage an...",
          Send_Custom_Request: "Anfrage senden",
          Custom_Request: "Manuelle Anfrage senden",
          Intermediate_Request: "Zwischenantwort",
          Send_Intermediate_Request: "Zwischenantwort senden"
				},de: {
					targettext:'SMS Text',
				targetnumber : 'SMS Nummer (Empfänger) bitte mit Ländervorwahl',
				Send_SMS: 'Über diese Funktion kannst du einen SMS versenden. Für diese SMS wird eine Chat-ID vergeben. Der Chat wird nach dem versenden geschlossen. Du kannst diesen Chat über "Chat Suchen" oder "SMS-Nummer suchen" anzeigen lassen',
				SMS_Send: 'SMS Senden',
				About_Watson: "Dieser Supportassistent verarbeitet die Anfragen Ihres Klients und gibt mögliche Antworten vor.",
        Watson_Deactivated: "Der Supportassistent ist in geschlossenen Anfragen nicht aktiv.",
					SMS_Channel : "Eingang via SMS",
					WEB_Channel : "Eingang via WEB",
					Chat_merge : "Chat zusammengeführt",
					Loading_Watson : "Anfrage läuft",
					Alternative_Watson : "Text passt nicht, bitte eine Alternative vorschlagen ...",
					Use_Watson : "Übernehmen",
					Restart_title: "Wiedervorlage",
					Restart_desc: "Wiedervorlage Datum wählen",
					Please_add_a_comment_desc: "Schließungsgrund angeben",
					close_reason1: "Aktionszeitraum LIDL Ticket",
					close_reason2: "Tarifbedingungen LIDL Ticket",
					Merge_chat_desc : "Wollen Sie die Chats in einen neuen zusammenführen?",
					close_reason3: "Erstattung LIDL Ticket",
					close_reason4: "Beschwerde LIDL Ticket",
					close_reason5: "Beschwerde Allgemein",
					close_reason6: "Beschwerde Personal",
					close_reason7: "Technisches Problem Einlösung LIDL",
					close_reason8: "LIDL online",
					close_reason9: "Anfragen zum Service Reisebuddy",
					close_reason10: "Allgemein",
					Please_add_a_comment_to_close_the_room: "Schließungsgrund angeben",
					Merge_chat: "Chat zusammenführen",
					Merge_chat_comment: "Chat zusammenführen",
					Please_provide_chat_id: "Bitte Chat id angeben",
					Chat_merge_successfully: "Chat wurde erfolgreich zusammengeführt",
          Chat_remarked_successfully: "Chat wurde erfolgreich wiedervorgelegt",
          Chat_remarked: "Chat Wiedervorlage",
          Restart_reason: "Wiedervorlage Anlass",
          Provide_restart_date: "Bitte Datum wählen",
					Image_Uploaded: "Ein Bild wurde geteilt",
					File_Uploaded: "Eine Datei wurde geteilt",
					Location_Shared: "Ein Ort wurde geteilt",
					Request_Access: "Eine Anfrage auf Zugriff zum Reiseordner wurde gestellt",
					New_Message: "Neue Nachricht",
          Custom_Request_Hint : "Geben Sie den Text für die manuelle Anfrage an...",
          Send_Custom_Request: "Anfrage senden",
          Custom_Request: "Manuelle Anfrage senden",
          Intermediate_Request: "Zwischenantwort",
          Send_Intermediate_Request: "Zwischenantwort senden"
				}
		},"project"
	);
		$("body").on("click", ".toolbar__search .rc-input__icon", function(e) {
			// rc-input__element
			$(".toolbar__search input.rc-input__element").val(null);
		});
		$("body").on('click', '.restarttrigger', function (e) {
			rid = $(this).data("id");
			htarget = $(this).data("href");
			msg = $(this).data("message");
			swal({
				title: t('Livechat_Take_Confirm'),
				text: `${ t('Message') }: `+msg,
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: t('Take_it')
			}, (isConfirm) => { 
				if (isConfirm) {
					Meteor.call('masai:unmark', rid, function(error, result) {
						inqId = result._id;
						console.log("Going to take inquiery: "+(result._id));
						Meteor.call('livechat:takeInquiry', inqId, (error, result) => {
							RocketChat.tf.syncDelayed ();
							if (!error) {
								RocketChat.roomTypes.openRouteLink(result.t, result);
							}
						});
					});
				}
			});
		});
		$("body").on('click', '[data-id="send sms"]', function (e) {
			e.preventDefault();
			Meteor.call('masai:getPhoneAssos', function(err, rr) {
				optionx = "<p><select style='width:100%;' id='phoneassoid'>";
				$(rr).each(function(idx, item) {
					optionx+=" <option value='"+item._id+"'>"+item.name+" ("+item.num+")</option>";
				});
				optionx += "</select></p>";
				swal({
					title: t('SMS_Send'),
				html : true,
					text : '<p style="text-align:left;font-size:13px;">'+ t("Send_SMS")+'<br/><fieldset style="text-align:left;font-size:9px;"><input type="text" id="targetnumber" style="display:block;"  placeholder="'+t("targetnumber")+'"> '+
					optionx+
					'<input type="text" id="targettext" style="display:block;"  placeholder="'+t("targettext")+'"></fieldset></p>',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: t('Send')
				}, (isConfirm) => {
					if (isConfirm) {					
						tel = $("#targetnumber").val();
						txt = $("#targettext").val();
						phoneassoid = $("#phoneassoid").val();
						Meteor.call('masai:sendSMS',tel, txt,phoneassoid, function(err, result) {
							
						});
					}
				});
			
			});
		});
		setTimeout(function() {
			RocketChat.tf.syncDelayed ();
		}, 2500);

		setInterval(function() {
			RocketChat.tf.syncDelayed ();
		}, 25000);
		
		
		setTimeout(function() {
			RocketChat.tf.validateIncoming ();
		}, 125);

		setInterval(function() {
			RocketChat.tf.validateIncoming ();
		}, 200);
	}
});
