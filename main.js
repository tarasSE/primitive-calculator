const format = window.timeago().format;
const history = document.querySelector(".history");
const root = document.querySelector(".root");
const expr = document.querySelector(".expression");
const ansr = document.querySelector(".answer");
const btns = [...document.querySelectorAll(".btn")];
expr.value = "";

const allowed = new Set([
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "Enter",
  "=",
  "/",
  "*",
  "+",
  "-",
]);

class Publisher {
  _subscribers = new Set();

  notify(message) {
    this._subscribers.forEach((send) => send(message));
  }

  subscribe(callback) {
    this._subscribers.add(callback);

    return function unsubscribe() {
      this._subscribers.delete(callback);
    };
  }
}

class Calculator extends Publisher {
  _root;
  _expressionElement;
  _answerElement;
  _buttons;
  _currentExpression = "";
  _currentAnswer = "";

  constructor(root, expressionElement, answerElement, buttons) {
    super();
    this._root = root;
    this._expressionElement = expressionElement;
    this._answerElement = answerElement;
    this._buttons = buttons;
  }

  setAnswer(value) {
    this.notify(` ${this._currentExpression} = ${value}`);

    this._currentAnswer = value;
    this._currentExpression = "";
    this._answerElement.innerText = this._currentAnswer;
    this._expressionElement.value = this._currentExpression;
  }

  clear() {
    this._currentExpression = "";
    this._currentAnswer = "0";
    this._answerElement.innerText = this._currentAnswer;
    this._expressionElement.value = this._currentExpression;
  }

  appendExpression(value) {
    this._currentExpression = this._currentExpression + value;
    this._expressionElement.value = this._currentExpression;

    console.log("CX:" + this._currentExpression);
  }

  init() {
    this._root.addEventListener("click", ({ target }) => {
      const value = String(target.dataset["value"]).trim();

      this._inputHandler(value);
    });

    this._root.addEventListener("keyup", (evt) => {
      let key = evt.key;
      if (!allowed.has(key)) {
        return;
      }

      if ("Enter" === key || "=" === key) {
        key = "Ans";
      }

      this._inputHandler(key);
    });

    return this;
  }

  _inputHandler = (value) => {
    console.log(`Input handler value: ${value}`);
    if (value === "Ans") {
      const value = this.evaluate(this._currentExpression);
      this.setAnswer(value);
    }

    if (value === "Clear") {
      this.clear();
    }

    if (/^[0-9]$/.test(value)) {
      this.appendExpression(value);
    }

    if (/^[+-/*]$/.test(value)) {
      this.appendExpression(` ${value} `);
    }

    console.log(value);
  };

  evaluate(expression) {
    return eval(expression);
  }
}

class ArrayHistory {
  _historyElement;
  _items = new Map();

  constructor(historyElement) {
    this._historyElement = historyElement;
  }

  toString() {
    let result = "";
    this._items.forEach((v, k) => {
      result = result + "\n" + `${format(k)}: [ ${v} ]`;
    });

    return result;
  }

  append(item) {
    console.log(`History append ${item}`);
    this._items.set(new Date(), item);
    this._historyElement.innerText = this.toString();
  }
}

const hist = new ArrayHistory(history);
const calc = new Calculator(root, expr, ansr, btns).init();
const unsubscribe = calc.subscribe((message) => hist.append(message));
