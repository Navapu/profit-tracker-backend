import mongoose from "mongoose";
import logger from "../config/logger.js";
export const validateObjectId = (fieldName, location = "params") => (req, res, next) => {
    try{
        const id = location === "params" ? req.params[fieldName] : req.body[fieldName];
        if(!id || !mongoose.Types.ObjectId.isValid(id)){
            res.status(400);
            return next(new Error(`Invalid ${fieldName}`))
        };
        next();
    }catch(error){
        logger.error(error, "validateObjectId error:");
        next(error);
    }
}