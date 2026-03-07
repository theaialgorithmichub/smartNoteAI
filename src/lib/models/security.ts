import mongoose from 'mongoose';

// Two-Factor Authentication
export interface ITwoFactor extends mongoose.Document {
  userId: string;
  secret: string;
  backupCodes: string[];
  isEnabled: boolean;
  method: 'totp' | 'sms';
  phoneNumber?: string;
  createdAt: Date;
  lastUsed?: Date;
}

const TwoFactorSchema = new mongoose.Schema<ITwoFactor>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  secret: {
    type: String,
    required: true,
  },
  backupCodes: [{
    type: String,
  }],
  isEnabled: {
    type: Boolean,
    default: false,
  },
  method: {
    type: String,
    enum: ['totp', 'sms'],
    default: 'totp',
  },
  phoneNumber: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsed: Date,
});

export const TwoFactor = mongoose.models.TwoFactor || 
  mongoose.model<ITwoFactor>('TwoFactor', TwoFactorSchema);

// Audit Logs
export interface IAuditLog extends mongoose.Document {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  timestamp: Date;
}

const AuditLogSchema = new mongoose.Schema<IAuditLog>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  resource: {
    type: String,
    required: true,
  },
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

export const AuditLog = mongoose.models.AuditLog || 
  mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

// Encrypted Data Storage
export interface IEncryptedData extends mongoose.Document {
  userId: string;
  notebookId: string;
  encryptedContent: string;
  iv: string;
  authTag: string;
  algorithm: string;
  createdAt: Date;
  updatedAt: Date;
}

const EncryptedDataSchema = new mongoose.Schema<IEncryptedData>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  notebookId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  encryptedContent: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    required: true,
  },
  authTag: {
    type: String,
    required: true,
  },
  algorithm: {
    type: String,
    default: 'aes-256-gcm',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const EncryptedData = mongoose.models.EncryptedData || 
  mongoose.model<IEncryptedData>('EncryptedData', EncryptedDataSchema);

// Password History
export interface IPasswordHistory extends mongoose.Document {
  userId: string;
  passwordHash: string;
  createdAt: Date;
}

const PasswordHistorySchema = new mongoose.Schema<IPasswordHistory>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const PasswordHistory = mongoose.models.PasswordHistory || 
  mongoose.model<IPasswordHistory>('PasswordHistory', PasswordHistorySchema);
