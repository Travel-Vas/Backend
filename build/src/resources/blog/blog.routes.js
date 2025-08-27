"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = __importDefault(require("./blog.controller"));
const router = (0, express_1.Router)();
const blogController = new blog_controller_1.default();
router.get('/', blogController.getBlogs);
router.post('/', blogController.createBlog);
exports.default = router;
