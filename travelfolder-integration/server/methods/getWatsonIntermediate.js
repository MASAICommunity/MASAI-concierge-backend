Meteor.methods({
  'masai:getWatsonIntermediate'() {
    return RocketChat.settings.get('Reisebuddy_WATSON_Intermediate_Message');
  }
})
