import { Request, Response } from 'express';
import { 
  upsertUser,
  getUserByEmail as fetchUserByEmail,
  softDeleteUser
} from '../services/userService';


export const createOrUpdateUser = async (req: Request, res: Response) => {
  const { email, full_name } = req.body;
  const db = req.app.locals.db;

  try {
    const result = await upsertUser(db, email, full_name);

    if (result === 'created') {
      return res.sendStatus(201);
    } else {
      return res.sendStatus(200);
    }
  } catch (err) {
    console.error('Upsert error:', err);
    return res.sendStatus(500);
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  const db = req.app.locals.db;
  const email = req.params.email;

  try {
    const user = await fetchUserByEmail(db, email);

    if (!user) {
      return res.sendStatus(404);
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('Fetch user error:', err);
    return res.sendStatus(500);
  }
};

export const deleteUserByEmail = async (req: Request, res: Response) => {
    const db = req.app.locals.db;
  const email = req.params.email;

  try {
    await softDeleteUser(db, email);
    return res.sendStatus(204); // Always return 204, even if not found
  } catch (err) {
    console.error('Soft delete error:', err);
    return res.sendStatus(500);
  }
};
