/**
 * data.js - State Manager & Persistent Storage untuk Laundry Hub
 * Menyimpan data di localStorage browser agar perubahan realtime & persisten
 */

const STORAGE_KEY = 'LAUNDRY_HUB_DATA_V1';

const DEFAULT_DATA = {
  admins: [
    { id_admin: 'ADM01', nm_admin: 'Suci Admin', username: 'admin', password: 'admin123', no_hp: '081234567890' }
  ],
  kurirs: [
    { id_kurir: 'KUR01', nm_kurir: 'Muhammad Taufiq', username: 'taufiq', password: 'kurir123', no_hp: '08995578781', plat_no: 'B 1234 BCD' },
    { id_kurir: 'KUR02', nm_kurir: 'Ahmad Slamet', username: 'ahmad', password: 'kurir123', no_hp: '081298765432', plat_no: 'B 5678 EFG' }
  ],
  customers: [
    { id_customer: 'CUST01', nm_customer: 'Budi Santoso', username: 'budi', password: 'budi123', no_hp: '0895725677902', alamat: 'Bekasi, regensi 1 blok j5 no 46' },
    { id_customer: 'CUST02', nm_customer: 'Hermanto', username: 'hermanto', password: 'rahasia', no_hp: '081234567888', alamat: 'Grand Wisata Cluster Water Spring No. 12' },
    { id_customer: 'CUST03', nm_customer: 'Bpk. Anton', username: 'anton', password: 'anton123', no_hp: '081399887766', alamat: 'Jln. Mawar No. 10' }
  ],
  layanan: [
    { id_layanan: 'LAY01', nm_layanan: 'Cuci Kering', harga: 7000, estimasi: '2-3 Hari' },
    { id_layanan: 'LAY02', nm_layanan: 'Cuci Setrika', harga: 7000, estimasi: '2 Hari' },
    { id_layanan: 'LAY03', nm_layanan: 'Setrika Saja', harga: 5000, estimasi: '1-2 Hari' },
    { id_layanan: 'LAY04', nm_layanan: 'Express (1 Hari)', harga: 15000, estimasi: '1 Hari' }
  ],
  pesanan: [
    {
      id_pesanan: 'LD-29',
      id_admin: 'ADM01',
      id_kurir: 'KUR01',
      id_customer: 'CUST01',
      id_layanan: 'LAY04',
      tgl_pesan: '2026-05-23 07:12:58',
      berat_kg: 4.0,
      biaya_antar: 0,
      total_harga: 60000,
      status: 'Selesai',
      mtd_bayar: 'Tunai',
      nm_snapshot: 'Budi Santoso',
      alamat_snapshot: 'Bekasi, regensi 1 blok j5 no 46',
      no_hp_snapshot: '0895725677902'
    },
    {
      id_pesanan: 'LD00123',
      id_admin: 'ADM01',
      id_kurir: 'KUR01',
      id_customer: 'CUST03',
      id_layanan: 'LAY02',
      tgl_pesan: '2026-05-03 10:15:00',
      berat_kg: 5.0,
      biaya_antar: 10000,
      total_harga: 45000,
      status: 'Selesai',
      mtd_bayar: 'QRIS',
      nm_snapshot: 'Bpk. Anton',
      alamat_snapshot: 'Jln. Mawar No. 10',
      no_hp_snapshot: '081399887766'
    },
    {
      id_pesanan: 'LD00128',
      id_admin: 'ADM01',
      id_kurir: 'KUR01',
      id_customer: 'CUST01',
      id_layanan: 'LAY01',
      tgl_pesan: '2026-05-08 09:00:00',
      berat_kg: 3.0,
      biaya_antar: 0,
      total_harga: 21000,
      status: 'Diproses',
      mtd_bayar: 'Tunai',
      nm_snapshot: 'Budi Santoso',
      alamat_snapshot: 'Bekasi, regensi 1 blok j5 no 46',
      no_hp_snapshot: '0895725677902'
    },
    {
      id_pesanan: 'LD00130',
      id_admin: null,
      id_kurir: 'KUR01',
      id_customer: 'CUST02',
      id_layanan: 'LAY04',
      tgl_pesan: '2026-05-24 08:30:00',
      berat_kg: 0,
      biaya_antar: 0,
      total_harga: 0,
      status: 'Menunggu Kurir',
      mtd_bayar: 'QRIS',
      nm_snapshot: 'Hermanto',
      alamat_snapshot: 'Grand Wisata Cluster Water Spring No. 12',
      no_hp_snapshot: '081234567888'
    }
  ],
  chats: [
    {
      id_chat: 'CHT01',
      id_admin: 'ADM01',
      id_customer: 'CUST01',
      isi_pesan: 'Halo kak, apakah cucian saya sudah mulai diproses?',
      waktu: '2026-05-23 08:00',
      pengirim: 'customer'
    },
    {
      id_chat: 'CHT02',
      id_admin: 'ADM01',
      id_customer: 'CUST01',
      isi_pesan: 'Halo Kak Budi! Sedang proses pengeringan ya, nanti setelah selesai disetrika langsung diantar kurir.',
      waktu: '2026-05-23 08:05',
      pengirim: 'admin'
    }
  ],
  currentUser: null // { role: 'customer' | 'kurir' | 'admin', data: {...} }
};

class DataStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Gagal memuat data dari localStorage, menggunakan default.', e);
    }
    this.save(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  save(dataToSave = this.data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Gagal menyimpan ke localStorage:', e);
    }
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.save();
  }

  // === AUTHENTICATION ===
  authenticate(username, password) {
    // 1. Admin
    const admin = this.data.admins.find(a => a.username.toLowerCase() === username.toLowerCase() && a.password === password);
    if (admin) {
      this.data.currentUser = { role: 'admin', data: admin };
      this.save();
      return { success: true, role: 'admin', user: admin };
    }

    // 2. Kurir
    const kurir = this.data.kurirs.find(k => k.username.toLowerCase() === username.toLowerCase() && k.password === password);
    if (kurir) {
      this.data.currentUser = { role: 'kurir', data: kurir };
      this.save();
      return { success: true, role: 'kurir', user: kurir };
    }

    // 3. Customer
    const cust = this.data.customers.find(c => c.username.toLowerCase() === username.toLowerCase() && c.password === password);
    if (cust) {
      this.data.currentUser = { role: 'customer', data: cust };
      this.save();
      return { success: true, role: 'customer', user: cust };
    }

    return { success: false, message: 'Username atau Password tidak sesuai!' };
  }

  registerCustomer(fullname, phone, address, username, password) {
    const exists = this.data.customers.some(c => c.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return { success: false, message: 'Username sudah digunakan, silakan pilih username lain!' };
    }

    const nextId = 'CUST' + String(this.data.customers.length + 1).padStart(2, '0');
    const newCust = {
      id_customer: nextId,
      nm_customer: fullname,
      no_hp: phone,
      alamat: address,
      username: username,
      password: password
    };

    this.data.customers.push(newCust);
    this.save();
    return { success: true, user: newCust };
  }

  resetPassword(username, phone, newPassword) {
    const uLow = username.toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');

    // Cari di customer
    const cust = this.data.customers.find(c => {
      const cPhone = c.no_hp.replace(/\D/g, '');
      return c.username.toLowerCase() === uLow && (c.no_hp === phone || cPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cPhone));
    });

    if (cust) {
      cust.password = newPassword;
      this.save();
      return { success: true, message: `Password akun "${cust.username}" berhasil diperbarui! Silakan login.` };
    }

    // Cari di kurir
    const kurir = this.data.kurirs.find(k => {
      const kPhone = k.no_hp.replace(/\D/g, '');
      return k.username.toLowerCase() === uLow && (k.no_hp === phone || kPhone.endsWith(cleanPhone) || cleanPhone.endsWith(kPhone));
    });

    if (kurir) {
      kurir.password = newPassword;
      this.save();
      return { success: true, message: `Password akun kurir "${kurir.username}" berhasil diperbarui! Silakan login.` };
    }

    return { success: false, message: 'Username dan Nomor HP tidak cocok dengan data terdaftar!' };
  }

  logout() {
    this.data.currentUser = null;
    this.save();
  }

  getCurrentUser() {
    return this.data.currentUser;
  }

  // === PESANAN (ORDERS) ===
  getOrders() {
    return this.data.pesanan;
  }

  getOrderById(id) {
    return this.data.pesanan.find(p => p.id_pesanan === id);
  }

  createOrder({ id_customer, id_layanan, alamat_snapshot, mtd_bayar }) {
    const cust = this.data.customers.find(c => c.id_customer === id_customer);
    const id_pesanan = 'LD-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const tgl_pesan = now.toISOString().replace('T', ' ').substring(0, 19);

    const newOrder = {
      id_pesanan: id_pesanan,
      id_admin: 'ADM01',
      id_kurir: 'KUR01', // Otomatis ditugaskan ke kurir aktif
      id_customer: id_customer,
      id_layanan: id_layanan,
      tgl_pesan: tgl_pesan,
      berat_kg: 0,
      biaya_antar: 0,
      total_harga: 0,
      status: 'Menunggu Kurir',
      mtd_bayar: mtd_bayar || 'Tunai',
      nm_snapshot: cust ? cust.nm_customer : 'Pelanggan',
      alamat_snapshot: alamat_snapshot || (cust ? cust.alamat : ''),
      no_hp_snapshot: cust ? cust.no_hp : ''
    };

    this.data.pesanan.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(id_pesanan, status, id_admin = 'ADM01') {
    const order = this.getOrderById(id_pesanan);
    if (order) {
      order.status = status;
      if (id_admin) order.id_admin = id_admin;
      this.save();
      return true;
    }
    return false;
  }

  kurirInputWeightAndPayment(id_pesanan, berat_kg, mtd_bayar) {
    const order = this.getOrderById(id_pesanan);
    if (!order) return false;

    const layanan = this.data.layanan.find(l => l.id_layanan === order.id_layanan);
    const hargaPerKg = layanan ? layanan.harga : 7000;
    
    order.berat_kg = parseFloat(berat_kg) || 0;
    order.total_harga = Math.round(order.berat_kg * hargaPerKg);
    if (mtd_bayar) order.mtd_bayar = mtd_bayar;
    
    // Jika kurir menginput berat di penjemputan, status berubah jadi Diproses
    if (order.status === 'Menunggu Kurir') {
      order.status = 'Diproses';
    }

    this.save();
    return order;
  }

  completeOrderPayment(id_pesanan, mtd_bayar) {
    const order = this.getOrderById(id_pesanan);
    if (!order) return false;
    if (mtd_bayar) order.mtd_bayar = mtd_bayar;
    order.status = 'Selesai';
    this.save();
    return order;
  }

  // === DATA MASTER LAYANAN ===
  getLayanan() {
    return this.data.layanan;
  }

  addLayanan(nm_layanan, harga, estimasi = '2 Hari') {
    const nextId = 'LAY' + String(this.data.layanan.length + 1).padStart(2, '0');
    const newL = {
      id_layanan: nextId,
      nm_layanan,
      harga: parseInt(harga, 10),
      estimasi
    };
    this.data.layanan.push(newL);
    this.save();
    return newL;
  }

  updateLayanan(id_layanan, nm_layanan, harga, estimasi) {
    const item = this.data.layanan.find(l => l.id_layanan === id_layanan);
    if (item) {
      if (nm_layanan) item.nm_layanan = nm_layanan;
      if (harga) item.harga = parseInt(harga, 10);
      if (estimasi) item.estimasi = estimasi;
      this.save();
      return true;
    }
    return false;
  }

  deleteLayanan(id_layanan) {
    this.data.layanan = this.data.layanan.filter(l => l.id_layanan !== id_layanan);
    this.save();
  }

  // === DATA MASTER KURIR ===
  getKurirs() {
    return this.data.kurirs;
  }

  addKurir(nm_kurir, no_hp, plat_no, username, password) {
    const exists = this.data.kurirs.some(k => k.username.toLowerCase() === username.toLowerCase());
    if (exists) return { success: false, message: 'Username kurir sudah ada!' };

    const nextId = 'KUR' + String(this.data.kurirs.length + 1).padStart(2, '0');
    const newK = {
      id_kurir: nextId,
      nm_kurir,
      no_hp,
      plat_no,
      username,
      password: password || 'kurir123'
    };
    this.data.kurirs.push(newK);
    this.save();
    return { success: true, kurir: newK };
  }

  deleteKurir(id_kurir) {
    this.data.kurirs = this.data.kurirs.filter(k => k.id_kurir !== id_kurir);
    this.save();
  }

  // === CHAT SYSTEM ===
  getChatsForCustomer(id_customer) {
    return this.data.chats.filter(c => c.id_customer === id_customer);
  }

  sendChat({ id_customer, id_admin = 'ADM01', isi_pesan, pengirim }) {
    const now = new Date();
    const waktu = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nextId = 'CHT' + (this.data.chats.length + 1);

    const newChat = {
      id_chat: nextId,
      id_admin,
      id_customer,
      isi_pesan,
      waktu,
      pengirim
    };

    this.data.chats.push(newChat);
    this.save();
    return newChat;
  }

  // === PROFIL UPDATE ===
  updateProfile(role, id, updateData) {
    let list;
    let key;
    if (role === 'customer') { list = this.data.customers; key = 'id_customer'; }
    else if (role === 'kurir') { list = this.data.kurirs; key = 'id_kurir'; }
    else if (role === 'admin') { list = this.data.admins; key = 'id_admin'; }
    
    if (list) {
      const item = list.find(u => u[key] === id);
      if (item) {
        Object.assign(item, updateData);
        if (this.data.currentUser && this.data.currentUser.data[key] === id) {
          this.data.currentUser.data = { ...item };
        }
        this.save();
        return true;
      }
    }
    return false;
  }
}

// Global instance
const store = new DataStore();
