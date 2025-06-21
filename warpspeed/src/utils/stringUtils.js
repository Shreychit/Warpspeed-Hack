export const capitalizeSentence = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeWords = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
}; 