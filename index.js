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
    .then(async (answers) => {
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
                //var json = require("./db/json/prompts.json").addRole;
                viewAll("department").then((result) => {
                    var content = listContent(result, "Department");
                    var json = require("./db/json/prompts.json").addRole;
                    json[2].choices = content;
                    addTo("department", json);
                });
                //viewAll("department", json, listContent, addTo);
                break;
            case "Add an employee":
                var role = listContent(await viewAll("role"), "Role");
                var employee = listContent(await viewAll("employee"), "Employee");
                var json = require("./db/json/prompts.json").addEmployee;
                json[2].choices = role;
                json[3].choices = employee;
                addTo("department", json);
                break;
            case "Update an employee role":
                break;
        }
    })
    .catch((err) => console.error(err));
async function viewAll(table){
    return await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM ${table}`, (err, result) => {
            err && console.error(err);
            resolve(result);
        });
    })
}
listContent = function(result, json){
    var names = "name"
    if (json === "Employee"){
        var content = [];
        for (var i = 0; i < result.length; i++){
            content[i] = result[i].first_name + " " + result[i].last_name;
        }
        return content;
    }
    else if (json === "Role") {
        names = "title"
    }

    var content = [];
    for (var i = 0; i < result.length; i++){
        content[i] = result[i][names];
    }
    console.log(content);
    return content;
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