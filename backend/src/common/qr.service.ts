import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

export interface QrPayload {
  aid: string;      // activity id
  exp?: number;     // optional expiry unix timestamp
  nonce: string;
}

@Injectable()
export class QrService {
  private readonly secret = process.env.QR_HMAC_SECRET || 'dev_qr_secret_change_me';

  /** Genera payload + firma HMAC-SHA256 */
  generateSignedPayload(activityId: string, expiresInDays = 365): { payload: string; signature: string; full: string } {
    const nonce = crypto.randomBytes(8).toString('hex');
    const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;

    const data: QrPayload = { aid: activityId, exp, nonce };
    const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('base64url');

    const full = `${payload}.${signature}`;
    return { payload, signature, full };
  }

  /** Valida un QR escaneado. Devuelve activityId si es válido. */
  validate(fullQr: string): { valid: boolean; activityId?: string; reason?: string } {
    const parts = fullQr.split('.');
    if (parts.length !== 2) {
      return { valid: false, reason: 'FORMAT' };
    }

    const [payload, signature] = parts;
    const expected = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('base64url');

    if (signature !== expected) {
      return { valid: false, reason: 'SIGNATURE' };
    }

    try {
      const data: QrPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false, reason: 'EXPIRED' };
      }
      return { valid: true, activityId: data.aid };
    } catch {
      return { valid: false, reason: 'PAYLOAD' };
    }
  }

  /** Genera imagen PNG del QR como Data URL o Buffer */
  async generateQrImage(fullPayload: string, size = 300): Promise<Buffer> {
    return QRCode.toBuffer(fullPayload, {
      type: 'png',
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
  }
}
