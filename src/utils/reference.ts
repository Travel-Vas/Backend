import crypto from "crypto";
 function generateTransactionReference(userId: any) {
    const timestamp = Date.now();
    const rawString = `${userId}-${timestamp}`;
    const hash = crypto.createHash('sha256').update(rawString).digest('hex').slice(0, 12);
    return `TX-${hash}`;
}

export default generateTransactionReference;