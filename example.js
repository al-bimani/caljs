const calc = require("./caljs");

let expr;

expr = "5 - 5 ^(-6--3) + 5 +3";
console.log(expr, "=", calc.eval(expr), "\n");

expr = "10 * log(1)";
console.log(expr, "=", calc.eval(expr), "\n");

expr = "pow(sin(15), 2) + pow(cos(15), 2)";
console.log(expr, "=", calc.eval(expr), "\n");

expr = "sin(15) ^ 2 + cos(15) ^ 2";
console.log(expr, "=", calc.eval(expr), "\n");

expr = "4 + -5 * -6 - -7";
console.log(expr, "=", calc.eval(expr), "\n");

expr = "(PI * 5 ^ 2) / 5";
console.log(expr, "=", calc.eval(expr), "\n");