import {CustomError} from "../App";
import {StatusCodes} from "http-status-codes";
import axios from "axios";

export const getLocationDetails = async (IP: any)=>{
    try {
            const response = await axios.get(`https://ipapi.co/${IP}/json`)
        return response?.data
    }catch(error){
        console.log(error)
        throw new CustomError({
            message: 'Error fetching location details',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        })
    }
}