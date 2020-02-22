const { prompt } = require("inquirer");
const logo = require("asciiart-logo");
const db = require("./db");
require("console.table");


initialize();


// Display logo text, load main prompts
function initialize() {
    const logoText = logo({ name: "Employee Manager" }).render();
    console.log(logoText);
    mainOptions();
}
async function mainOptions() {
    const { choice } = await prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices: [
                {
                    name: "View All Employees",
                    value: "VIEW_ALL_EMPLOYEES"
                },
                {
                    name: "View All Employees By Department",
                    value: "VIEW_EMPLOYEES_BY_DEPARTMENT"
                },
                {
                    name: "View All Employees By Manager",
                    value: "VIEW_EMPLOYEES_BY_MANAGER"
                },
                {
                    name: "Add an Employee",
                    value: "ADD_EMPLOYEE"
                },

                {
                    name: "Update an Employee's Role",
                    value: "UPDATE_EMPLOYEE_ROLE"
                },

                {
                    name: "View All Roles",
                    value: "VIEW_ROLES"
                },
                {
                    name: "Add a Role",
                    value: "ADD_ROLE"
                },

                {
                    name: "View All Departments",
                    value: "VIEW_DEPARTMENTS"
                },
                {
                    name: "Add a Department",
                    value: "ADD_DEPARTMENT"
                },

                {
                    name: "Quit",
                    value: "QUIT"
                }
            ]
        }
    ]);
    // Call the appropriate function depending on what the user chose
    switch (choice) {
        case "VIEW_ALL_EMPLOYEES":
            return displayAllEmployees();
        case "VIEW_EMPLOYEES_BY_DEPARTMENT":
            return displayEmployeesByDepartment();
        case "VIEW_EMPLOYEES_BY_MANAGER":
            return displayEmployeesByManager();
        case "ADD_EMPLOYEE":
            return newEmployee();
        case "UPDATE_EMPLOYEE_ROLE":
            return updateEmployeeRole();
        case "VIEW_DEPARTMENTS":
            return displayDepartments();
        case "ADD_DEPARTMENT":
            return newDepartment();
        case "VIEW_ROLES":
            return displayRoles();
        case "ADD_ROLE":
            return newRole();
        default:
            return exit();
    }
}
async function displayAllEmployees() {
    const employees = await db.grabAllEmployees();
    console.log("\n");
    console.table(employees);
    mainOptions();
}
async function displayEmployeesByDepartment() {
    const departments = await db.grabAllDepartments();
    const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
    }));
    const { departmentId } = await prompt([
        {
            type: "list",
            name: "departmentId",
            message: "Which department would you like to see employees for?",
            choices: departmentChoices
        }
    ]);
    const employees = await db.grabAllEmployeesByDepartment(departmentId);
    console.log("\n");
    console.table(employees);
    mainOptions();
}
async function displayEmployeesByManager() {
    const managers = await db.grabAllEmployees();
    const managerChoices = managers.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    const { managerId } = await prompt([
        {
            type: "list",
            name: "managerId",
            message: "Which employee do you want to see direct reports for?",
            choices: managerChoices
        }
    ]);
    const employees = await db.grabAllEmployeesByManager(managerId);
    console.log("\n");
    if (employees.length === 0) {
        console.log("The selected employee has no direct reports");
    } else {
        console.table(employees);
    }
    mainOptions();
}

async function updateEmployeeRole() {
    const employees = await db.grabAllEmployees();
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    const { employeeId } = await prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Which employee's role do you want to update?",
            choices: employeeChoices
        }
    ]);
    const roles = await db.grabAllRoles();
    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));
    const { roleId } = await prompt([
        {
            type: "list",
            name: "roleId",
            message: "Which role do you want to assign the selected employee?",
            choices: roleChoices
        }
    ]);
    await db.updateEmployeeRole(employeeId, roleId);
    console.log("Updated employee's role");
    mainOptions();
}

async function displayRoles() {
    const roles = await db.grabAllRoles();
    console.log("\n");
    console.table(roles);
    mainOptions();
}
async function newRole() {
    const departments = await db.grabAllDepartments();
    const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
    }));
    const role = await prompt([
        {
            name: "title",
            message: "What is the name of the role?"
        },
        {
            name: "salary",
            message: "What is the salary of the role?"
        },
        {
            type: "list",
            name: "department_id",
            message: "Which department does the role belong to?",
            choices: departmentChoices
        }
    ]);
    await db.createRole(role);
    console.log(`Added ${role.title} to the database`);
    mainOptions();
}

async function displayDepartments() {
    const departments = await db.grabAllDepartments();
    console.log("\n");
    console.table(departments);
    mainOptions();
}
async function newDepartment() {
    const department = await prompt([
        {
            name: "name",
            message: "What is the name of the department?"
        }
    ]);
    await db.createDepartment(department);
    console.log(`Added ${department.name} to the database`);
    mainOptions();
}

async function newEmployee() {
    const roles = await db.grabAllRoles();
    const employees = await db.grabAllEmployees();
    const employee = await prompt([
        {
            name: "first_name",
            message: "What is the employee's first name?"
        },
        {
            name: "last_name",
            message: "What is the employee's last name?"
        }
    ]);
    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));
    const { roleId } = await prompt({
        type: "list",
        name: "roleId",
        message: "What is the employee's role?",
        choices: roleChoices
    });
    employee.role_id = roleId;
    const managerChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    managerChoices.unshift({ name: "None", value: null });
    const { managerId } = await prompt({
        type: "list",
        name: "managerId",
        message: "Who is the employee's manager?",
        choices: managerChoices
    });
    employee.manager_id = managerId;
    await db.createEmployee(employee);
    console.log(
        `Added ${employee.first_name} ${employee.last_name} to the database`
    );
    mainOptions();
}
function exit() {
    console.log("See you next time!");
    process.exit();
}