let input = document.getElementById("inputBox");
let buttons = document.querySelectorAll(".calc button");
let string = ""; // internal memory that keeps track of the current expression
let resultJustCalculated = false; //flag to tell if the current display is a finished result or if the user is still typing

//copy btn----------------------------------------------
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
// ------------------------------------------

// Factorial function
function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return "Error";
    if (n === 0) return 1;
    let fact = 1;
    for (let i = 1; i <= n; i++) {
        fact *= i;
    }
    return fact;
}

/** 
 * calculation logic used by = and Enter key (calculateResult() fn is called when =/ Enter key is pressed)
 */
function calculateResult() {
    if (!string) return;
    try {
        // Pre-process string for square root and factorial
        // Replace √[number] with Math.sqrt([number])
        // Replace [number]! with factorial([number])
        let processedString = string
            .replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)')
            .replace(/(\d+(\.\d+)?)!/g, 'factorial($1)');

        let result = eval(processedString);

        if (!isFinite(result)) {
            input.value = "Can't divide by zero";
            string = "";
            resultJustCalculated = false;
            hideCopyBtn();
        } else {
            // Round to a  decimal place to avoid floating point issues
            result = parseFloat(result.toFixed(10));
            input.value = result;
            string = result.toString();
            resultJustCalculated = true;
            showCopyBtn();
        }
    } catch {
        input.value = "Error";
        string = "";
        resultJustCalculated = false;
        hideCopyBtn();
    }
}

// Keep the code variable 'string' in sync with manual typing in the input box
input.addEventListener("input", (e) => {
    string = e.target.value;
    resultJustCalculated = false;
    hideCopyBtn();
});

buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
        let value = e.target.innerHTML;

        if (value === "=") {
            calculateResult();
        }

        else if (value === "AC") {
            string = "";
            input.value = "";
            resultJustCalculated = false;
            hideCopyBtn();
        }

        else if (value === "DEL") {
            if (resultJustCalculated) {
                // If we just got a result, DEL clears everything
                string = "";
                input.value = "";
                resultJustCalculated = false;
                hideCopyBtn();
            } else {
                string = string.slice(0, -1);
                input.value = string;
                if (!string) hideCopyBtn();
            }
        }

        else if (value === "√") {
            if (resultJustCalculated) {
                string = "√";
                resultJustCalculated = false;
            } else {
                string += "√";
            }
            input.value = string;
            hideCopyBtn();
        }

        else if (value === "!") {
            if (resultJustCalculated) {
                // If we just got a result, we can apply factorial to it
                string += "!";
                resultJustCalculated = false;
            } else {
                string += "!";
            }
            input.value = string;
            hideCopyBtn();
        }

        else {
            // Handle number/operator button clicks
            if (resultJustCalculated) {
                if (/[0-9.]/.test(value)) {
                    // Start fresh if a number is pressed after a result
                    string = value;
                } else {
                    // Continue with the result if an operator is pressed
                    string += value;
                }
                resultJustCalculated = false;
                hideCopyBtn();
            } else {
                string += value;
            }

            // Basic leading zero handling
            string = string.replace(/(^|[+\-*/(])0+(?=\d)/g, '$1');
            input.value = string;
        }
        input.scrollLeft = input.scrollWidth;
    });
});

// Enter key support
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        calculateResult();
    }
});

// Block invalid keyboard characters directly in the input
const allowedKeys = "0123456789+-*/().!√";
input.addEventListener("keypress", (e) => {
    // Note: DEL and BACKSPACE don't trigger keypress in most browsers, 
    // but the 'input' event listener handles synchronization.
    if (!allowedKeys.includes(e.key)) {
        e.preventDefault();
    }
});

// Function to validate if pasted content contains only allowed characters
function isValidExpression(expression) {
    const allowedChars = /^[0-9+\-*/(). √!]*$/;
    return allowedChars.test(expression);
}

// Allow pasting and keep string in sync with validation
input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    
    // Validate the pasted content
    if (isValidExpression(pasted)) {
        string = pasted;
        input.value = string;
        resultJustCalculated = false;
        hideCopyBtn();
    } else {
        // Show error if invalid characters are detected
        input.value = "Invalid expression";
        string = "";
        resultJustCalculated = false;
        hideCopyBtn();
    }
});
