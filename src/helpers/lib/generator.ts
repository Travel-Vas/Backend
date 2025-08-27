function generateUniqueId() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}
// console.log(generateUniqueId())
export default generateUniqueId