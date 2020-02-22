const { prompt } = require("inquirer");
const logo = require("asciiart-logo");
const db = require("./db");
require("console.table");


initialize();



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
            return viewAllEmployees();
        case "VIEW_EMPLOYEES_BY_DEPARTMENT":
            return viewEmployeesByDepartment();
        case "VIEW_EMPLOYEES_BY_MANAGER":
            return viewEmployeesByManager();
        case "ADD_EMPLOYEE":
            return addEmployee();
        case "UPDATE_EMPLOYEE_ROLE":
            return updateEmployeeRole();
        case "VIEW_DEPARTMENTS":
            return viewDepartments();
        case "ADD_DEPARTMENT":
            return addDepartment();
        case "VIEW_ROLES":
            return viewRoles();
        case "ADD_ROLE":
            return addRole();
        default:
            return quit();
    }
}
async function viewAllEmployees() {
    const employees = await db.findAllEmployees();
    console.log("\n");
    console.table(employees);
    mainOptions();
}
async function viewEmployeesByDepartment() {
    const departments = await db.findAllDepartments();
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
    const employees = await db.findAllEmployeesByDepartment(departmentId);
    console.log("\n");
    console.table(employees);
    mainOptions();
}
async function viewEmployeesByManager() {
    const managers = await db.findAllEmployees();
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
    const employees = await db.findAllEmployeesByManager(managerId);
    console.log("\n");
    if (employees.length === 0) {
        console.log("The selected employee has no direct reports");
    } else {
        console.table(employees);
    }
    mainOptions();
}

async function updateEmployeeRole() {
    const employees = await db.findAllEmployees();
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
    const roles = await db.findAllRoles();
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

async function viewRoles() {
    const roles = await db.findAllRoles();
    console.log("\n");
    console.table(roles);
    mainOptions();
}
async function addRole() {
    const departments = await db.findAllDepartments();
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

async function viewDepartments() {
    const departments = await db.findAllDepartments();
    console.log("\n");
    console.table(departments);
    mainOptions();
}
async function addDepartment() {
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

async function addEmployee() {
    const roles = await db.findAllRoles();
    const employees = await db.findAllEmployees();
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
function quit() {
    console.log("Goodbye!");
    process.exit();
}