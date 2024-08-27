const wrongSpace = "·";
const similarQuotes = ['"', "'", '«', '»', '‘', '’', '‚', '“', '”', '„', '`', ',']
const similarBrackets = ['(', ')', '[', ']', '{', '}', '<', '>', '«', '»']
// const similarChars = await chrome.storage.sync.get("monkeyTypeSimilarChars");
// console.log(similarChars);
// TODO const overrideChar = true; // await chrome.storage.sync.get("monkeyTypeOverrideChar"); (next word on space, text monospace)
const writingTypes = [
    "addTypos", // normal mode always add typos 
    "markTypos", // mark typos with red color but don't add them (next word on space)
    "overrideTypos" // override char with the typo (next word on space, text monospace)
];


var isActive = false;
var caseSensitive = false; // await chrome.storage.sync.get("monkeyTypeCaseSensitive");
var showSummary = true;

var charIndex = 0;
var charCount = 0;
var errorCounter = 0;
var fixedCounter = 0;
var paragraph;
var nextChar;
var nextCharText;
var chars;
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key == "monkeyTypeCaseSensitive") {
            caseSensitive = newValue;
            console.log('monkeyTypeCaseSensitive: ' + caseSensitive);
        }
        if (key == "monkeyTypeAutoStart") {
            isActive = newValue;
            document.designMode = isActive ?  "on" : "off";
            console.log('monkeyTypeAutoStart: ' + isActive);
        }
        if (key == "monkeyTypeShowSummary") {
            showSummary = newValue;
            console.log('monkeyTypeShowSummary: ' + showSummary);
        }
    }
});
// on document ready

async function load() {


    console.log('DOMContentLoaded');
    caseSensitive = await chrome.storage.sync.get("monkeyTypeCaseSensitive");
    autoStart = await chrome.storage.sync.get("monkeyTypeAutoStart");
    console.log(autoStart);
    if (autoStart.monkeyTypeAutoStart) {
        document.designMode = "on";
        isActive = true;
    }
    showSummary = await chrome.storage.sync.get("monkeyTypeShowSummary");
    // initParagraph();
}

document.addEventListener("click", function (e) {
    console.log(isActive);
    
    if (isActive && !e.target.closest('.summary')) {
        initParagraph();
    }
});
// on keydown
document.addEventListener('keydown', e => {
    // F2 toggle on/off
    if (e.keyCode == 113) {
        isActive = !isActive;
        document.designMode = isActive ?  "on" : "off";
        console.log('designMode: ' + document.designMode);
    }
    // if not active or no paragraph
    if (!isActive || !paragraph ) {
        return;
    }
    // if ctrl or alt is pressed
    if (e.ctrlKey || e.altKey) {
        return;
    }
    updateIndex();
    console.log(e.key);
    
    if (charIndex < charCount) {
        nextChar = chars[charIndex];
        nextCharText = nextChar.innerText.replace(/\s/g, " ");
        console.log('Char: |' + nextCharText + '| charIndex: ' + charIndex + ' charCount: ' + charCount);
        console.log('key:  |' + e.key + '| keyCode: ' + e.keyCode);
    }
    // key is next char
    if ((!caseSensitive && e.key.toLocaleLowerCase() == nextCharText.toLocaleLowerCase()) || e.key == nextCharText || (similarQuotes.includes(e.key) && similarQuotes.includes(nextCharText)) || (similarBrackets.includes(e.key) && similarBrackets.includes(nextCharText))) {
        nextChar.style.opacity = "1";
        window.getSelection().modify("move", "forward", "character");
    }
    // if key is letter or number or spacial char or space
    else if (e.key.length == 1) {
        errorCounter++;
        var key = e.key != " " ? e.key : wrongSpace;
        var newChar = createChar(key, ["char", "wrong"], 1, "red");
        if (charIndex < charCount) {
            nextChar.before(newChar);
        } else {
            paragraph.appendChild(newChar);
        }
        window.getSelection().modify("move", "forward", "character");
    }
    // on keyCode enter
    else if (e.key == "Enter") {
        console.log('enter');
        window.getSelection().modify("move", "forward", "paragraph");
        window.getSelection().modify("move", "backward", "lineboundary");
        initParagraph();
    }
    else if (e.key == "Tab") {
        console.log('tab');
        window.getSelection().modify("move", "forward", "word");
        initParagraph();
    }
    else if (e.key == "Backspace") {
        console.log('backspace');
        if (charIndex > 0) {
            var char = chars[charIndex - 1];
            if (char.classList.contains("wrong")) {
                fixedCounter++;
                return;
            }
            window.getSelection().modify("move", "backward", "character");
            char.style.opacity = "0.5";
        }
    }
    else if (e.key == "Delete") {
        console.log('delete');
        if (nextChar == null || nextChar.classList.contains("wrong")) {

            return;
        }
        nextChar.style.opacity = "0.5";
    }
    else {
        console.log('else');
        return;
    }
    // console.log('preventDefault');
    // window.getSelection().focusNode.parentElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

    // console.log(window.getSelection().focusNode.parentElement);
    // chars[charIndex+1].scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

    e.preventDefault();
});

