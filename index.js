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
                viewAll(`department`).then((res) => console.log(res));
                break;
            case "View all roles":
                viewAll("role").then((res) => console.log(res));
                break;
            case "View all employees":
                viewAll("employee").then((res) => console.log(res));
                break;
            case "Add a department":
                var json = require("./db/json/prompts.json").addDepartment;
                addTo("department", json);
                break;
            case "Add a role":
                var department = await viewAll("department");
                var content = listContent(department, "department");
                var json = require("./db/json/prompts.json").addRole;
                json[2].choices = content;
                addTo("role", json);
                break;
            case "Add an employee":
                var role = listContent(await viewAll("role"), "Role");
                var employee = listContent(await viewAll("employee"), "Employee");
                employee.push({name: "No Manager", value: undefined});
                var json = require("./db/json/prompts.json").addEmployee;
                json[2].choices = role;
                json[3].choices = employee;
                addTo("employee", json);
                break;
            case "Update an employee role":
                var employee = listContent(await viewAll("employee"), "Employee");
                var role = listContent(await viewAll("role"), "Role");
                var json = require("./db/json/prompts.json").updateEmployeeRole;
                json[0].choices = employee;
                json[1].choices = role;
                updateInDB("employee", json);
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

function listContent(result, json){
    var names = "name"
    if (json === "Employee"){
        var content = [];
        for (var i = 0; i < result.length; i++){
            content[i] = {name: result[i].first_name + " " + result[i].last_name, value: result[i].id};
        }
        return content;
    }
    else if (json === "Role") {
        names = "title"
    }
    var content = [];
    for (var i = 0; i < result.length; i++){
        content[i] = {name: result[i][names], value: result[i].id};
    }
    return content;
}

function addContent(table, answers){
    // Converts ? variables into strings so doesn't work in an injection safe way :/
    db.query(`INSERT INTO ${table} (${Object.keys(answers)}) VALUES ?`, [[Object.values(answers)]], (err, result) => {
        err && console.error(err);
        console.log("Successfully added to database")
    });
}

function addTo(table, prompt){
    console.log(prompt);
    inquirer
        .prompt(
            prompt
        )
        .then((answers) => {
            addContent(table, answers);
        })
        .catch((err) => console.error(err));
}

function updateInDB(table, prompt){
    console.log(prompt);
    inquirer
        .prompt(
            prompt
        )
        .then((answers) => {
            console.log(answers);
            db.query(`UPDATE ${table} SET ${Object.keys(answers)[1]} = ? WHERE ${Object.keys(answers)[0]} = ?`, [Object.values(answers)[1], Object.values(answers)[0]], (err, result) => {
                err && console.error(err);
            });
        })
        .catch((err) => console.error(err));
}