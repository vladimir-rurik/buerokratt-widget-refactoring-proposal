// core/validation/index.ts

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate Estonian phone number
 */
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\s/g, '');
  const regex = /^(\+372|00372)?[5-8]\d{6,7}$/;
  return regex.test(cleanPhone);
}

/**
 * Validate Estonian ID code (isikukood)
 */
export function validateIdCode(idCode: string): boolean {
  if (!/^\d{11}$/.test(idCode)) return false;

  const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
  const weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(idCode[i]) * weights1[i];
  }

  let checksum = sum % 11;
  if (checksum === 10) {
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(idCode[i]) * weights2[i];
    }
    checksum = sum % 11;
    if (checksum === 10) checksum = 0;
  }

  return checksum === parseInt(idCode[10]);
}
