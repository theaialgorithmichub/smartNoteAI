import connectDB from '../mongodb';
import { AuditLog } from '../models/security';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress: string;
  userAgent: string;
  status?: 'success' | 'failure';
}

export class AuditLogger {
  // Log an action
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await connectDB();
      
      await AuditLog.create({
        ...entry,
        status: entry.status || 'success',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - logging should not break the application
    }
  }

  // Log successful action
  static async logSuccess(entry: Omit<AuditLogEntry, 'status'>): Promise<void> {
    await this.log({ ...entry, status: 'success' });
  }

  // Log failed action
  static async logFailure(entry: Omit<AuditLogEntry, 'status'>): Promise<void> {
    await this.log({ ...entry, status: 'failure' });
  }

  // Get user audit logs
  static async getUserLogs(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<any[]> {
    try {
      await connectDB();

      const query: any = { userId };

      if (options.action) {
        query.action = options.action;
      }

      if (options.startDate || options.endDate) {
        query.timestamp = {};
        if (options.startDate) {
          query.timestamp.$gte = options.startDate;
        }
        if (options.endDate) {
          query.timestamp.$lte = options.endDate;
        }
      }

      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .limit(options.limit || 100)
        .skip(options.offset || 0);

      return logs;
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  // Get security events
  static async getSecurityEvents(
    userId: string,
    days: number = 30
  ): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const securityActions = [
      'login',
      'logout',
      'password_change',
      '2fa_enable',
      '2fa_disable',
      'api_key_create',
      'api_key_delete',
      'failed_login',
    ];

    try {
      await connectDB();

      const events = await AuditLog.find({
        userId,
        action: { $in: securityActions },
        timestamp: { $gte: startDate },
      }).sort({ timestamp: -1 });

      return events;
    } catch (error) {
      console.error('Failed to retrieve security events:', error);
      return [];
    }
  }

  // Export audit logs (for compliance)
  static async exportLogs(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      await connectDB();

      const logs = await AuditLog.find({
        userId,
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ timestamp: 1 });

      return logs.map(log => ({
        timestamp: log.timestamp,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        status: log.status,
        ipAddress: log.ipAddress,
        details: log.details,
      }));
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      return [];
    }
  }
}

// Common audit actions
export const AuditActions = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  FAILED_LOGIN: 'failed_login',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  
  // 2FA
  TWO_FACTOR_ENABLE: '2fa_enable',
  TWO_FACTOR_DISABLE: '2fa_disable',
  TWO_FACTOR_VERIFY: '2fa_verify',
  
  // Notebooks
  NOTEBOOK_CREATE: 'notebook_create',
  NOTEBOOK_READ: 'notebook_read',
  NOTEBOOK_UPDATE: 'notebook_update',
  NOTEBOOK_DELETE: 'notebook_delete',
  
  // Sharing
  SHARE_CREATE: 'share_create',
  SHARE_ACCESS: 'share_access',
  SHARE_REVOKE: 'share_revoke',
  
  // API
  API_KEY_CREATE: 'api_key_create',
  API_KEY_DELETE: 'api_key_delete',
  API_REQUEST: 'api_request',
  
  // Admin
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  ROLE_CHANGE: 'role_change',
};
