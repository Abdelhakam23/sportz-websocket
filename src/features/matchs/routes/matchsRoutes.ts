import Router from 'express';
import { createMatch, getAllMatchs } from '../controllers/matchsController';
import { validateRequest } from '../../../middleware/validateRequest';
import { createMatchSchema } from '../validation/createMatchSchema';

const matchsRouters = Router();

matchsRouters.get('/', getAllMatchs);

matchsRouters.post('/',validateRequest(createMatchSchema),createMatch)



export default matchsRouters