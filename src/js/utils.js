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
