import crypto from 'crypto';

export const generateToken = (): string => {
  const uri = `${process.env.API_MEDIC_AUTH_URL}/login`;
  const secret_key = process.env.API_MEDIC_SECRET_KEY;

  const hmac = crypto.createHmac('md5', secret_key ?? '');
  hmac.update(uri);
  const computedHash = hmac.digest('base64');
  const computedHashString = computedHash.toString();

  return `${process.env.API_MEDIC_API_KEY}:${computedHashString}`;
};
