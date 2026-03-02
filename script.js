let input = document.getElementById("inputBox");
let buttons = document.querySelectorAll(".calc button");
let preview = document.getElementById("preview");
let string = "";
const allowedKeys = "0123456789+-*/().!";

let lastOperator = null;
let lastOperand = null;
let lastResult = null;

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
    }).catch(() => {
        input.select();
        document.execCommand("copy");
    });
});
// =====================================================


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
// =====================================================


// ==================== LIVE PREVIEW ====================
function updatePreview() {
    if (!string) {
        preview.textContent = "";
        return;
    }

    try {
        let result = eval(string);
        if (!isFinite(result)) {
            preview.textContent = "";
            return;
        }
        preview.textContent = "= " + result;
    } catch {
        preview.textContent = "";
    }
}
// =====================================================


// ==================== CALCULATE FUNCTION ====================
function calculate() {
    try {

        // If "=" pressed repeatedly
        if (string === "" && lastOperator && lastOperand !== null) {
            let expression = lastResult + lastOperator + lastOperand;
            lastResult = eval(expression);
            input.value = lastResult;
            showCopyBtn();
            return;
        }

        let result = eval(string);

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

/** Handles the evaluation of the current string expression */
function calculate() {
    try {
        // Ensure no leading zeros to prevent octal interpretation
        string = string.replace(/(^|[+\-*/(])0+(?=\d)/g, '$1');
        string = eval(string);
        // eval("5/0") returns Infinity — treat it as an error
        if (!isFinite(string)) {
            input.value = "Can't divide by zero";
            string = "";
            hideCopyBtn();
        } else {
            input.value = string;
            string = "";
            showCopyBtn();
        }
    } catch {
        input.value = "Error";
        string = "";
        hideCopyBtn();
    }
}
// =====================================================


// ==================== BUTTON CLICK ====================
buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
        let value = e.target.innerHTML;

        if (value === "=") {
            calculate();
        }

        else if (value === "AC") {
            string = "";
            input.value = "";
            lastOperator = null;
            lastOperand = null;
            lastResult = null;
            preview.textContent = "";
            hideCopyBtn();
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
            let num = parseFloat(input.value);
            let result = factorial(num);
            input.value = result;
            string = result !== "Error" ? String(result) : "";
            preview.textContent = "";
            result !== "Error" ? showCopyBtn() : hideCopyBtn();
        }

        else if (!isNaN(value) || value === "+" || value === "-" || (string !== "" && "+-*/().!".includes(value))) {
            if ("+-*/".includes(value) && "+-*/".includes(string.slice(-1))) {
                if (string.length === 1 && !"+-".includes(value)) return;
                string = string.slice(0, -1);
            }

            string += value;
            string = string.replace(/(^|[+\-*/(])0+(?=\d)/g, '$1');

            input.value = string;
            hideCopyBtn();
            updatePreview();
        }

        input.scrollLeft = input.scrollWidth;
    });
});
// =====================================================


// ==================== CALCULATE FUNCTION ====================
function calculate() {
    try {
        let result = eval(input.value);

        if (!isFinite(result)) {
            input.value = "Can't divide by zero";
            hideCopyBtn();
            string = "";
        } else {
            input.value = result;
            showCopyBtn();
            string = String(result);
        }

        preview.textContent = "";
    } catch {
        input.value = "Error";
        string = "";
        hideCopyBtn();
    }
}
// =====================================================


// ==================== ENTER KEY SUPPORT ====================
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        // If the user types directly into the box, we need to update 'string' before calculating
        string = input.value;
        calculate();
    }
});

// Sync the 'string' variable with manual input edits
input.addEventListener("input", (e) => {
    string = e.target.value;
});

// ==================== BLOCK INVALID KEYBOARD INPUT ====================

input.addEventListener("keydown", (e) => {
    if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Enter", "Tab"].includes(e.key)) return;
    
    const isAtStart = input.selectionStart === 0;
    const isOp = "+-*/".includes(e.key);
    const lastOp = "+-*/".includes(input.value.slice(-1));

    if ((isAtStart && !"+-0123456789".includes(e.key)) || !allowedKeys.includes(e.key)) return e.preventDefault();

    if (isOp && lastOp && input.selectionStart === input.value.length) {
        if (input.value.length === 1 && !"+-".includes(e.key)) return e.preventDefault();
        e.preventDefault();
        input.value = string = input.value.slice(0, -1) + e.key;
    }
});
// =====================================================


// ==================== PASTE SUPPORT ====================
input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");

    if (!isNaN(pasted) && pasted.trim() !== "") {
        input.value = pasted.trim();
        string = input.value;
        hideCopyBtn();
        updatePreview();
    }
    if ("+-*/".includes(e.key) && "+-*/".includes(input.value.slice(-1))) input.value = input.value.slice(0, -1);
// =====================================================


// ==================== INPUT LISTENER ====================
input.addEventListener("input", () => {
    string = input.value;
    updatePreview();
});
// =====================================================