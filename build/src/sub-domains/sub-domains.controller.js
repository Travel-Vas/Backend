"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubDomain = void 0;
const createSubDomain = (req, res) => {
    const payload = {
        photographerId: req.body.photographerId,
        subDomain: req.body.subDomain,
    };
};
exports.createSubDomain = createSubDomain;
