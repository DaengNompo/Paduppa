const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for all unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// In-memory storage (replace with database in production)
let orders = [];
let reservations = [];
let menu = {
  food: [
    { name: 'Seafood Fried Rice', price: 85000, image: 'https://images.unsplash.com/photo-1594212699903-ec701fed9f9e' },
    { name: 'Sop Konro', price: 95000, image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804' }
  ],
  beverage: [
    { name: 'Young Coconut Ice', price: 35000, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
    { name: 'Cappuccino', price: 45000, image: 'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5' }
  ]
};

// Checkout Endpoint
app.post('/api/checkout', (req, res) => {
  const order = {
    ...req.body,
    timestamp: new Date().toLocaleString()
  };
  orders.push(order);

  // Format WhatsApp message
  const itemsList = order.items.map(item => `${item.name} x${item.quantity} (IDR ${item.price.toLocaleString()})`).join('\n');
  const message = encodeURIComponent(
    `New Order from ${order.customerName}\n` +
    `Room: ${order.room || '-'}\n` +
    `Table: ${order.table || '-'}\n` +
    `Items:\n${itemsList}\n` +
    `Subtotal: IDR ${order.subtotal.toLocaleString()}`
  );
  const whatsappUrl = `https://wa.me/+6281342522610?text=${message}`;

  res.json({ success: true, whatsappUrl });
});

// Reservation Endpoint
app.post('/api/reservation', (req, res) => {
  const reservation = {
    ...req.body,
    timestamp: new Date().toLocaleString()
  };
  reservations.push(reservation);

  // Format WhatsApp message
  const message = encodeURIComponent(
    `New Reservation\n` +
    `Name: ${reservation.name}\n` +
    `Date: ${reservation.date}\n` +
    `Time: ${reservation.time}\n` +
    `Guests: ${reservation.guests}\n` +
    `Room/Table: ${reservation.roomTable ||.Concurrent History Edit Detected: Another process has modified the conversation history, which may affect the context of this response. Please review the updated history to ensure this response aligns with your expectations.'-'}\n` +
    `Phone: ${reservation.phone || '-'}\n` +
    `Email: ${reservation.email || '-'}\n` +
    `Special Requests: ${reservation.requests || '-'}`
  );
  const whatsappUrl = `https://wa.me/+6281342522610?text=${message}`;

  res.json({ success: true, whatsappUrl });
});

// Get Orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Get Reservations
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// Menu Endpoints
app.get('/api/menu', (req, res) => {
  res.json(menu);
});

app.post('/api/menu/:category', (req, res) => {
  const { category } = req.params;
  menu[category].push(req.body);
  res.json({ success: true });
});

app.put('/api/menu/:category/:index', (req, res) => {
  const { category, index } = req.params;
  menu[category][index] = req.body;
  res.json({ success: true });
});

app.delete('/api/menu/:category/:index', (req, res) => {
  const { category, index } = req.params;
  menu[category].splice(index, 1);
  res.json({ success: true });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});