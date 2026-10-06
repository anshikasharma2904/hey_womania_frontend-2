const mongoose = require('mongoose');
const crypto = require('crypto');

const URI = "mongodb+srv://heywomaniyaa_db_user:SMtB9S5CUigQokVG@heywomaniyaa.0iqh78m.mongodb.net/hey_womania?retryWrites=true&w=majority";

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 210000, 64, "sha512", (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey.toString("hex"));
    });
  });

  return `pbkdf2_sha512$210000$${salt}$${hash}`;
}

async function run() {
  await mongoose.connect(URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const adminCollection = db.collection('admins');
  
  const passwordHash = await hashPassword('admin123');
  await adminCollection.updateOne(
    { email: 'admin@heywomania.com' },
    { $set: { passwordHash: passwordHash } }
  );

  console.log("Password for admin@heywomania.com updated to admin123");
  process.exit(0);
}

run();
