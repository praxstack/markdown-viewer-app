## 2025-05-15 - HTML Injection via innerHTML during Markdown rendering error
**Vulnerability:** XSS via `innerHTML` assignment of user-controlled error messages.
**Learning:** Using `innerHTML` to display error messages that might contain fragments of user input (e.g., from a failed markdown parse) can lead to XSS.
**Prevention:** Always use `textContent` or DOM manipulation with safe properties when displaying dynamic data or error messages.

## 2024-03-05 - DOM XSS in PDFService Generation
**Vulnerability:** The `PDFService.js` directly assigned unvalidated HTML string to `contentWrapper.innerHTML` during PDF generation or preview when a string was passed as the content element.
**Learning:** Even internal services converting markdown/HTML string representations to export formats (like PDF) need input sanitization to prevent XSS payloads executing during rendering.
**Prevention:** Always sanitize user-derived or dynamic HTML strings using `DOMPurify.sanitize(content)` before injecting them into the DOM for export rendering operations.
