(() => {

const beautifyOptions = {
      "indent_size": "1",
      "indent_char": "\t",
      "max_preserve_newlines": "2",
      "preserve_newlines": true,
      "keep_array_indentation": false,
      "break_chained_methods": false,
      "indent_scripts": "normal",
      "brace_style": "collapse",
      "space_before_conditional": true,
      "unescape_strings": false,
      "jslint_happy": false,
      "end_with_newline": false,
      "wrap_line_length": "0",
      "indent_inner_html": false,
      "comma_first": false,
      "e4x": true,
      "es4": true,
      "indent_empty_lines": true
}

const highlight = window.parent.hljs.highlight.bind(window);
const js_beautify = (code) => window.parent.js_beautify.bind(window)(code, beautifyOptions);
const html_beautify = (code) => window.parent.html_beautify.bind(window)(code, beautifyOptions);

const docAsStr = window.parent.document.querySelector("#test").getAttribute("srcdoc");

function encodeHl(value) {
    if(value instanceof Error) { 
        const [ lineNumber, columnNumber ] = value.stack.slice(value.stack.lastIndexOf("about:srcdoc:") + 13).split(":").map(Number);
        window.parent.document.querySelector(".editor-container[data-lang='js'] code").children[lineNumber - (docAsStr.substr(0, docAsStr.lastIndexOf("<script")).split("\n").length + 2)].classList.add("error");
        return `${value.name}: ${value.message}\n\tat ide.js:${lineNumber - (docAsStr.substr(0, docAsStr.lastIndexOf("<script")).split("\n").length + 1)}:${columnNumber}`; 
    }
    if(value instanceof Element) return highlight(html_beautify(value.outerHTML), { language: "html" }).value;
    return highlight(js_beautify(encode(value)), { language: "js" }).value;
}

function encode(value) {
    if(Array.isArray(value)) return js_beautify("[" + value.map(v => encode(v)).join(", ") + "]");
    if(value instanceof Element) return html_beautify(value.outerHTML);
    return typeof value === "string" ? JSON.stringify(value) : (typeof value === "object" ? objToString(value) : (typeof value === "undefined" ? "undefined" : value.toString()));
}

function objToString(obj) {
    if(obj === null) return "null";
    if(Array.isArray(obj)) return js_beautify("[" + obj.map(v => encode(v)).join(", ") + "]")
    if(obj instanceof Error) return obj.toString();
    if(obj instanceof Element) return html_beautify(obj.outerHTML);
    const entries = Object.getOwnPropertyNames(obj).map(v => [v, obj[v]]);
    return js_beautify("{" + entries.map(([key, value]) => key + ': ' + encode(value)).join(", ") + "}");
}

function log(logType, ...data) {
    window.parent.console[logType](...data);
    window.parent.document.querySelector("ul#consoleMessages").insertAdjacentHTML("beforeend", `<li class="${logType}">${data.map(v => encodeHl(v)).join('\n\n')}</li>`);
}

window.console = {
    log: function(...data) {
        log("log", ...data);
    },
    error: function(...data) {
        log("error", ...data);
    },
    info: function(...data) {
        log("info", ...data);
    },
    warn: function(...data) {
        log("warn", ...data);
    }
}

})();