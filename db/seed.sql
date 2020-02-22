  
INSERT INTO department(name)
VALUES ("Workforce Services");

INSERT INTO department(name)
VALUES ("Health");

INSERT INTO department(name)
VALUES ("Criminal Justice");

INSERT INTO department(name)
VALUES ("Human Services");

INSERT INTO role(title, salary, department_id)
VALUES
("exec_director", 150000, 1),
("division_director", 100000, 2),
("team_lead", 90000, 2),
("intern", 20000, 2);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES
("Jon", "Pierpont", 1, 1);


