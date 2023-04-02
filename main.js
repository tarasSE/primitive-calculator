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

// Got it from https://www.builder.io/blog/relative-time
function format(date, lang = navigator.language) {
  // Allow dates or times to be passed
  const timeMs = typeof date === "number" ? date : date.getTime();

  // Get the amount of seconds between the given date and now
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

  // Array reprsenting one minute, hour, day, week, month, etc in seconds
  const cutoffs = [
    60,
    3600,
    86400,
    86400 * 7,
    86400 * 30,
    86400 * 365,
    Infinity,
  ];

  // Array equivalent to the above but in the string representation of the units
  const units = ["second", "minute", "hour", "day", "week", "month", "year"];

  // Grab the ideal cutoff unit
  const unitIndex = cutoffs.findIndex(
    (cutoff) => cutoff > Math.abs(deltaSeconds)
  );

  // Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
  // is one day in seconds, so we can divide our seconds by this to get the # of days
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  // Intl.RelativeTimeFormat do its magic
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

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
