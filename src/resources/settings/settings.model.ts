import { Schema, model } from 'mongoose';
import {SETTINGS_TABLE} from "../../helpers/constants";
import {SettingsInterface} from "./settings.interface";

const settingsSchema = new Schema<SettingsInterface>({
    domain_name: {
        type: String,
    },
    watermark_name: {
        type: String,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    watermark_font_size:{
        type: Number,
    },
    watermark_font_style:{
        type: String,
    },
    watermark_color:{
        type: String,
    },
    opacity: {
        type: Number,
    },
    watermark_url: {
        type: String,
    }
},{
    timestamps: true
})

export default model(SETTINGS_TABLE, settingsSchema);