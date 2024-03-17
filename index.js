const inquirer = require("inquirer")
const mysql = require("mysql2")

const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "absolutely",
        database: "employee_db"
    },
    console.log("Connected to employee_db database")
);

inquirer
    .prompt([
        {
            type: "list",
            name: "action",
            message: "Options:",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update an employee role"
            ]
        }
    ])
    .then((answers) => {
        switch (answers.action){
            case "View all departments":
                viewAll(`department`);
                break;
            case "View all roles":
                viewAll("role");
                break;
            case "View all employees":
                viewAll("employee");
                break;
            case "Add a department":
                break;
            case "Add a role":
                break;
            case "Add an employee":
                break;
            case "Update an employee role":
                break;
        }
    })
    .catch((err) => console.error(err));

viewAll = function(table){
    db.query(`SELECT * FROM ${table}`, (err, result) => {
        err && console.error(err);
        console.log(result);
    });
}
addTo = function(table){
    inquirer
        .prompt([
        ])
        .then((answers) => {
        })
        .catch((err) => console.error(err));
}