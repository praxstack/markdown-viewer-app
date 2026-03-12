## 2025-05-15 - HTML Injection via innerHTML during Markdown rendering error
**Vulnerability:** XSS via `innerHTML` assignment of user-controlled error messages.
**Learning:** Using `innerHTML` to display error messages that might contain fragments of user input (e.g., from a failed markdown parse) can lead to XSS.
**Prevention:** Always use `textContent` or DOM manipulation with safe properties when displaying dynamic data or error messages.
