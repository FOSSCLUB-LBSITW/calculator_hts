let input = document.getElementById("inputBox");
let buttons = document.querySelectorAll(".calc button");
let preview = document.getElementById("preview");
let string = "";

const allowedKeys = "0123456789+-*/().!";

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

// ==================== CALCULATE FUNCTION ====================
function calculate() {

    try {

        let result = eval(string);

        if (!isFinite(result)) {

            input.value = "Can't divide by zero";
            string = "";
            hideCopyBtn();

        } else {

            input.value = result;
            string = String(result);
            showCopyBtn();
        }

        preview.textContent = "";

    } catch {

        input.value = "Error";
        string = "";
        hideCopyBtn();
    }
}

// ==================== BUTTON CLICK ====================
buttons.forEach((button) => {

    button.addEventListener("click", (e) => {

        let value = e.target.innerHTML;

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

            let num = parseFloat(input.value);
            let result = factorial(num);

            input.value = result;

            string = result !== "Error" ? String(result) : "";

            preview.textContent = "";

            result !== "Error" ? showCopyBtn() : hideCopyBtn();
        }

        else if (
            !isNaN(value) ||
            value === "+" ||
            value === "-" ||
            (string !== "" && "+-*/().!".includes(value))
        ) {

            if ("+-*/".includes(value) && "+-*/".includes(string.slice(-1))) {

                if (string.length === 1 && !"+-".includes(value)) return;

                string = string.slice(0, -1);
            }

            string += value;

            input.value = string;

            hideCopyBtn();

            updatePreview();
        }

        input.scrollLeft = input.scrollWidth;
    });
});

// ==================== ENTER KEY SUPPORT ====================
document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        string = input.value;
        calculate();
    }
});

// ==================== INPUT LISTENER ====================
input.addEventListener("input", () => {
    string = input.value;
    updatePreview();
});

// ==================== BLOCK INVALID KEYBOARD INPUT ====================
input.addEventListener("keydown", (e) => {

    if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Enter", "Tab"].includes(e.key)) return;

    if (!allowedKeys.includes(e.key)) {
        e.preventDefault();
    }
});