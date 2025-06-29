import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { Connection, RowDataPacket } from 'mysql2/promise';

export type UpsertResult = 'created' | 'reactivated' | 'already_active';

export const upsertUser = async (
  db: Connection,
  email: string,
  fullName: string
): Promise<UpsertResult> => {
  const id = uuidv4();
  const joinedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const timestamp = new Date().toISOString();

  const [result]: any = await db.execute(
    `
    INSERT INTO users (id, email, full_name, joined_at, deleted_since)
    VALUES (?, ?, ?, ?, NULL)
    ON DUPLICATE KEY UPDATE
      deleted_since = IF(deleted_since IS NOT NULL, NULL, deleted_since),
      full_name = VALUES(full_name)
    `,
    [id, email, fullName, joinedAt]
  );

  if (result.affectedRows === 1) {
    logger.log({
      level: 'info',
      message: 'User created',
      event: 'user_created',
      email,
      timestamp,
      id,
    });
    return 'created';
  } else if (result.affectedRows === 2) {
    logger.log({
      level: 'info',
      message: 'User reactivated',
      event: 'user_reactivated',
      email,
      timestamp,
      reason: 'was previously soft-deleted',
    });
    return 'reactivated';
  } else {
    logger.log({
      level: 'info',
      message: 'User already active',
      event: 'user_already_active',
      email,
      timestamp,
    });
    return 'already_active';
  }
};


export interface User {
  email: string;
  full_name: string;
  joined_at: string;
}

export const getUserByEmail = async (
  db: Connection,
  email: string
): Promise<User | null> => {
  const [rows] = await db.execute<RowDataPacket[]>(
    `
    SELECT email, full_name, joined_at
    FROM users
    WHERE email = ? AND deleted_since IS NULL
    `,
    [email]
  );

  const user = rows[0];

  if (user) {
    logger.log({
      level: 'info',
      message: 'User fetched successfully',
      event: 'user_retrieved',
      email,
      timestamp: new Date().toISOString(),
    });

    return {
      email: user.email,
      full_name: user.full_name,
      joined_at: new Date(user.joined_at).toISOString(),
    };
  }

  logger.log({
    level: 'warn',
    message: 'User not found or inactive',
    event: 'user_not_found',
    email,
    timestamp: new Date().toISOString(),
  });

  return null;
};

export const softDeleteUser = async (
  db: Connection,
  email: string
): Promise<'deleted' | 'not_found_or_inactive'> => {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' '); // MySQL datetime format

  const [result]: any = await db.execute(
    `
    UPDATE users
    SET deleted_since = ?
    WHERE email = ? AND deleted_since IS NULL
    `,
    [now, email]
  );

  const timestamp = new Date().toISOString();

  if (result.affectedRows === 1) {
    logger.log({
      level: 'info',
      message: 'User was soft-deleted',
      event: 'user_soft_deleted',
      email,
      timestamp
    });
    return 'deleted';
  }

  logger.log({
    level: 'info',
    message: 'User not found or already inactive',
    event: 'user_soft_delete_skipped',
    email,
    timestamp
  });
  return 'not_found_or_inactive';
};
