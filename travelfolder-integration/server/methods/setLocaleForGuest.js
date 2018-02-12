Meteor.methods({
	'masai:setLocaleForGuest'(_locale) {
        if (!Meteor.userId()) {
            return;
        }
        
        console.log(RocketChat.models.Users.update({_id: Meteor.userId()}, {$set: {locale: _locale}}));
		return;
	}
});