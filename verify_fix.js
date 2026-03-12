const error = {
    message: 'Something went wrong <img src=x onerror=alert(1)>'
};

function escapeHTML(str) {
    const div = {
        textContent: '',
        get innerHTML() {
            return this.textContent
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    };
    div.textContent = 'Error rendering markdown: ' + str;
    return div.innerHTML;
}

console.log('Testing security fix logic...');
const escaped = escapeHTML(error.message);

console.log('Escaped output:', escaped);

if (escaped.includes('<img')) {
    console.error('FAILED: HTML was not escaped!');
    process.exit(1);
} else {
    console.log('PASSED: HTML was escaped.');
}
