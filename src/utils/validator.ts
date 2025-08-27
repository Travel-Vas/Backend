import {CustomError} from "../helpers/lib/App";
import {StatusCodes} from "http-status-codes";

export const validateFields = (fields: Record<string, any>) => {
    for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            throw new CustomError({
                message: `${key} is required`,
                code: StatusCodes.BAD_REQUEST,
            });
        }
    }
};
