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