document.addEventListener('keyup', e => {
    if (!isActive || !paragraph) {
        return;
    }
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "ArrowLeft" || e.key == "ArrowRight") {
        initParagraph();
    }
    // if (charIndex + 1 < charCount) {
    // } else{
    //     window.getSelection().modify("move", "forward", "character");
    //     initParagraph();
    //     // return;
    // }
    window.getSelection().focusNode.parentElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
});
function updateIndex() {
    chars = paragraph.getElementsByClassName("char");
    charCount = chars.length;
    var char = window.getSelection().focusNode.parentElement;
    charIndex = 0;
    if (char.classList.contains("char")) {
        for (var i = 0; i < chars.length; i++) {
            if (chars[i] == char) {
                charIndex = i + window.getSelection().focusOffset;
                break;
            }
        }
    }
}
function initParagraph() {
    var element = window.getSelection().focusNode.parentElement;

    if (element.tagName == "BODY" || element.tagName == "HTML") {
        return;
    }
    // already initialized
    if (element.closest('.initialized')) {
        paragraph = element.closest('.initialized');
        return
    }
    if (paragraph && showSummary) {
        createSummary(paragraph);
    }
    console.log(element.tagName);
    wrapChilds(element);
    // display flex messes up the selection
    paragraph = element;
    if (window.getComputedStyle(paragraph).getPropertyValue('display') == "flex") {
        element.style.setProperty('display', 'block');
    }
    paragraph.classList.add("initialized");
    paragraph.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    updateIndex();
}

// wrap child elements
function wrapChilds(element) {
    if (element.childNodes.length > 0) {
        for (var i = 0; i < element.childNodes.length; i++) {
            console.log(element.childNodes[i].nodeName);
            
            if (element.childNodes[i].nodeName == "#text") {
                element.replaceChild(wrapText(element.childNodes[i].wholeText), element.childNodes[i]);
            }
            else if (element.childNodes[i].classList && !element.childNodes[i].classList.contains("char")) {
                wrapChilds(element.childNodes[i]);
            }
        }
    }
    return element;
}
function wrapText(text) {
    var chars = text.replace(/\s\s+/g, ' ').split("");
    console.log(text);
    var newText = document.createElement("span");
    for (var i = 0; i < chars.length; i++) {
        newText.appendChild(createChar(chars[i]));
    }
    newText.dataset.origText = text;
    return newText;
}
function createChar(text, classes = ["char"], opacity = 0.5, color = null) {
    var newChar = document.createElement("span");
    for (var i = 0; i < classes.length; i++) {
        newChar.classList.add(classes[i]);
    }
    newChar.style.opacity = opacity;
    newChar.style.color = color;
    newChar.textContent = text;
    return newChar;
}
function createSummary(paragraph){
    const currentErrors = paragraph.getElementsByClassName("wrong").length;
    let missing = 0
    console.log(paragraph.getElementsByClassName("char"));
    for (var i = 0; i < paragraph.getElementsByClassName("char").length; i++) {
        if (paragraph.getElementsByClassName("char")[i].style.opacity == "0.5") {
            missing++;
        }
    }
    // paragraph.getElementsByClassName("char").forEach(char => {
    //     if (char.style.opacity == "0.5") {
    //         missing++;
    //     }
    // });
    const summary = {
        "paragraph": paragraph,
        "charIndex": charIndex,
        "charCount": charCount,
        "errorCounter": errorCounter,
        "fixedCounter": fixedCounter,
        "errors": currentErrors,
        "missing": missing
    };
    console.log(summary);
    const summaryPopup = document.createElement("pre");
    summaryPopup.classList.add("summary");
    summaryPopup.innerHTML = JSON.stringify(summary, null, 2);
    document.body.appendChild(summaryPopup);
    summaryPopup.addEventListener('click', e => {
        summaryPopup.remove();
        clearTimeout(summaryTimeout);
    });
    const summaryTimeout = setTimeout(function () {
        summaryPopup.remove();
    }, 5000);

    errorCounter = 0;
    fixedCounter = 0;

}
load();