import "server-only";

import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(input: {
  password: string;
  passwordHash: string | null | undefined;
}) {
  if (!input.passwordHash) {
    return false;
  }

  const [salt, storedHash] = input.passwordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = (await scrypt(input.password, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedKey);
}
