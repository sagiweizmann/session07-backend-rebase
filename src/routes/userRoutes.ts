import express from 'express';
import {
  createOrUpdateUser,
  getUserByEmail,
  deleteUserByEmail
} from '../controllers/userController';

const router = express.Router();

router.post('/', createOrUpdateUser);
router.get('/:email', getUserByEmail);
router.delete('/:email', deleteUserByEmail);

export default router;
