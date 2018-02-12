RocketChat.models.LCCCategories = new class extends RocketChat.models._Base {
	constructor() {
		super('lcccategories');
	}

	findAll() {
		var data = this.find({ },{offset:0,limit:1000}).fetch();
		return data;
	}
	createLCC(name, userid) {

		
			const record = {
				userid : userid,
				name : name,
				ts: new Date()
			};
			record._id = this.insert(record);
			return record;
		

	}
};
