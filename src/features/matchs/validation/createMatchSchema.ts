import {z} from "zod";

const ISODateTime = z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
}, {
    message: "Invalid ISO 8601 date-time format",
});

const createMatchSchema = z.object({
    homeTeam:z.string().min(2,'Home Team name should be required'),
    awayTeam:z.string().min(2,'Away Team name should be required'),
    sport:z.string().min(2,'Sport name should be required'),
    startTime:ISODateTime,
    endTime:ISODateTime,
    homeScore:z.coerce.number().int('Home score must be an integer').optional(),
    awayScore:z.coerce.number().int('Away score must be an integer').optional()
})


export { createMatchSchema}