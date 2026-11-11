import { Request, Response } from "express";
import { prisma } from "../../../config/db.ts";
import { getMatchStatus } from "../../../utils/matchStatus.ts";
import { Status } from "../../../generated/prisma/enums.ts";

const createMatch = async (req: Request, res: Response) => {
  try {
    const {
      id,
      homeTeam,
      awayTeam,
      sport,
      startTime,
      endTime,
      homeScore,
      awayScore,
    } = req.body;
    const calculatedStatus = getMatchStatus(
      new Date(startTime),
      new Date(endTime),
    );
    const finalHomeScore =
      calculatedStatus === Status.SCHEDULED ? 0 : (homeScore ?? 0);
    const finalAwayScore =
      calculatedStatus === Status.SCHEDULED ? 0 : (awayScore ?? 0);

    const newMatch = await prisma.match.create({
      data: {
        id,
        homeTeam,
        awayTeam,
        sport,
        homeScore: finalHomeScore,
        awayScore: finalAwayScore,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: getMatchStatus(new Date(startTime), new Date(endTime)),
      },
    });

    return res
      .status(201)
      .json({ message: "Match Created Successfully", data: newMatch });
  } catch (error) {
    return res
      .status(500)
      .json({ Error: "Internal Server Error", details: error });
  }
};

const getAllMatchs = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const skip = (page - 1) * limit;
    const matchs = await prisma.match.findMany({
      take: limit,
      skip: skip,
      orderBy: {
        startTime: "desc",
      },
    });
    return res.status(200).json({
      message: "Matchs Retrieved Successfully",
      reults: matchs.length,
      page: page,
      limit: limit,
      data: matchs,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ Error: "Internal Server Error", details: error });
  }
};

export { createMatch, getAllMatchs };
