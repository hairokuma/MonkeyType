// ==UserScript==
// @name MokeyType
// @namespace Script Runner Pro
// @match *://*/*
// @grant none
// ==/UserScript==
// TODO: fix bug with charIndex if first char in paragraph is wrong for multiple times
// TODO: fix initialisation of paragraphes with nested elements
// TODO: add ctrl+backspace to delete word
// fix inline elements cursor position bug (e.g. <br>, <img>)
var wrongSpace = "·";
var paragraph;
var nextChar;
var nextCharText;
var charIndex = 0;
var charCount = 0;
var simularQuotes = ['"', "'", '«', '»', '‘', '’', '‚', '“', '”', '„', '`', ',']
var simularBrackets = ['(', ')', '[', ']', '{', '}', '<', '>', '«', '»']
var toggleOnOff = true;
var errorCounter = 0;
var chars;
document.addEventListener("click", function (e) {
    if (toggleOnOff) {
        document.designMode = "on";
        initParagraph();
    }
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
// on keydown
document.addEventListener('keydown', e => {
    // F2 toggle on/off
    if (e.keyCode == 113) {
        toggleOnOff = !toggleOnOff;
        document.designMode = toggleOnOff ? "off" : "on";
    }
    if (!toggleOnOff || !paragraph) {
        return;
    }
    updateIndex();

    if (charIndex < charCount) {
        nextChar = chars[charIndex];
        nextCharText = nextChar.innerText.replace(/\s/g, " ");
        console.log('Char: |' + nextCharText + '| charIndex: ' + charIndex + ' charCount: ' + charCount);
        console.log('key:  |' + e.key + '| keyCode: ' + e.keyCode);
    }
    if (e.key == nextCharText || (simularQuotes.includes(e.key) && simularQuotes.includes(nextCharText)) || (simularBrackets.includes(e.key) && simularBrackets.includes(nextCharText))) {
        nextChar.style.opacity = "1";
        window.getSelection().modify("move", "forward", "character");
    }
    // if key is letter or number or spacial char os space
    else if (e.key.length == 1) {
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
    console.log('preventDefault');
    // window.getSelection().focusNode.parentElement.scrollIntoView({ block: "center", inline: "center" });
    // console.log(window.getSelection().focusNode.parentElement);
    // chars[charIndex+1].scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

    e.preventDefault();
});

document.addEventListener('keyup', e => {
    if (!toggleOnOff || !paragraph) {
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

function initParagraph() {
    var element = window.getSelection().focusNode.parentElement;
    if (element.tagName == "BODY" || element.tagName == "HTML") {
        return;
    }
    if (element.closest('.initialized')) {
        paragraph = element.closest('.initialized');
        return
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