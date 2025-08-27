import { randomBytes } from 'crypto';

export const generateRandom = () => {
  const randomBytesBuffer = randomBytes(9);
// Encode the random bytes to base64
  return randomBytesBuffer.toString('base64')
    .replace(/\+/g, 'a')
    .replace(/\//g, 'A')
    .replace(/=/g, 'z');

}
