const { marked } = require("marked");
const sanitizeHtml = require("sanitize-html");

function renderLessonContent(markdownText) {
    const md = markdownText || "";

    const rawHtml = marked.parse(md);

    const cleanHtml = sanitizeHtml(rawHtml, {
        allowedTage: [
            "p", "br",
            "h1", "h2","h3", "h4",
            "strong", "em", "blockquote",
            "ul", "ol", "li",
            "code", "pre",
            "a",
            "hr",
            "table", "thead", "tbody", "tr", "th", "td"
        ],
        allowedAttributes: {
            a: ["href", "name", "target", "rel"],
        },
        transformTags: {
            a: sanitizeHtml.simpleTransform("a", { rel: "moopener noreferrer", target: "_blank" }, true),
        },
        allowedSchemes: ["http", "https", "mailto"],
    });
    
    return cleanHtml;
}

module.exports = { renderLessonContent }