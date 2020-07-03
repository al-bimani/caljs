const NUMS = "0123456789",
  PUNCS = "()",
  OPS = "+-*/^",
  TYPES = {
    Number: "Number",
    Operator: "Operator",
    Punction: "Punction",
    Binary: "Binary",
  },
  PRECEDENCE = {
    "+": 10,
    "-": 10,
    "*": 20,
    "/": 20,
    "^": 30,
  };
function croak(msg) {
  let err = new Error(msg);
  throw err;
}
function throwSyntaxError() {
  croak("Syntax Error");
}
function throwMathError() {
  croak("Math Error");
}
function num(x) {
  if (typeof x != TYPES.Number.toLowerCase()) throwSyntaxError();
  return x;
}
function div(x) {
  if (num(x) == 0) throwMathError();
  return x;
}
function isDig(c) {
  return NUMS.indexOf(c) >= 0;
}
function isPunc(c) {
  return PUNCS.indexOf(c) >= 0;
}
function isOp(c) {
  return OPS.indexOf(c) >= 0;
}
function isWhs(c) {
  return c == " ";
}
function evaulate(exp) {
  if (exp.type == TYPES.Number) return exp.value;
  if (exp.type == TYPES.Binary) {
    const [op, a, b] = [exp.operator, evaulate(exp.left), evaulate(exp.right)];
    switch (op) {
      case "+":
        return num(a) + num(b);
      case "-":
        return num(a) - num(b);
      case "*":
        return num(a) * num(b);
      case "/":
        return num(a) / div(b);
      case "^":
        return Math.pow(a, b);
    }
  }
  throwSyntaxError();
}
function Inst(input) {
  let pos = 0;
  const peek = () => input.charAt(pos);
  const next = () => input.charAt(pos++);
  const eof = () => !peek();
  return {
    peek,
    next,
    eof,
  };
}
function Tknst(inst) {
  let current = null;
  const readWhile = (predicate) => {
    let result = "";
    while (!inst.eof() && predicate(inst.peek())) result += inst.next();
    return result;
  };
  const skipWhitespaces = () => {
    readWhile(isWhs);
  };
  const readNext = () => {
    skipWhitespaces();
    let ch = inst.peek();
    if (inst.eof()) return null;
    if (isDig(ch)) return readDig();
    if (isPunc(ch)) return readPunc();
    if (isOp(ch)) return readOp();
    throwSyntaxError();
  };
  const readDig = () => {
    var doted = false;
    return {
      type: TYPES.Number,
      value: parseFloat(
        readWhile(function (ch) {
          if (ch == ".") {
            if (doted) return false;
            doted = true;
            return true;
          }
          return isDig(ch);
        })
      ),
    };
  };
  const readPunc = () => ({
    type: TYPES.Punction,
    value: inst.next(),
  });
  const readOp = () => ({
    type: TYPES.Operator,
    value: inst.next(),
  });
  const peek = () => {
    if (!current) {
      current = readNext();
    }
    return current;
  };
  const next = () => {
    let tok = current;
    current = null;
    return tok || readNext();
  };
  const eof = () => !peek();
  return {
    peek,
    next,
    eof,
  };
}
function Ast(tknst) {
  function parseAtom() {
    let token = tknst.next() || {};
    if (token.type == TYPES.Punction && token.value == "(") {
      var exp = parseBinary(parseAtom(), 0);
      if (tknst.peek().value == ")") tknst.next();
      else throwSyntaxError();
      return exp;
    }
    if (token.type == TYPES.Number) return token;
    throwSyntaxError();
  }
  function parseBinary(left, myPrec) {
    var token = tknst.peek() || {};
    if (token.type == TYPES.Operator) {
      var hisPrec = PRECEDENCE[token.value];
      if (hisPrec > myPrec) {
        tknst.next();
        return parseBinary(
          {
            type: TYPES.Binary,
            operator: token.value,
            left: left,
            right: parseBinary(parseAtom(), hisPrec),
          },
          myPrec
        );
      }
    }
    return left;
  }
  return {
    parse: () => parseBinary(parseAtom(), 0),
  };
}
function calc(expr) {
  const inst = Inst(expr);
  const tknst = Tknst(inst);
  const ast = Ast(tknst);
  const prog = ast.parse();
  return evaulate(prog);
}
exports.calc = calc;
