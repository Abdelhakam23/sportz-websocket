import Router from 'express';
import { createMatch, getAllMatchs } from '../controllers/matchesController';
import { validateRequest } from '../../../middleware/validateRequest';
import { createMatchSchema } from '../validation/createMatchSchema';

const matchesRouters = Router();

matchesRouters.get('/', getAllMatchs);

matchesRouters.post('/',validateRequest(createMatchSchema),createMatch)



export default matchesRouters