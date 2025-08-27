import express from 'express';
import {authenticate} from "../../middlewares";
import {upload} from "../users/user.router";
import {createSettings, getSettingsDetails} from "./settings.controller";
const router = express.Router();
const shootUploads = upload.fields([
    { name: 'water_mark', maxCount: 1 },
])
router.get('/', authenticate, getSettingsDetails)
export default {
    path: '/settings',
    router: router,
}