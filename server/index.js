import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ADMIN_LOGIN = 'sifatmarket';
const ADMIN_PASSWORD = 'IsmoiljonXudoshukur09';

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

const clients = new Set();

function broadcast(type, payload) {
  const msg = JSON.stringify({ type, payload });
  clients.forEach(c => { if (c.readyState === 1) c.send(msg); });
}

wss.on('connection', ws => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// Auth
app.post('/api/auth/admin', (req, res) => {
  const { login, password } = req.body;
  if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: 'admin-token', role: 'admin' });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/register', (req, res) => {
  const { name, surname, phone, password } = req.body;
  const data = readData();
  if (data.users.find(u => u.phone === phone)) {
    return res.status(400).json({ error: 'Phone already registered' });
  }
  const user = { id: uuidv4(), name, surname, phone, password, createdAt: new Date().toISOString() };
  data.users.push(user);
  writeData(data);
  res.json({ success: true, user: { id: user.id, name, surname, phone }, token: user.id });
});

app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;
  const data = readData();
  const user = data.users.find(u => u.phone === phone && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ success: true, user: { id: user.id, name: user.name, surname: user.surname, phone: user.phone }, token: user.id });
});

// Banners
app.get('/api/banners', (_, res) => {
  res.json(readData().banners);
});

app.post('/api/banners', upload.single('image'), (req, res) => {
  const data = readData();
  if (data.banners.length >= 6) return res.status(400).json({ error: 'Max 6 banners' });
  const banner = { id: uuidv4(), image: `/uploads/${req.file.filename}` };
  data.banners.push(banner);
  writeData(data);
  broadcast('banners', data.banners);
  res.json(banner);
});

app.put('/api/banners/:id', upload.single('image'), (req, res) => {
  const data = readData();
  const idx = data.banners.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (req.file) {
    const old = data.banners[idx].image;
    if (old.startsWith('/uploads/')) {
      const fp = path.join(__dirname, old);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    data.banners[idx].image = `/uploads/${req.file.filename}`;
  }
  writeData(data);
  broadcast('banners', data.banners);
  res.json(data.banners[idx]);
});

app.delete('/api/banners/:id', (req, res) => {
  const data = readData();
  const idx = data.banners.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const old = data.banners[idx].image;
  if (old.startsWith('/uploads/')) {
    const fp = path.join(__dirname, old);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  data.banners.splice(idx, 1);
  writeData(data);
  broadcast('banners', data.banners);
  res.json({ success: true });
});

// Products
app.get('/api/products', (req, res) => {
  const { q, sort } = req.query;
  let products = readData().products;
  if (q) {
    const query = q.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }
  if (sort === 'sales') products.sort((a, b) => (b.sales || 0) - (a.sales || 0));
  if (sort === 'discount') products = products.filter(p => p.discount > 0);
  res.json(products);
});

app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, price, description, discount } = req.body;
  const data = readData();
  const product = {
    id: uuidv4(),
    name,
    price: Number(price),
    description: description || '',
    discount: Number(discount) || 0,
    image: req.file ? `/uploads/${req.file.filename}` : '',
    sales: 0,
    createdAt: new Date().toISOString()
  };
  data.products.push(product);
  writeData(data);
  broadcast('products', data.products);
  res.json(product);
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const data = readData();
  const idx = data.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { name, price, description, discount } = req.body;
  if (name) data.products[idx].name = name;
  if (price) data.products[idx].price = Number(price);
  if (description !== undefined) data.products[idx].description = description;
  if (discount !== undefined) data.products[idx].discount = Number(discount);
  if (req.file) {
    const old = data.products[idx].image;
    if (old && old.startsWith('/uploads/')) {
      const fp = path.join(__dirname, old);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    data.products[idx].image = `/uploads/${req.file.filename}`;
  }
  writeData(data);
  broadcast('products', data.products);
  res.json(data.products[idx]);
});

app.delete('/api/products/:id', (req, res) => {
  const data = readData();
  data.products = data.products.filter(p => p.id !== req.params.id);
  writeData(data);
  broadcast('products', data.products);
  res.json({ success: true });
});

// Orders
app.get('/api/orders', (req, res) => {
  const { userId } = req.query;
  let orders = readData().orders;
  if (userId) orders = orders.filter(o => o.userId === userId);
  res.json(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post('/api/orders', (req, res) => {
  const { userId, userName, phone, items, total, location, address } = req.body;
  const data = readData();
  const order = {
    id: uuidv4(),
    userId,
    userName,
    phone,
    items,
    total,
    location,
    address: address || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  data.orders.push(order);
  items.forEach(item => {
    const p = data.products.find(pr => pr.id === item.id);
    if (p) p.sales = (p.sales || 0) + item.quantity;
  });
  writeData(data);
  broadcast('orders', data.orders);
  res.json(order);
});

app.patch('/api/orders/:id', (req, res) => {
  const data = readData();
  const idx = data.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  Object.assign(data.orders[idx], req.body);
  writeData(data);
  broadcast('orders', data.orders);
  res.json(data.orders[idx]);
});

app.post('/api/orders/:id/cancel', (req, res) => {
  const data = readData();
  const idx = data.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.orders[idx].status = 'cancelled';
  writeData(data);
  broadcast('orders', data.orders);
  res.json(data.orders[idx]);
});

app.post('/api/orders/:id/deliver', (req, res) => {
  const data = readData();
  const idx = data.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.orders[idx].status = 'delivered';
  data.orders[idx].deliveredAt = new Date().toISOString();
  writeData(data);
  broadcast('orders', data.orders);
  res.json(data.orders[idx]);
});

// Messages
app.get('/api/messages', (_, res) => {
  const data = readData();
  const conversations = {};
  data.messages.forEach(m => {
    if (!conversations[m.userId]) {
      conversations[m.userId] = {
        userId: m.userId,
        userName: m.userName,
        messages: [],
        unread: 0
      };
    }
    conversations[m.userId].messages.push(m);
    if (m.from === 'user' && !m.read) conversations[m.userId].unread++;
  });
  res.json(Object.values(conversations));
});

app.get('/api/messages/:userId', (req, res) => {
  const data = readData();
  const msgs = data.messages.filter(m => m.userId === req.params.userId);
  data.messages.forEach(m => { if (m.userId === req.params.userId) m.read = true; });
  writeData(data);
  res.json(msgs);
});

app.post('/api/messages', (req, res) => {
  const { userId, userName, text, from } = req.body;
  const data = readData();
  const msg = {
    id: uuidv4(),
    userId,
    userName,
    text,
    from: from || 'user',
    read: from === 'admin',
    createdAt: new Date().toISOString()
  };
  data.messages.push(msg);
  writeData(data);
  broadcast('messages', data.messages);
  res.json(msg);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
