var sys = require('sys'), sqlite = require('sqlite');

var db = new sqlite.Database();

// open the database for reading if file exists
// create new database file if not

db.open("aquateen.db", function(error) {
	if (error) {
		console.log("Tonight. You.");
		throw error;
	}
	// db.execute("create table t1 (t1key INTEGER PRIMARY KEY,data TEXT,num
	// double,timeEnter DATE);", [], function(error, rows) {
	// if (error)
	// throw error;
	// console.log("Aqua teen added.");
	// console.log(rows)
	var sql = "insert into t1 (data,num) values (?,?);";

	db.execute(sql, ['This is sample data', 3], function(rror, rows) {
		if (error)
			throw error;
		console.log('good!')
		console.log(rows)
		var sql = "select * from t1";

		db.execute(sql, function(rror, rows) {
			if (error)
				throw error;
			console.log('row!')
			console.log(rows)
			// Fill in the placeholders

		});

	});
	// });
	console.log(db)
});