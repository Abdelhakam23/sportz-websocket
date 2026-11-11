import {Status } from '../generated/prisma/enums'

export const getMatchStatus = (startTime:Date,endTime:Date , now = new Date()):Status=>{

    if(now.getTime()< startTime.getTime()){
        return Status.SCHEDULED
    }
    if(now.getTime() > endTime.getTime()){
        return Status.COMPLETED
    }
    return Status.LIVE
}