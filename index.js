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
                var json = require("./db/json/prompts.json").addDepartment;
                addTo("department", json);
                break;
            case "Add a role":
                var json = require("./db/json/prompts.json").addRole;
                viewAll("department", json, listContent, addTo);
                break;
            case "Add an employee":
                var json = require("./db/json/prompts.json").addEmployee;
                viewAll("employee", json, listContent, addTo, "role");
                break;
            case "Update an employee role":
                break;
        }
    })
    .catch((err) => console.error(err));
viewAll = function(table, json, func, func2, tableOrResult){
    db.query(`SELECT * FROM ${table}`, (err, result) => {
        err && console.error(err);
        if (arguments[1] && arguments[2] && arguments[3]){
            if (typeof arguments[4] === "string"){
                console.log("adding employees");
                viewAll(tableOrResult, json, func, func2, result);
            } 
            else if (arguments[4]) {
                console.log("adding employees 2")
                func(result, json, func2, tableOrResult);
            } else {
                func(result, json, func2);
            }
        } else {
            console.log(result);
        }
    });
}
listContent = function(result, json, func, result2){
    var names = "name";
    if (arguments[3]){
        var content = [];
        for (var i = 0; i < result2.length; i++){
            content[i] = result2[i].first_name + " " + result2[i].last_name;
        }
        json[3].choices = content;
        var names = "title";
    }
    var content = [];
    console.log(result);
    for (var i = 0; i < result.length; i++){
        content[i] = result[i][names];
    }
    console.log(content);
    json[2].choices = content;
    console.log(json);
    func("idk", json);
}

addTo = function(table, prompt){
    console.log(prompt);
    inquirer
        .prompt(
            prompt
        )
        .then((answers) => {
        })
        .catch((err) => console.error(err));
}