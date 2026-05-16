const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Jeevansai@2003",
    database: "todo_app"
});

db.connect(err => {
    if (err) {
        console.log("DB connection failed", err);
    } else {
        console.log("MySQL Connected");
    }
});

module.exports = db;