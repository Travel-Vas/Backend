"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_middleware_1 = require("../../middlewares/authenticate.middleware");
const router = (0, express_1.Router)();
router.get('/access/:shootId', authenticate_middleware_1.authenticate, (req, res) => {
    // TODO: Implement client access logic
    res.json({ message: 'Client access endpoint' });
});
router.post('/grant-access/:shootId', authenticate_middleware_1.authenticate, (req, res) => {
    // TODO: Implement grant access logic  
    res.json({ message: 'Access granted' });
});
exports.default = router;
