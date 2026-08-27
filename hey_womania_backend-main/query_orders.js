const mongoose = require('mongoose');
const { Order } = require('./models/Order');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const orders = await Order.find().sort({ createdAt: -1 }).limit(3);
  orders.forEach(o => console.log(`Order ${o.id}: Status: ${o.shippingStatus}, Error: ${o.shippingError}`));
  process.exit(0);
}
run();
