const data = require("C://projects/polyreach/polyreach-be/scripts/data.json");

data.forEach((user) => {
	db.users.insertOne(user);
});
