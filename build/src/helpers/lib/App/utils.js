"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandom = void 0;
const crypto_1 = require("crypto");
const generateRandom = () => {
    const randomBytesBuffer = (0, crypto_1.randomBytes)(9);
    // Encode the random bytes to base64
    return randomBytesBuffer.toString('base64')
        .replace(/\+/g, 'a')
        .replace(/\//g, 'A')
        .replace(/=/g, 'z');
};
exports.generateRandom = generateRandom;
