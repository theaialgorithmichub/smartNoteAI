import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import crypto from 'crypto';

export class TwoFactorService {
  // Generate 2FA secret
  static generateSecret(userEmail: string): {
    secret: string;
    qrCode: string;
    backupCodes: string[];
  } {
    const secret = speakeasy.generateSecret({
      name: `smartDigitalNotes (${userEmail})`,
      length: 32,
    });

    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || '',
      backupCodes,
    };
  }

  // Generate backup codes
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code.match(/.{1,4}/g)?.join('-') || code);
    }
    return codes;
  }

  // Generate QR code image
  static async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify TOTP token
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after
    });
  }

  // Verify backup code
  static verifyBackupCode(
    backupCodes: string[],
    code: string
  ): { valid: boolean; remainingCodes: string[] } {
    const index = backupCodes.indexOf(code.toUpperCase());
    
    if (index === -1) {
      return { valid: false, remainingCodes: backupCodes };
    }

    const remainingCodes = backupCodes.filter((_, i) => i !== index);
    return { valid: true, remainingCodes };
  }

  // Generate current TOTP token (for testing)
  static generateToken(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }
}
