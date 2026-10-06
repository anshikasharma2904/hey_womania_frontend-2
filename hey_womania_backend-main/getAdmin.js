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
  const admins = await adminCollection.find({}).toArray();

  if (admins.length > 0) {
    console.log("Admins found:");
    admins.forEach(a => console.log(a.email));
  } else {
    console.log("No admins found, creating default admin");
    const passwordHash = await hashPassword('admin123');
    await adminCollection.insertOne({
      id: crypto.randomUUID(),
      email: 'admin@heywomania.com',
      passwordHash: passwordHash,
      name: 'Super Admin',
      role: 'superadmin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("Created admin@heywomania.com / admin123");
  }

  process.exit(0);
}

run();
