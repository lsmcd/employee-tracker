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
                viewAll(`department`).then((res) => displayFormattedTable(res));
                break;
            case "View all roles":
                viewAll("role").then((res) => displayFormattedTable(res));
                break;
            case "View all employees":
                viewAll("employee", ` JOIN role ON employee.role_id = role.id`).then((res) => displayFormattedTable(res));
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

async function viewAll(table, sqlArgs){
    return await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM ${table}${sqlArgs || ""}`, (err, result) => {
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
async function displayFormattedTable(json){
    json = await convertIDs(json)
    var columnLength = [];

    for (var i = 0; i < Object.keys(json[0]).length; i++){
        let x = Object.keys(json[0])[i].length;
        columnLength[i] = x + 2
    }

    for (var i = 0; i < json.length; i++){
        for (var j = 0; j < Object.values(json[0]).length; j++){
            let x = String(Object.values(json[i])[j]).length;
            if (x + 2 > columnLength[j]){
                columnLength[j] = x + 2
            };
        }
    }
    var table = ""
    
    for (var i = 0; i < Object.keys(json[0]).length; i++){
        let x = Object.keys(json[0])[i]        
        table += x;
        table += " ".repeat(columnLength[i] - x.length);
    }
    console.log(table);
    table = "";
    for (var i = 0; i < Object.keys(json[0]).length; i++){
        table += "-".repeat(columnLength[i] - 2)
        table += " ".repeat(2)
    }
    console.log(table);
    table = "";
    for (var i = 0; i < json.length; i++){
        for (var j = 0; j < Object.values(json[0]).length; j++){
            let x = String(Object.values(json[i])[j]);
            table += x;
            table += " ".repeat(columnLength[j] - x.length);
        }
        console.log(table)
        table = "";
    }
}

async function convertIDs(json){
    return await new Promise(async (resolve, reject) => {
        if (json[0].role_id){
            var titles = listContent(await viewAll("role"), "role");
            for (var i = 0; i < json.length; i++){
                for (var j = 0; j < titles.length; j++){
                    if (json[i].role_id === titles[j].value){
                        // 0 clue why it only works with a comparison operator but here we are;
                        json[i].title === titles[j].name;
                    }
                }
                delete json[i].role_id;
            }
        }
        if (json[0].department_id){
            var departments = listContent(await viewAll("department"), "department");
            for (var i = 0; i < json.length; i++){
                for (var j = 0; j < departments.length; j++){
                    if (json[i].department_id === departments[j].value){
                        json[i].department = departments[j].name;
                    }
                }
                delete json[i].department_id;
            }
        }
        if (json[0].first_name){
            var manager = listContent(await viewAll("employee"), "Employee");
            for (var i = 0; i < json.length; i++){
                for (var j = 0; j < manager.length; j++){
                    if (json[i].manager_id === manager[j].value){
                        json[i].manager = manager[j].name;
                    }
                }
                if (json[i].manager === undefined) {
                    json[i].manager = "NULL"
                }
                delete json[i].manager_id;
            }
        }
        resolve(json);
    });
}

function addTo(table, prompt){
    inquirer
        .prompt(
            prompt
        )
        .then((answers) => {
            // Converts ? variables into strings so doesn't work in an injection safe way :/
            db.query(`INSERT INTO ${table} (${Object.keys(answers)}) VALUES ?`, [[Object.values(answers)]], (err, result) => {
                err && console.error(err) || console.log("Successfully added to database");
            });
        })
        .catch((err) => console.error(err));
}

function updateInDB(table, prompt){
    inquirer
        .prompt(
            prompt
        )
        .then((answers) => {
            db.query(`UPDATE ${table} SET ${Object.keys(answers)[1]} = ? WHERE ${Object.keys(answers)[0]} = ?`, [Object.values(answers)[1], Object.values(answers)[0]], (err, result) => {
                err && console.error(err) || console.log("Successfully updated");
            });
        })
        .catch((err) => console.error(err));
}