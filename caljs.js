const NUMS = "0123456789",
  PUNCS = "(),",
  OPS = "+-*/^",
  AZ = /[a-zA-Z]/,
  TYPES = {
    Number: "Number",
    Operator: "Operator",
    Inverse: "Inverse",
    Punction: "Punction",
    Binary: "Binary",
    Identifier: "Identifier",
    Call: "Call"
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
function isIdent(c) {
  return AZ.test(c);
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
        return Math.pow(num(a), num(b));
    }
  }
  if (exp.type == TYPES.Identifier) {
    switch (exp.value) {
      case "PI":
        return Math.PI;
      case "E":
        return Math.E;
    }
  }
  if (exp.type == TYPES.Call) {
    const args = exp.args.map(arg => evaulate(arg));
    if (exp.fn.type == TYPES.Number) {
      if (args.length != 1) throwSyntaxError();
      return num(exp.fn.value) * num(args.shift())
    }
    switch (exp.fn.value) {
      case "log":
        if (args.length == 1) return Math.log(...args);
      case "sin":
        if (args.length == 1) return Math.sin(...args);
      case "cos":
        if (args.length == 1) return Math.cos(...args);
      case "tan":
        if (args.length == 1) return Math.tan(...args);
      case "abs":
        if (args.length == 1) return Math.abs(...args);
      case "sqrt":
        if (args.length == 1) return Math.sqrt(...args);
      case "pow":
        if (args.length == 2) return Math.pow(...args);
    }
  }
  if (exp.type == TYPES.Inverse) {
    return -evaulate(exp.expr);
  }
  throwSyntaxError();
}

function Tknst(input) {
  let inst = {
    pos: 0,
    peek: function () { return input.charAt(this.pos) },
    next: function () { return input.charAt(this.pos++) },
    eof: function () { return !this.peek() }
  }
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
    if (isIdent(ch)) return readIdent();
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
  const readIdent = () => ({
    type: TYPES.Identifier,
    value: readWhile(isIdent)
  })
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
  function parse() {
    return checkCall(() => parseBinary(parseAtom(), 0));
  }
  function checkCall(expression) {
    expression = expression();
    const token = tknst.peek() || {};
    if (token.type == TYPES.Punction && token.value == "(") {
      const args = [];
      var first = true;
      tknst.next();
      while (!tknst.eof()) {
        if (tknst.peek() && tknst.peek().type == TYPES.Punction && tknst.peek().value == ")") break;
        if (!first && tknst.peek().type == TYPES.Punction && tknst.peek().value == ",")
          tknst.next();
        else
          !first && throwSyntaxError();
        if (tknst.peek() && tknst.peek().type == TYPES.Punction && tknst.peek().value == ")") break;
        first = false;
        args.push(parse());
      }
      if (tknst.peek() && tknst.peek().type == TYPES.Punction && tknst.peek().value == ")")
        tknst.next();
      else
        throwSyntaxError();;
      return {
        type: TYPES.Call,
        fn: expression,
        args
      };
    } else return expression;
  }
  function parseAtom() {
    return checkCall(function () {
      let token = tknst.peek() || {};
      if (token.type == TYPES.Punction && token.value == "(") {
        tknst.next()
        var exp = parse();
        if (tknst.peek().value == ")") tknst.next();
        else throwSyntaxError();
        return exp;
      }
      if ([TYPES.Number, TYPES.Identifier].includes(token.type)) {
        tknst.next()
        return token;
      };
      if (token.value == "-" && tknst.next()) {
        if (!tknst.peek() || tknst.peek().type == TYPES.Operator) throwSyntaxError();
        return {
          type: TYPES.Inverse,
          expr: parseAtom()
        }
      };
      throwSyntaxError();
    });
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
    parse
  };
}

function eval(expr) {
  const tknst = Tknst(expr);
  const prog = Ast(tknst).parse();

  if (!tknst.eof()) throwSyntaxError();

  let result = evaulate(prog);

  return result;
};

module.exports.eval = eval;