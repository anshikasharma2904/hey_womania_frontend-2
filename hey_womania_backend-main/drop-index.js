const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    const result = await mongoose.connection.collection('users').dropIndex('email_1');
    console.log('Successfully dropped email_1 index:', result);
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index email_1 not found, it might have been already dropped.');
    } else {
      console.error('Error dropping index:', err);
    }
  } finally {
    await mongoose.disconnect();
  }
}
run();
