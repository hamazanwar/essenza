const bcrypt = require("bcrypt");

const password = "testpassword123";

const hashedPassword = bcrypt.hashSync(password, 10);

console.log("Original password:", password);
console.log("Hashed password:", hashedPassword);