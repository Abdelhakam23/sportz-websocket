import {z} from "zod";

export const createCommentarySchema = z.object({ 
    minute: z.number().int().nonnegative({message:"Minute must be a non-negative integer"}).max(120,{message:"Minute cannot exceed 120"}),
    period: z.enum(["1st Half", "2nd Half", "Extra Time", "Penalty Shootout"], {message:"Period must be one of the following: 1st Half, 2nd Half, Extra Time, Penalty Shootout"}),
    eventType: z.enum(["Goal", "Yellow Card", "Red Card", "Substitution", "Injury", "Offside", "Foul", "Penalty", "Own Goal"], {message:"Event type must be one of the following: Goal, Yellow Card, Red Card, Substitution, Injury, Offside, Foul, Penalty, Own Goal"}),
    actor: z.string().min(1,{message:"Actor is required"}).max(100,{message:"Actor cannot exceed 100 characters"}),
    team: z.string().min(1,{message:"Team is required"}).max(100,{message:"Team cannot exceed 100 characters"}),
    message: z.string().min(1,{message:"Message is required"}).max(500,{message:"Message cannot exceed 500 characters"}),
   metaData: z.record(z.string(), z.any()).optional(),
    tags: z.array(z.string().min(1,{message:"Tag cannot be empty"}).max(50,{message:"Tag cannot exceed 50 characters"})).optional(),
});