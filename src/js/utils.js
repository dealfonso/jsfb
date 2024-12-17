function btoa_utf8(value) {
    // https://stackoverflow.com/a/75155959
    return btoa(
        String.fromCharCode(
            ...new TextEncoder('utf-8')
                   .encode(value)
        )
    );
}

function atob_utf8(value) {
    const value_latin1 = atob(value);
    return new TextDecoder('utf-8').decode(
        Uint8Array.from(
            { length: value_latin1.length },
            (element, index) => value_latin1.charCodeAt(index)
        )
    )
}

function toHumanSize(size) {
    if (size === null || size === undefined) {
        return "";
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    size = parseFloat(size);
    if (isNaN(size)) {
        return "0 B";
    }
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

function covertCallback(callback, context = null) {
    if (callback === null) {
        return null;
    }
    if (typeof callback === 'string') {
        let stringCallback = callback;
        callback = (_) => {
            const file = _;
            eval(stringCallback);
        }
    }
    if (callback instanceof Function) {
        if (context !== null) {
            return callback.bind(context);
        } 
        return callback;
    }
    throw new Error('Invalid callback');
}

/**
 * Check if the given URL is valid
 * @param {string|URL} url - The URL to check
 * @returns {boolean} - True if the URL is valid, false otherwise
 */
function isValidURL(url) {
    if (url instanceof URL) {
        return true;
    }
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}