// Get elements
let input = document.getElementById("inputBox");
let preview = document.getElementById("preview");
let copyBtn = document.getElementById("copyBtn");
let scientificModeBtn = document.getElementById("scientificModeBtn");
let basicModeBtn = document.getElementById("basicModeBtn");
let scientificButtons = document.getElementById("scientificButtons");

// Variables
let string = "";
let isScientificMode = false;
let copyTimeout = null;

// ==================== INITIAL SETUP ====================
scientificButtons.style.display = "none";
scientificModeBtn.style.display = "inline-flex";
basicModeBtn.style.display = "none";

// ==================== SCIENTIFIC MODE BUTTON ====================
scientificModeBtn.onclick = function() {
    scientificButtons.style.display = "grid";
    scientificModeBtn.style.display = "none";
    basicModeBtn.style.display = "flex";
    isScientificMode = true;
    preview.innerHTML = "";
};

// ==================== BASIC MODE BUTTON ====================
basicModeBtn.onclick = function() {
    scientificButtons.style.display = "none";
    basicModeBtn.style.display = "none";
    scientificModeBtn.style.display = "flex";
    isScientificMode = false;
    preview.innerHTML = "";
};

// ==================== COPY BUTTON ====================
function showCopyBtn() {
    copyBtn.style.display = "block";
}

function hideCopyBtn() {
    copyBtn.style.display = "none";
    copyBtn.innerHTML = "📋";
    copyBtn.classList.remove("copied");
    clearTimeout(copyTimeout);
}

copyBtn.onclick = function() {
    let result = input.value;
    if (!result || result === "Error") return;

    navigator.clipboard.writeText(result).then(() => {
        copyBtn.innerHTML = "✓";
        copyBtn.classList.add("copied");
        clearTimeout(copyTimeout);
        copyTimeout = setTimeout(() => {
            copyBtn.innerHTML = "📋";
            copyBtn.classList.remove("copied");
        }, 1500);
    });
};

// ==================== FACTORIAL ====================
function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return "Error";
    if (n === 0 || n === 1) return 1;
    let fact = 1;
    for (let i = 2; i <= n; i++) {
        fact *= i;
    }
    return fact;
}

// ==================== SCIENTIFIC CALCULATIONS ====================
function calculateScientific(expr) {
    try {
        expr = expr
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/\^/g, '**')
            .replace(/\|x\|/g, 'Math.abs(')
            .replace(/exp\(/g, 'Math.exp(')
            .replace(/mod/g, '%');
        
        return eval(expr);
    } catch {
        return "Error";
    }
}

// ==================== UPDATE PREVIEW ====================
function updatePreview() {
    if (!string) {
        preview.innerHTML = "";
        return;
    }
    try {
        let result = eval(string);
        if (!isFinite(result)) {
            preview.innerHTML = "";
            return;
        }
        preview.innerHTML = "= " + result;
    } catch {
        preview.innerHTML = "";
    }
}

// ==================== SCIENTIFIC BUTTONS ====================
document.querySelectorAll('.sci-operator').forEach(btn => {
    btn.onclick = function() {
        let value = this.innerHTML;
        
        switch(value) {
            case 'sin': case 'cos': case 'tan': case 'log': case 'ln': case 'exp':
                string += value + '(';
                break;
            case 'π':
                string += 'π';
                break;
            case 'e':
                string += 'e';
                break;
            case 'x²':
                string += '**2';
                break;
            case 'x³':
                string += '**3';
                break;
            case 'x^y':
                string += '^';
                break;
            case '10^x':
                string += '10^';
                break;
            case '1/x':
                string = string ? '1/(' + string + ')' : '1/1';
                break;
            case '|x|':
                string = string ? 'Math.abs(' + string + ')' : 'Math.abs(0)';
                break;
            case 'mod':
                string += '%';
                break;
            case '(':
                string += '(';
                break;
            case ')':
                string += ')';
                break;
        }
        
        input.value = string;
        hideCopyBtn();
        updatePreview();
    };
});

// ==================== MAIN BUTTONS ====================
document.querySelectorAll(".buttons-grid button, .row button").forEach(btn => {
    btn.onclick = function() {
        let value = this.innerHTML;
        
        if (value === "AC") {
            input.value = "";
            string = "";
            preview.innerHTML = "";
            hideCopyBtn();
        }
        else if (value === "DEL") {
            string = string.slice(0, -1);
            input.value = string;
            hideCopyBtn();
            updatePreview();
        }
        else if (value === "√") {
            let num = parseFloat(string) || 0;
            if (num < 0) {
                input.value = "Error";
                string = "";
                hideCopyBtn();
            } else {
                input.value = Math.sqrt(num);
                string = input.value.toString();
                showCopyBtn();
            }
            preview.innerHTML = "";
        }
        else if (value === "!") {
            let num = parseInt(string) || 0;
            let result = factorial(num);
            input.value = result;
            string = result.toString();
            preview.innerHTML = "";
            result !== "Error" ? showCopyBtn() : hideCopyBtn();
        }
        else if (value === "=") {
            try {
                let result = isScientificMode ? calculateScientific(string) : eval(string);
                if (!isFinite(result) || result === "Error") {
                    input.value = "Error";
                    string = "";
                    hideCopyBtn();
                } else {
                    input.value = result;
                    string = result.toString();
                    showCopyBtn();
                }
                preview.innerHTML = "";
            } catch {
                input.value = "Error";
                string = "";
                hideCopyBtn();
                preview.innerHTML = "";
            }
        }
        else {
            if ("+-*/%".includes(value) && "+-*/%".includes(string.slice(-1))) {
                string = string.slice(0, -1);
            }
            string += value;
            input.value = string;
            hideCopyBtn();
            updatePreview();
        }
    };
});

// ==================== KEYBOARD SUPPORT ====================
document.onkeydown = function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        try {
            let result = isScientificMode ? calculateScientific(string) : eval(string);
            if (!isFinite(result) || result === "Error") {
                input.value = "Error";
                string = "";
                hideCopyBtn();
            } else {
                input.value = result;
                string = result.toString();
                showCopyBtn();
            }
            preview.innerHTML = "";
        } catch {
            input.value = "Error";
            string = "";
            hideCopyBtn();
            preview.innerHTML = "";
        }
    }
    
    if (e.key === "Backspace") {
        string = string.slice(0, -1);
        input.value = string;
        updatePreview();
        if (!string) hideCopyBtn();
    }
};

// ==================== BLOCK TYPING ====================
input.onkeydown = function(e) {
    e.preventDefault();
};

// ==================== INITIALIZE ====================
hideCopyBtn();