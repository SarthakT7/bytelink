import base from "base-x";
import { createHmac } from "node:crypto";

export class ShortUrlUtil {
    static generateShortUrl(originalUrl: string): string {
        const secret: string = process.env.BYTELINK_HASH_SECRET!;

        const hash: string = createHmac('sha256', secret).update(originalUrl).digest('hex');

        const encodedString: string = this.getBase62String(hash).slice(0, 7);

        return encodedString;

    }

    static getBase62String(str: string): string {

        const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        const base62 = base(BASE62_ALPHABET);

        return base62.encode(Buffer.from(str));
    }
}