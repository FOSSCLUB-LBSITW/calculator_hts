let input = document.getElementById("inputBox");
let buttons = document.querySelectorAll(".calc button");
let preview = document.getElementById("preview");
let string = "";
const allowedKeys = "0123456789+-*/().!%";

let lastOperator = null;
let lastOperand = null;
let lastResult = null;

let memory = 0;

// ==================== COPY BUTTON ====================
const copyBtn = document.getElementById("copyBtn");
let copyTimeout = null;

function showCopyBtn() {
    copyBtn.style.display = "block";
}

function hideCopyBtn() {
    copyBtn.style.display = "none";
    copyBtn.textContent = "📋";
    copyBtn.classList.remove("copied");
    clearTimeout(copyTimeout);
}

copyBtn.addEventListener("click", () => {
    const result = input.value;

    if (!result || result === "Error" || result === "Can't divide by zero") return;

    navigator.clipboard.writeText(result).then(() => {
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("copied");

        clearTimeout(copyTimeout);

        copyTimeout = setTimeout(() => {
            copyBtn.textContent = "📋";
            copyBtn.classList.remove("copied");
        }, 2000);
    });
});

// ==================== FACTORIAL ====================
function factorial(n) {

    if (n < 0 || !Number.isInteger(n)) return "Error";
    if (n > 170) return "Too Large";

    let fact = 1;

    for (let i = 1; i <= n; i++) {
        fact *= i;
    }

    return fact;
}

// ==================== PREPROCESS STRING ====================
function preprocessString(str) {
    let processed = str.replace(/(\d+\.?\d*)!/g, (match, p1) => {
        let n = parseFloat(p1);
        let f = factorial(n);
        if (f === "Error" || f === "Too Large") throw new Error(f);
        return f;
    });
    processed = processed.replace(/(\d+\.?\d*)%/g, "(($1)/100)");
    return processed;
}
// =====================================================

// ==================== LIVE PREVIEW ====================
function updatePreview() {

    if (!string) {
        preview.textContent = "";
        return;
    }

    try {
        let processed = preprocessString(string);
        let result = eval(processed);

        if (!isFinite(result)) {
            preview.textContent = "";
            return;
        }

        preview.textContent = "= " + result;

    } catch {
        preview.textContent = "";
    }
}

// ==================== CALCULATE FUNCTION ====================
function calculate() {
    if (!input.value) return;

    try {
        // If "=" pressed repeatedly
        if (string === "" && lastOperator && lastOperand !== null) {
            let expression = lastResult + lastOperator + lastOperand;
            lastResult = eval(expression);
            input.value = lastResult;
            showCopyBtn();
            return;
        }

        let processed = preprocessString(string);
        let result = eval(processed);

        if (!isFinite(result)) {
            input.value = "Can't divide by zero";
            string = "";
            preview.textContent = "";
            hideCopyBtn();
            return;
        }

        // Save last operator and operand
        let match = string.match(/([+\-*/])(\d+\.?\d*)$/);
        if (match) {
            lastOperator = match[1];
            lastOperand = match[2];
        }

        lastResult = result;

        input.value = result;
        string = "";
        preview.textContent = "";
        showCopyBtn();

    } catch {
        input.value = "Error";
        string = "";
        preview.textContent = "";
        hideCopyBtn();
    }
}

// =====================================================

