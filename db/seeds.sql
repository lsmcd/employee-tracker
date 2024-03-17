INSERT INTO department (name)
VALUES ("BAKERY"),
       ("GROCERIES"),
       ("CLOTHES");

INSERT INTO role (title, salary, department_id)
VALUES ("Baker", 10.5, 1),
       ("Grocery Stocker", 9.2, 2),
       ("Clothes Stocker", 9, 3),
       ("Changing Room Clerk", 8, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jessica", "Hanes", 4, NULL),
       ("Jason", "Smith", 3, 1),
       ("Sophie", "Miller", 2, NULL),
       ("Rick", "Howard", 2, 3),
       ("Josh", "Carter", 1, NULL);