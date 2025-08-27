"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}
// console.log(generateUniqueId())
exports.default = generateUniqueId;