// ==================== BUTTON CLICK ====================
buttons.forEach((button) => {

    button.addEventListener("click", (e) => {

        let value = e.target.innerHTML;

        if (input.value === "Error" || input.value === "Can't divide by zero" || input.value === "Too Large") {
            if (value !== "AC") {
                input.value = "";
                string = "";
            }
        }
        // ===== MEMORY FUNCTIONS =====

        if (value === "MC") {
            memory = 0;
            return;
        }

        else if (value === "MR") {
            input.value = memory;
            string = memory.toString();
            showCopyBtn();
            return;
        }

        else if (value === "M+") {
            if (!isNaN(input.value) && input.value !== "") {
                memory += parseFloat(input.value);
            }
            return;
        }

        else if (value === "M-") {
            if (!isNaN(input.value) && input.value !== "") {
                memory -= parseFloat(input.value);
            }
            return;
        }

        // ===== CALCULATE =====

        else if (value === "=") {
            calculate();
        }

        else if (value === "AC") {

            string = "";
            input.value = "";
            preview.textContent = "";
            hideCopyBtn();

            lastOperator = null;
            lastOperand = null;
            lastResult = null;
        }

        else if (value === "DEL") {

            string = input.value.slice(0, -1);
            input.value = string;

            if (!string) hideCopyBtn();

            updatePreview();
        }

        else if (value === "√") {

            let num = parseFloat(input.value);

            if (num < 0 || isNaN(num)) {

                input.value = "Error";
                string = "";
                hideCopyBtn();

            } else {

                input.value = Math.sqrt(num);
                string = input.value;
                showCopyBtn();
            }

            preview.textContent = "";
        }

        else if (value === "!") {
            if (string !== "" && "+-*/(".includes(string.slice(-1))) return;
            string += "!";
            input.value = string;
            hideCopyBtn();
            updatePreview();
        }

        else if (value === "%") {
            if (string !== "" && "+-*/(".includes(string.slice(-1))) return;
            string += "%";
            input.value = string;
            hideCopyBtn();
            updatePreview();
        }

        else if (!isNaN(value) || value === "+" || value === "-" || (string !== "" && "+-*/().!%".includes(value))) {
            if ("+-*/".includes(value) && "+-*/".includes(string.slice(-1))) {

                if (string.length === 1 && !"+-".includes(value)) return;

                string = string.slice(0, -1);
            }

            // Explicitly block multiple zeros
            if ((value === "0" || value === "00") && (string === "0" || string.match(/[+\-*/(]0$/))) {
                return;
            }

            // Block multiple decimals in the same number
            if (value === ".") {
                let parts = string.split(/[+\-*/()!%]/);
                let currentNumber = parts[parts.length - 1];
                if (currentNumber.includes(".")) {
                    return;
                }
            }

            string += value;
            // Additional cleanup just to be safe
            string = string.replace(/(^|[+\-*/(])0+(?=\d)/g, '$1');

            input.value = string;

            hideCopyBtn();

            updatePreview();
        }

        input.scrollLeft = input.scrollWidth;
    });
});
// =====================================================

// ==================== ENTER KEY SUPPORT ====================
document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        string = input.value;
        calculate();
    } else if (e.key === "Escape") {
        string = "";
        input.value = "";
        lastOperator = null;
        lastOperand = null;
        lastResult = null;
        preview.textContent = "";
        hideCopyBtn();
    }
});

// ==================== INPUT LISTENER ====================
input.addEventListener("input", () => {
    // Strip leading zeros
    input.value = input.value.replace(/(^|[+\-*/(])0+(?=\d)/g, '$1');
    string = input.value;
    updatePreview();
});

// ==================== BLOCK INVALID KEYBOARD INPUT ====================
input.addEventListener("keydown", (e) => {
    if (input.value === "Error" || input.value === "Can't divide by zero" || input.value === "Too Large") {
        if (allowedKeys.includes(e.key) || e.key === "Backspace" || e.key === "Delete") {
            input.value = "";
            string = "";
        }
    }

    if (
        !allowedKeys.includes(e.key) &&
        e.key !== "Backspace" &&
        e.key !== "Delete" &&
        e.key !== "Enter" &&
        e.key !== "Escape" &&
        e.key !== "ArrowLeft" &&
        e.key !== "ArrowRight"
    ) {
        e.preventDefault();
        return;
    }

    if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Enter", "Tab", "Escape"].includes(e.key)) return;

    const isAtStart = input.selectionStart === 0;
    const isOp = "+-*/".includes(e.key);
    const lastOp = "+-*/".includes(input.value.slice(-1));

    if ((isAtStart && !"+-0123456789".includes(e.key)) || !allowedKeys.includes(e.key)) return e.preventDefault();

    if (isOp && lastOp && input.selectionStart === input.value.length) {
        if (input.value.length === 1 && !"+-".includes(e.key)) return e.preventDefault();
        e.preventDefault();
        input.value = string = input.value.slice(0, -1) + e.key;
    }

    // Additional checks from PR 93 (Multiple Decimals)
    // Block multiple decimals via keyboard
    if (e.key === ".") {
        let parts = input.value.split(/[+\-*/()!%]/);
        let currentNumber = parts[parts.length - 1];
        if (currentNumber.includes(".")) {
            return e.preventDefault();
        }
    }
});

// ==================== PASTE SUPPORT ====================
input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");

    // Validate if the pasted text only consists of allowed keys
    const isValid = pasted.split("").every(char => allowedKeys.includes(char));

    if (isValid && pasted.trim() !== "") {
        input.value = pasted.trim();
        string = input.value;
        hideCopyBtn();
        updatePreview();
    }
});
// =====================================================

