import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export const logAudit = async ({
  actorUserId = null,
  actorRole = 'system',
  action,
  targetEntity,
  targetId = null,
  ipAddress = null,
  userAgent = null,
  details = {}
}) => {
  try {
    await AuditLog.create({
      actorUserId,
      actorRole,
      action,
      targetEntity,
      targetId,
      ipAddress,
      userAgent,
      details
    });
  } catch (error) {
    logger.error(`Failed to write audit log: ${error.message}`);
  }
};
