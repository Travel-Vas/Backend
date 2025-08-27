import {SettingsInterface} from "./settings.interface";
import SettingsModel from "./settings.model";

export const createSettingsService = async (payload: Partial<SettingsInterface>) => {
    const new_payload: any = {
        ...payload,
    };
    const existingSettings = await SettingsModel.findOne({ userId: payload.userId });

    if (existingSettings) {
        // If settings exist, update them with the new payload
        await SettingsModel.findOneAndUpdate(
            { userId: payload.userId },
            {$set: new_payload},
            { new: true }
        );
        return { message: 'Settings updated successfully', updated: true };
    } else {
        const response = await SettingsModel.create(new_payload);
        return  response ;
    }
};
export const getSettingsDetailsService = async(userId: any)=>{
    const response = await SettingsModel.findOne({
        userId: userId,
    }).lean()
    return response
}