// ==================== UNIT CONVERTER ====================
const unitToggle = document.getElementById("unitToggle");
const unitPanel = document.getElementById("unitPanel");
const unitCategory = document.getElementById("unitCategory");
const unitFrom = document.getElementById("unitFrom");
const unitTo = document.getElementById("unitTo");
const unitInputEl = document.getElementById("unitInput");
const unitResult = document.getElementById("unitResult");
const unitUseResult = document.getElementById("unitUseResult");

const unitData = {
    length: {
        units: ["m", "km", "cm", "mm", "mi", "yd", "ft", "in"],
        toBase: { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.344, yd:0.9144, ft:0.3048, in:0.0254 }
    },
    weight: {
        units: ["kg", "g", "mg", "lb", "oz", "t"],
        toBase: { kg:1, g:0.001, mg:0.000001, lb:0.453592, oz:0.0283495, t:1000 }
    },
    temperature: {
        units: ["°C", "°F", "K"],
        toBase: null // special case
    },
    area: {
        units: ["m²", "km²", "cm²", "ft²", "in²", "acre", "ha"],
        toBase: { "m²":1, "km²":1e6, "cm²":0.0001, "ft²":0.092903, "in²":0.00064516, "acre":4046.86, "ha":10000 }
    },
    speed: {
        units: ["m/s", "km/h", "mph", "knot"],
        toBase: { "m/s":1, "km/h":0.277778, "mph":0.44704, "knot":0.514444 }
    },
    volume: {
        units: ["L", "mL", "m³", "ft³", "gal", "qt", "pt", "fl oz"],
        toBase: { "L":1, "mL":0.001, "m³":1000, "ft³":28.3168, "gal":3.78541, "qt":0.946353, "pt":0.473176, "fl oz":0.0295735 }
    },
    data: {
        units: ["B", "KB", "MB", "GB", "TB"],
        toBase: { "B":1, "KB":1024, "MB":1048576, "GB":1073741824, "TB":1099511627776 }
    }
};

function populateUnitSelects() {
    const cat = unitCategory.value;
    const units = unitData[cat].units;
    [unitFrom, unitTo].forEach((sel, idx) => {
        sel.innerHTML = "";
        units.forEach((u, i) => {
            const opt = document.createElement("option");
            opt.value = u; opt.textContent = u;
            if (idx === 0 && i === 0) opt.selected = true;
            if (idx === 1 && i === 1) opt.selected = true;
            sel.appendChild(opt);
        });
    });
    doConvert();
}

function convertTemperature(val, from, to) {
    let celsius;
    if (from === "°C") celsius = val;
    else if (from === "°F") celsius = (val - 32) * 5/9;
    else celsius = val - 273.15;

    if (to === "°C") return celsius;
    if (to === "°F") return celsius * 9/5 + 32;
    return celsius + 273.15;
}

function doConvert() {
    const val = parseFloat(unitInputEl.value);
    if (isNaN(val)) { unitResult.textContent = "—"; return; }
    const cat = unitCategory.value;
    const from = unitFrom.value;
    const to = unitTo.value;

    let result;
    if (cat === "temperature") {
        result = convertTemperature(val, from, to);
    } else {
        const base = val * unitData[cat].toBase[from];
        result = base / unitData[cat].toBase[to];
    }

    const formatted = parseFloat(result.toPrecision(10));
    unitResult.textContent = `${formatted} ${to}`;
    unitUseResult.dataset.value = formatted;
}

unitToggle.addEventListener("click", () => unitPanel.classList.toggle("hidden"));
unitCategory.addEventListener("change", populateUnitSelects);
unitFrom.addEventListener("change", doConvert);
unitTo.addEventListener("change", doConvert);
unitInputEl.addEventListener("input", doConvert);

unitUseResult.addEventListener("click", () => {
    const val = unitUseResult.dataset.value;
    if (!val) return;
    string = val;
    input.value = string;
    showCopyBtn();
    updatePreview();
    unitPanel.classList.add("hidden");
});

// Init
populateUnitSelects();
// =====================================================
