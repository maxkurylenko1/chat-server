const crypto = require("crypto");
const ivLength = 16;
const algorithm = "aes-256-cbc";

const encrypt = (text, key) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, "hex"), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

const decrypt = (text, key) => {
  const [iv, encryptedText] = text
    .split(":")
    .map((part) => Buffer.from(part, "hex"));
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

module.exports = { encrypt, decrypt };
