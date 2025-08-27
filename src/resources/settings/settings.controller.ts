import {Request, Response} from 'express';
import {SettingsInterface} from "./settings.interface";
import {StatusCodes} from "http-status-codes/build/cjs/status-codes";
import {createSettingsService, getSettingsDetailsService} from "./settings.service";

export const createSettings = async (req: Request, res: Response) => {
    const payload:SettingsInterface = {
        domain_name: req.body.domain_name,
        watermark_name: req.body.watermark_name,
        watermark_font_style: req.body.font_style,
        watermark_font_size: req.body.font_size,
        watermark_color: req.body.color,
        opacity: req.body.opacity,
        watermark_url: req.files,
        userId: req['user']._id,
    }
    const response = await createSettingsService(payload);
    res.json({
        msg: "settings created successfully",
        data: response,
        statusCode: StatusCodes.CREATED
    })
}

export const getSettingsDetails = async (req: Request, res:Response)=>{
    const userId = req['user']._id
    const response = await getSettingsDetailsService(userId)
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: StatusCodes.OK
    })
}