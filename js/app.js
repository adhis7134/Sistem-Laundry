/**
 * app.js - Controller dan Logika Interaktif Laundry Hub
 */

let activeSection = null;
let selectedChatCustomerId = 'CUST01';

// Format Rupiah Helper
function formatRupiah(number) {
  return 'Rp ' + Number(number || 0).toLocaleString('id-ID');
}

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  let icon = '🔔';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ========================================================
// 1. AUTHENTICATION & VIEW SWITCHING
// ========================================================

function switchAuthView(view) {
  const loginView = document.getElementById('view-login');
  const regView = document.getElementById('view-register');
  const forgotView = document.getElementById('view-forgot');
  const appView = document.getElementById('view-app');

  if (view === 'login') {
    loginView.style.display = 'flex';
    regView.style.display = 'none';
    if (forgotView) forgotView.style.display = 'none';
    appView.style.display = 'none';
  } else if (view === 'register') {
    loginView.style.display = 'none';
    regView.style.display = 'flex';
    if (forgotView) forgotView.style.display = 'none';
    appView.style.display = 'none';
  } else if (view === 'forgot') {
    loginView.style.display = 'none';
    regView.style.display = 'none';
    if (forgotView) forgotView.style.display = 'flex';
    appView.style.display = 'none';
  } else if (view === 'app') {
    loginView.style.display = 'none';
    regView.style.display = 'none';
    if (forgotView) forgotView.style.display = 'none';
    appView.style.display = 'flex';
  }
}

function handleForgotPassword(e) {
  e.preventDefault();
  const u = document.getElementById('forgot-username').value.trim();
  const phone = document.getElementById('forgot-phone').value.trim();
  const p1 = document.getElementById('forgot-new-password').value;
  const p2 = document.getElementById('forgot-confirm-password').value;

  if (p1 !== p2) {
    showToast('Konfirmasi password tidak cocok!', 'error');
    return;
  }
  if (p1.length < 4) {
    showToast('Password minimal 4 karakter!', 'warning');
    return;
  }

  const res = store.resetPassword(u, phone, p1);
  if (res.success) {
    showToast(res.message, 'success');
    document.getElementById('form-forgot').reset();
    switchAuthView('login');
    quickFillLogin(u, p1);
  } else {
    showToast(res.message, 'error');
  }
}

function quickFillLogin(username, password) {
  document.getElementById('login-username').value = username;
  document.getElementById('login-password').value = password;
}

function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;

  const result = store.authenticate(u, p);
  if (result.success) {
    showToast(`Selamat datang kembali, ${result.user.nm_admin || result.user.nm_kurir || result.user.nm_customer}!`, 'success');
    initAppView();
  } else {
    showToast(result.message, 'error');
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-fullname').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const address = document.getElementById('reg-address').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const pass = document.getElementById('reg-password').value;

  const result = store.registerCustomer(name, phone, address, username, pass);
  if (result.success) {
    showToast('Pendaftaran akun berhasil! Silakan login.', 'success');
    document.getElementById('form-register').reset();
    switchAuthView('login');
    quickFillLogin(username, pass);
  } else {
    showToast(result.message, 'error');
  }
}

function handleLogout() {
  if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
    store.logout();
    switchAuthView('login');
    showToast('Anda telah berhasil logout.', 'info');
  }
}

// ========================================================
// 2. DASHBOARD & NAVIGATION CONTROLLER
// ========================================================

function initAppView() {
  const current = store.getCurrentUser();
  if (!current) {
    switchAuthView('login');
    return;
  }

  switchAuthView('app');
  const role = current.role;
  const user = current.data;

  // Set Profile Footer info
  const name = user.nm_admin || user.nm_kurir || user.nm_customer || 'Pengguna';
  document.getElementById('user-display-name').textContent = name;
  document.getElementById('user-display-role').textContent = role.toUpperCase();
  document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('badge-role').textContent = role.toUpperCase();

  // Render Sidebar Nav Items dynamically
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';

  let menuItems = [];

  if (role === 'customer') {
    menuItems = [
      { id: 'sec-cust-dashboard', label: 'Dashboard (Pesan)', icon: '📝' },
      { id: 'sec-cust-riwayat', label: 'Riwayat Pesanan', icon: '📜' },
      { id: 'sec-shared-chat', label: 'Chat Admin', icon: '💬' },
      { id: 'sec-shared-profile', label: 'Edit Profil', icon: '👤' }
    ];
    document.querySelectorAll('.cust-welcome-name').forEach(el => el.textContent = name);
  } else if (role === 'kurir') {
    menuItems = [
      { id: 'sec-kurir-dashboard', label: 'Tugas Tersedia', icon: '🛵' },
      { id: 'sec-kurir-riwayat', label: 'Riwayat Tugas', icon: '📜' },
      { id: 'sec-shared-profile', label: 'Edit Profil', icon: '👤' }
    ];
    document.getElementById('kurir-welcome-name').textContent = name;
    document.getElementById('kurir-welcome-name-2').textContent = name;
  } else if (role === 'admin') {
    menuItems = [
      { id: 'sec-admin-dashboard', label: 'Dashboard Pesanan', icon: '📊' },
      { id: 'sec-admin-kurir', label: 'Kelola Kurir', icon: '🛵' },
      { id: 'sec-admin-layanan', label: 'Kelola Layanan', icon: '🧺' },
      { id: 'sec-admin-laporan', label: 'Laporan Pendapatan', icon: '📈' },
      { id: 'sec-shared-chat', label: 'Live Chat', icon: '💬' },
      { id: 'sec-shared-profile', label: 'Edit Profil', icon: '👤' }
    ];
    document.getElementById('admin-welcome-name').textContent = name;
    document.querySelectorAll('.admin-name-span').forEach(el => el.textContent = name);
  }

  menuItems.forEach((m, idx) => {
    const a = document.createElement('a');
    a.className = 'nav-item' + (idx === 0 ? ' active' : '');
    a.href = 'javascript:void(0)';
    a.innerHTML = `<span>${m.icon}</span><span>${m.label}</span>`;
    a.onclick = () => switchSection(m.id, a);
    nav.appendChild(a);
  });

  // Show default section
  switchSection(menuItems[0].id);

  // Initial renders
  populateLayananDropdown();
  renderCustOrderForm();
  renderCustOrders();
  renderKurirTasks();
  renderKurirHistory();
  renderAdminOrders();
  renderAdminKurirs();
  renderAdminLayanan();
  renderAdminLaporan();
  initChatView();
  initProfileForm();
}

function switchSection(sectionId, clickedNavItem = null) {
  document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = 'block';
    activeSection = sectionId;
  }

  if (clickedNavItem) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    clickedNavItem.classList.add('active');
  }

  // Refresh relevant section data
  if (sectionId === 'sec-cust-riwayat') renderCustOrders();
  if (sectionId === 'sec-kurir-dashboard') renderKurirTasks();
  if (sectionId === 'sec-kurir-riwayat') renderKurirHistory();
  if (sectionId === 'sec-admin-dashboard') renderAdminOrders();
  if (sectionId === 'sec-admin-laporan') renderAdminLaporan();
  if (sectionId === 'sec-shared-chat') renderChatMessages();
}

// ========================================================
// 3. CUSTOMER FEATURES
// ========================================================

function populateLayananDropdown() {
  const select = document.getElementById('cust-order-layanan');
  if (!select) return;
  select.innerHTML = '';
  const layanans = store.getLayanan();
  layanans.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id_layanan;
    opt.textContent = `${l.nm_layanan} (${formatRupiah(l.harga)}/kg)`;
    select.appendChild(opt);
  });
}

function renderCustOrderForm() {
  const current = store.getCurrentUser();
  if (!current || current.role !== 'customer') return;
  const user = current.data;

  document.getElementById('cust-order-name').value = user.nm_customer || '';
  document.getElementById('cust-order-phone').value = user.no_hp || '';
  document.getElementById('cust-order-address').value = user.alamat || '';
}

function handleCustomerCreateOrder(e) {
  e.preventDefault();
  const current = store.getCurrentUser();
  if (!current || current.role !== 'customer') return;

  const id_layanan = document.getElementById('cust-order-layanan').value;
  const mtd_bayar = document.getElementById('cust-order-payment').value;
  const alamat = document.getElementById('cust-order-address').value.trim();

  const newOrder = store.createOrder({
    id_customer: current.data.id_customer,
    id_layanan,
    alamat_snapshot: alamat,
    mtd_bayar
  });

  showToast(`Pesanan ${newOrder.id_pesanan} berhasil dibuat! Kurir akan segera menjemput pakaian Anda.`, 'success');

  // Pindah ke Riwayat Pesanan
  const riwayatNav = Array.from(document.querySelectorAll('.nav-item')).find(n => n.textContent.includes('Riwayat'));
  switchSection('sec-cust-riwayat', riwayatNav);
}

function renderCustOrders() {
  const current = store.getCurrentUser();
  if (!current || current.role !== 'customer') return;

  const tbody = document.getElementById('table-cust-orders');
  if (!tbody) return;
  tbody.innerHTML = '';

  const myOrders = store.getOrders().filter(o => o.id_customer === current.data.id_customer);
  const layanans = store.getLayanan();

  if (myOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 30px;">Belum ada pesanan aktif. Silakan buat pesanan baru.</td></tr>`;
    return;
  }

  myOrders.forEach(o => {
    const lay = layanans.find(l => l.id_layanan === o.id_layanan);
    const serviceName = lay ? lay.nm_layanan : 'Layanan';
    
    let badgeClass = 'badge-menunggu';
    if (o.status === 'Diproses') badgeClass = 'badge-diproses';
    else if (o.status === 'Siap Diantar') badgeClass = 'badge-siap';
    else if (o.status === 'Selesai') badgeClass = 'badge-selesai';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.tgl_pesan}</td>
      <td><strong>${serviceName}</strong></td>
      <td>${o.berat_kg > 0 ? o.berat_kg.toFixed(2) + ' kg' : '<span class="text-muted">Menunggu timbang</span>'}</td>
      <td>${o.total_harga > 0 ? formatRupiah(o.total_harga) : '<span class="text-muted">-</span>'}</td>
      <td><span class="badge ${badgeClass}">${o.status}</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="openReceiptModal('${o.id_pesanan}')">Lihat Struk</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ========================================================
// 4. KURIR FEATURES
// ========================================================

function renderKurirTasks() {
  const tbody = document.getElementById('table-kurir-tasks');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Tugas yang belum selesai: Menunggu Kurir (Jemput) atau Siap Diantar (Antar)
  const activeTasks = store.getOrders().filter(o => o.status === 'Menunggu Kurir' || o.status === 'Siap Diantar');
  const layanans = store.getLayanan();

  if (activeTasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 30px;">Tidak ada antrian tugas saat ini. Semua cucian telah selesai!</td></tr>`;
    return;
  }

  activeTasks.forEach(o => {
    const lay = layanans.find(l => l.id_layanan === o.id_layanan);
    const serviceName = lay ? lay.nm_layanan : '-';

    let actionBtn = '';
    if (o.status === 'Menunggu Kurir') {
      actionBtn = `<button class="btn btn-sm btn-primary" onclick="openKurirModal('${o.id_pesanan}', 'jemput')">🛵 Timbang & Input Berat</button>`;
    } else if (o.status === 'Siap Diantar') {
      actionBtn = `<button class="btn btn-sm btn-success" onclick="openKurirModal('${o.id_pesanan}', 'antar')">💵 Antar & Terima Bayar</button>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.tgl_pesan}</td>
      <td><strong>${o.nm_snapshot}</strong></td>
      <td><div>${o.no_hp_snapshot}</div><small class="text-muted">${o.alamat_snapshot}</small></td>
      <td>${serviceName}</td>
      <td><span class="badge ${o.status === 'Menunggu Kurir' ? 'badge-menunggu' : 'badge-siap'}">${o.status}</span></td>
      <td>${actionBtn}</td>
    `;
    tbody.appendChild(tr);
  });
}

function openKurirModal(orderId, mode = 'jemput') {
  const order = store.getOrderById(orderId);
  if (!order) return;

  const modal = document.getElementById('kurirModal');
  document.getElementById('km-order-id').value = order.id_pesanan;
  document.getElementById('km-order-display').value = `${order.id_pesanan} (${order.status})`;
  document.getElementById('km-customer-name').value = `${order.nm_snapshot} - ${order.alamat_snapshot}`;
  document.getElementById('km-weight').value = order.berat_kg > 0 ? order.berat_kg : '';
  document.getElementById('km-payment').value = order.mtd_bayar || 'Tunai';

  const titleEl = document.getElementById('kurir-modal-title');
  if (mode === 'jemput') {
    titleEl.textContent = '🛵 Penjemputan: Timbang Pakaian & Input Berat';
  } else {
    titleEl.textContent = '📦 Pengantaran: Konfirmasi Pembayaran & Selesai';
  }

  calcKurirTotalPreview();
  modal.classList.add('active');
}

function closeKurirModal() {
  document.getElementById('kurirModal').classList.remove('active');
}

function calcKurirTotalPreview() {
  const orderId = document.getElementById('km-order-id').value;
  const weight = parseFloat(document.getElementById('km-weight').value) || 0;
  const order = store.getOrderById(orderId);
  if (!order) return;

  const layanan = store.getLayanan().find(l => l.id_layanan === order.id_layanan);
  const priceKg = layanan ? layanan.harga : 7000;
  const total = Math.round(weight * priceKg);

  document.getElementById('km-preview-total').textContent = formatRupiah(total);
}

function handleKurirModalSubmit(e) {
  e.preventDefault();
  const orderId = document.getElementById('km-order-id').value;
  const weight = parseFloat(document.getElementById('km-weight').value) || 0;
  const payment = document.getElementById('km-payment').value;

  const order = store.getOrderById(orderId);
  if (!order) return;

  if (order.status === 'Menunggu Kurir') {
    store.kurirInputWeightAndPayment(orderId, weight, payment);
    showToast(`Berat pesanan ${orderId} disimpan (${weight} kg). Status kini: DIPROSES`, 'success');
  } else if (order.status === 'Siap Diantar') {
    store.completeOrderPayment(orderId, payment);
    showToast(`Pesanan ${orderId} telah selesai diantar dan dibayar via ${payment}!`, 'success');
  }

  closeKurirModal();
  renderKurirTasks();
  renderKurirHistory();
}

function renderKurirHistory(filterDate = null) {
  const tbody = document.getElementById('table-kurir-history');
  if (!tbody) return;
  tbody.innerHTML = '';

  let doneOrders = store.getOrders().filter(o => o.status === 'Selesai');
  if (filterDate) {
    doneOrders = doneOrders.filter(o => o.tgl_pesan.startsWith(filterDate));
  }

  const layanans = store.getLayanan();

  if (doneOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 25px;">Tidak ada riwayat pengantaran yang sesuai filter.</td></tr>`;
    return;
  }

  doneOrders.forEach(o => {
    const lay = layanans.find(l => l.id_layanan === o.id_layanan);
    const serviceName = lay ? lay.nm_layanan : '-';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.tgl_pesan}</td>
      <td><strong>${o.nm_snapshot}</strong></td>
      <td>${serviceName}</td>
      <td>${o.berat_kg.toFixed(2)} kg</td>
      <td><span class="badge badge-selesai">SELESAI</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function filterKurirHistory() {
  const dateVal = document.getElementById('filter-kurir-date').value;
  if (!dateVal) {
    showToast('Pilih tanggal terlebih dahulu untuk filter!', 'warning');
    return;
  }
  renderKurirHistory(dateVal);
}

function resetKurirHistoryFilter() {
  document.getElementById('filter-kurir-date').value = '';
  renderKurirHistory();
}

// ========================================================
// 5. ADMIN FEATURES
// ========================================================

function renderAdminOrders() {
  const tbody = document.getElementById('table-admin-orders');
  if (!tbody) return;
  tbody.innerHTML = '';

  const orders = store.getOrders();
  const layanans = store.getLayanan();
  const kurirs = store.getKurirs();

  orders.forEach(o => {
    const lay = layanans.find(l => l.id_layanan === o.id_layanan);
    const kur = kurirs.find(k => k.id_kurir === o.id_kurir);

    let badgeClass = 'badge-menunggu';
    if (o.status === 'Diproses') badgeClass = 'badge-diproses';
    else if (o.status === 'Siap Diantar') badgeClass = 'badge-siap';
    else if (o.status === 'Selesai') badgeClass = 'badge-selesai';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.tgl_pesan}</td>
      <td><strong>${o.nm_snapshot}</strong><br><small class="text-muted">${o.no_hp_snapshot}</small></td>
      <td>${lay ? lay.nm_layanan : '-'}</td>
      <td>${kur ? kur.nm_kurir : 'Belum ditugaskan'}</td>
      <td><strong>${formatRupiah(o.total_harga)}</strong></td>
      <td><span class="badge ${badgeClass}">${o.status}</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-sm btn-secondary" onclick="openAdminStatusModal('${o.id_pesanan}')">Ubah Status</button>
          <button class="btn btn-sm btn-primary" onclick="openReceiptModal('${o.id_pesanan}')">Struk</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAdminStatusModal(orderId) {
  const order = store.getOrderById(orderId);
  if (!order) return;

  document.getElementById('asm-order-id').value = order.id_pesanan;
  document.getElementById('asm-order-display').value = `${order.id_pesanan} (${order.nm_snapshot})`;
  document.getElementById('asm-new-status').value = order.status;
  document.getElementById('adminStatusModal').classList.add('active');
}

function closeAdminStatusModal() {
  document.getElementById('adminStatusModal').classList.remove('active');
}

function handleAdminStatusSubmit(e) {
  e.preventDefault();
  const orderId = document.getElementById('asm-order-id').value;
  const newStatus = document.getElementById('asm-new-status').value;

  const current = store.getCurrentUser();
  const adminId = current ? current.data.id_admin : 'ADM01';

  store.updateOrderStatus(orderId, newStatus, adminId);
  showToast(`Status pesanan ${orderId} berhasil diubah menjadi: ${newStatus}`, 'success');
  closeAdminStatusModal();
  renderAdminOrders();
  renderAdminLaporan();
}

// Kelola Kurir
function renderAdminKurirs() {
  const tbody = document.getElementById('table-admin-kurirs');
  if (!tbody) return;
  tbody.innerHTML = '';

  const kurirs = store.getKurirs();
  kurirs.forEach(k => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${k.nm_kurir}</strong></td>
      <td>${k.username}</td>
      <td>${k.no_hp}</td>
      <td><span style="font-family: monospace; background: #334155; padding: 2px 6px; border-radius: 4px;">${k.plat_no}</span></td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="handleDeleteKurir('${k.id_kurir}', '${k.nm_kurir}')">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function handleAddKurir(e) {
  e.preventDefault();
  const name = document.getElementById('new-kurir-name').value.trim();
  const phone = document.getElementById('new-kurir-phone').value.trim();
  const plat = document.getElementById('new-kurir-plat').value.trim();
  const username = document.getElementById('new-kurir-username').value.trim();
  const pass = document.getElementById('new-kurir-password').value;

  const res = store.addKurir(name, phone, plat, username, pass);
  if (res.success) {
    showToast(`Kurir ${name} berhasil ditambahkan!`, 'success');
    document.getElementById('form-add-kurir').reset();
    renderAdminKurirs();
  } else {
    showToast(res.message, 'error');
  }
}

function handleDeleteKurir(id, name) {
  if (confirm(`Yakin ingin menghapus kurir "${name}"?`)) {
    store.deleteKurir(id);
    showToast(`Kurir ${name} berhasil dihapus.`, 'info');
    renderAdminKurirs();
  }
}

// Kelola Layanan
function renderAdminLayanan() {
  const tbody = document.getElementById('table-admin-layanan');
  if (!tbody) return;
  tbody.innerHTML = '';

  const layanans = store.getLayanan();
  layanans.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${l.nm_layanan}</strong></td>
      <td>${formatRupiah(l.harga)}/kg</td>
      <td>${l.estimasi || '-'}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-sm btn-secondary" onclick="editLayanan('${l.id_layanan}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="handleDeleteLayanan('${l.id_layanan}', '${l.nm_layanan}')">Hapus</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editLayanan(id) {
  const lay = store.getLayanan().find(l => l.id_layanan === id);
  if (!lay) return;

  document.getElementById('edit-layanan-id').value = lay.id_layanan;
  document.getElementById('layanan-name').value = lay.nm_layanan;
  document.getElementById('layanan-price').value = lay.harga;
  document.getElementById('layanan-estimasi').value = lay.estimasi || '2 Hari';

  document.getElementById('title-form-layanan').textContent = 'Edit Jenis Layanan';
  document.getElementById('btn-save-layanan').textContent = 'Update Layanan';
}

function resetLayananForm() {
  document.getElementById('form-manage-layanan').reset();
  document.getElementById('edit-layanan-id').value = '';
  document.getElementById('title-form-layanan').textContent = 'Kelola Jenis Layanan';
  document.getElementById('btn-save-layanan').textContent = 'Simpan Layanan';
}

function handleSaveLayanan(e) {
  e.preventDefault();
  const id = document.getElementById('edit-layanan-id').value;
  const name = document.getElementById('layanan-name').value.trim();
  const price = document.getElementById('layanan-price').value;
  const estimasi = document.getElementById('layanan-estimasi').value.trim();

  if (id) {
    store.updateLayanan(id, name, price, estimasi);
    showToast(`Layanan ${name} berhasil diperbarui!`, 'success');
  } else {
    store.addLayanan(name, price, estimasi);
    showToast(`Layanan ${name} berhasil ditambahkan!`, 'success');
  }

  resetLayananForm();
  renderAdminLayanan();
  populateLayananDropdown();
}

function handleDeleteLayanan(id, name) {
  if (confirm(`Yakin ingin menghapus layanan "${name}"?`)) {
    store.deleteLayanan(id);
    showToast(`Layanan ${name} berhasil dihapus.`, 'info');
    renderAdminLayanan();
    populateLayananDropdown();
  }
}

// Laporan Pendapatan & Chart
let filteredLaporanOrders = [];

function renderAdminLaporan(fromDate = null, toDate = null) {
  const tbody = document.getElementById('table-admin-laporan');
  if (!tbody) return;
  tbody.innerHTML = '';

  let finished = store.getOrders().filter(o => o.status === 'Selesai');
  if (fromDate) {
    finished = finished.filter(o => o.tgl_pesan.substring(0, 10) >= fromDate);
  }
  if (toDate) {
    finished = finished.filter(o => o.tgl_pesan.substring(0, 10) <= toDate);
  }

  filteredLaporanOrders = finished;
  const layanans = store.getLayanan();

  let grandTotal = 0;

  if (finished.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 30px;">Tidak ada transaksi selesai pada periode ini.</td></tr>`;
  } else {
    finished.forEach(o => {
      grandTotal += o.total_harga;
      const lay = layanans.find(l => l.id_layanan === o.id_layanan);
      const serviceName = lay ? lay.nm_layanan : '-';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.tgl_pesan}</td>
        <td><strong>${o.nm_snapshot}</strong></td>
        <td>${serviceName}</td>
        <td>${o.berat_kg.toFixed(2)} kg</td>
        <td><strong>${formatRupiah(o.total_harga)}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('stat-total-pendapatan').textContent = `Total: ${formatRupiah(grandTotal)}`;
  drawRevenueChart(finished);
}

function filterLaporan() {
  const from = document.getElementById('laporan-from-date').value;
  const to = document.getElementById('laporan-to-date').value;
  renderAdminLaporan(from || null, to || null);
  showToast('Laporan berhasil difilter.', 'info');
}

function resetFilterLaporan() {
  document.getElementById('laporan-from-date').value = '';
  document.getElementById('laporan-to-date').value = '';
  renderAdminLaporan();
}

function drawRevenueChart(orders) {
  const canvas = document.getElementById('chartPendapatan');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Group revenue by date
  const grouped = {};
  orders.forEach(o => {
    const d = o.tgl_pesan.substring(0, 10);
    grouped[d] = (grouped[d] || 0) + o.total_harga;
  });

  const dates = Object.keys(grouped).sort();
  const values = dates.map(d => grouped[d]);

  // Canvas dimensions
  canvas.width = canvas.parentElement.clientWidth - 40;
  canvas.height = 140;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (dates.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tidak ada data pendapatan untuk digambarkan dalam grafik.', canvas.width / 2, 70);
    return;
  }

  const maxVal = Math.max(...values, 10000);
  const paddingX = 40;
  const paddingY = 25;
  const chartW = canvas.width - paddingX * 2;
  const chartH = canvas.height - paddingY * 2;

  // Draw grid lines
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = paddingY + (chartH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(paddingX, y);
    ctx.lineTo(paddingX + chartW, y);
    ctx.stroke();
  }

  // Draw Line
  const points = dates.map((d, i) => {
    const x = dates.length === 1 ? paddingX + chartW / 2 : paddingX + (i / (dates.length - 1)) * chartW;
    const y = paddingY + chartH - (values[i] / maxVal) * chartH;
    return { x, y, val: values[i], date: d };
  });

  // Area under line
  if (points.length > 1) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.beginPath();
    ctx.moveTo(points[0].x, paddingY + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, paddingY + chartH);
    ctx.closePath();
    ctx.fill();
  }

  // Stroke line
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();

  // Dots & Labels
  points.forEach(p => {
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Text date
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.date.substring(5), p.x, canvas.height - 6);
  });
}

function exportLaporanToExcel() {
  if (!filteredLaporanOrders || filteredLaporanOrders.length === 0) {
    showToast('Tidak ada data laporan untuk diexport!', 'warning');
    return;
  }

  const layanans = store.getLayanan();
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'ID Pesanan,Tanggal,Customer,No HP,Alamat,Layanan,Berat (Kg),Metode Bayar,Total Pendapatan\n';

  filteredLaporanOrders.forEach(o => {
    const lay = layanans.find(l => l.id_layanan === o.id_layanan);
    const serviceName = lay ? lay.nm_layanan : '-';
    csvContent += `"${o.id_pesanan}","${o.tgl_pesan}","${o.nm_snapshot}","${o.no_hp_snapshot}","${o.alamat_snapshot}","${serviceName}",${o.berat_kg},"${o.mtd_bayar}",${o.total_harga}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Laporan_Transaksi_Laundry_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('File Laporan berhasil diexport ke format CSV/Excel!', 'success');
}

// ========================================================
// 6. LIVE CHAT SYSTEM
// ========================================================

function initChatView() {
  const current = store.getCurrentUser();
  if (!current) return;

  const sidebar = document.getElementById('admin-chat-sidebar');
  if (current.role === 'admin') {
    sidebar.style.display = 'flex';
    renderChatCustomerList();
  } else {
    sidebar.style.display = 'none';
    selectedChatCustomerId = current.data.id_customer;
    document.getElementById('chat-with-name').textContent = 'Admin Laundry';
  }
}

function renderChatCustomerList() {
  const list = document.getElementById('chat-customer-list');
  if (!list) return;
  list.innerHTML = '';

  const customers = store.data.customers;
  customers.forEach(c => {
    const item = document.createElement('div');
    item.className = 'chat-user-item' + (c.id_customer === selectedChatCustomerId ? ' active' : '');
    item.onclick = () => {
      selectedChatCustomerId = c.id_customer;
      document.getElementById('chat-with-name').textContent = c.nm_customer;
      renderChatCustomerList();
      renderChatMessages();
    };
    item.innerHTML = `
      <div class="user-avatar" style="width: 34px; height: 34px; font-size: 13px;">${c.nm_customer.charAt(0)}</div>
      <div>
        <div style="font-size: 13px; font-weight: 700;">${c.nm_customer}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${c.no_hp}</div>
      </div>
    `;
    list.appendChild(item);
  });
}

function renderChatMessages() {
  const box = document.getElementById('chat-messages-box');
  if (!box) return;
  box.innerHTML = '';

  const current = store.getCurrentUser();
  if (!current) return;

  const targetCustId = current.role === 'customer' ? current.data.id_customer : selectedChatCustomerId;
  const messages = store.getChatsForCustomer(targetCustId);

  if (messages.length === 0) {
    box.innerHTML = `<div style="text-align: center; color: var(--text-dim); margin-top: 40px; font-size: 13px;">Belum ada pesan. Mulai obrolan sekarang!</div>`;
    return;
  }

  messages.forEach(m => {
    const isSent = (current.role === 'customer' && m.pengirim === 'customer') ||
                   (current.role === 'admin' && m.pengirim === 'admin');

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isSent ? 'sent' : 'received'}`;
    bubble.innerHTML = `
      <div>${m.isi_pesan}</div>
      <div class="chat-time">${m.waktu}</div>
    `;
    box.appendChild(bubble);
  });

  box.scrollTop = box.scrollHeight;
}

function handleSendChatMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input-text');
  const text = input.value.trim();
  if (!text) return;

  const current = store.getCurrentUser();
  if (!current) return;

  const targetCustId = current.role === 'customer' ? current.data.id_customer : selectedChatCustomerId;
  const senderRole = current.role === 'customer' ? 'customer' : 'admin';

  store.sendChat({
    id_customer: targetCustId,
    id_admin: 'ADM01',
    isi_pesan: text,
    pengirim: senderRole
  });

  input.value = '';
  renderChatMessages();
}

// ========================================================
// 7. STRUK DIGITAL RESI (MODAL)
// ========================================================

function openReceiptModal(orderId) {
  const order = store.getOrderById(orderId);
  if (!order) return;

  const lay = store.getLayanan().find(l => l.id_layanan === order.id_layanan);
  const kur = store.getKurirs().find(k => k.id_kurir === order.id_kurir);
  const adm = store.data.admins.find(a => a.id_admin === order.id_admin);

  document.getElementById('rec-id').textContent = '#' + order.id_pesanan;
  document.getElementById('rec-date').textContent = order.tgl_pesan;
  document.getElementById('rec-service-name').textContent = lay ? lay.nm_layanan : 'Layanan Laundry';
  document.getElementById('rec-weight').textContent = (order.berat_kg || 0).toFixed(2) + ' kg';
  document.getElementById('rec-price-kg').textContent = formatRupiah(lay ? lay.harga : 7000);
  document.getElementById('rec-total').textContent = formatRupiah(order.total_harga);
  document.getElementById('rec-payment-method').textContent = `${order.mtd_bayar || 'Tunai'} (${order.status === 'Selesai' ? 'LUNAS' : 'Belum Bayar'})`;
  document.getElementById('rec-cust-name').textContent = order.nm_snapshot;
  document.getElementById('rec-kurir-name').textContent = kur ? kur.nm_kurir : '-';
  document.getElementById('rec-admin-name').textContent = adm ? adm.nm_admin : 'Admin Laundry';

  if (order.biaya_antar && order.biaya_antar > 0) {
    document.getElementById('row-rec-biaya-antar').style.display = 'flex';
    document.getElementById('rec-biaya-antar').textContent = formatRupiah(order.biaya_antar);
  } else {
    document.getElementById('row-rec-biaya-antar').style.display = 'none';
  }

  document.getElementById('strukModal').classList.add('active');
}

function closeReceiptModal() {
  document.getElementById('strukModal').classList.remove('active');
}

// ========================================================
// 8. PROFILE EDITING
// ========================================================

function initProfileForm() {
  const current = store.getCurrentUser();
  if (!current) return;
  const user = current.data;
  const role = current.role;

  document.getElementById('profile-name').value = user.nm_admin || user.nm_kurir || user.nm_customer || '';
  document.getElementById('profile-phone').value = user.no_hp || '';

  const addrGroup = document.getElementById('profile-group-address');
  const platGroup = document.getElementById('profile-group-plat');

  if (role === 'customer') {
    addrGroup.style.display = 'block';
    platGroup.style.display = 'none';
    document.getElementById('profile-address').value = user.alamat || '';
  } else if (role === 'kurir') {
    addrGroup.style.display = 'none';
    platGroup.style.display = 'block';
    document.getElementById('profile-plat').value = user.plat_no || '';
  } else {
    addrGroup.style.display = 'none';
    platGroup.style.display = 'none';
  }
}

function handleUpdateProfile(e) {
  e.preventDefault();
  const current = store.getCurrentUser();
  if (!current) return;
  const role = current.role;
  const user = current.data;

  const name = document.getElementById('profile-name').value.trim();
  const phone = document.getElementById('profile-phone').value.trim();
  const pass = document.getElementById('profile-password').value;

  const updateObj = {};
  if (role === 'customer') {
    updateObj.nm_customer = name;
    updateObj.no_hp = phone;
    updateObj.alamat = document.getElementById('profile-address').value.trim();
    if (pass) updateObj.password = pass;
    store.updateProfile('customer', user.id_customer, updateObj);
  } else if (role === 'kurir') {
    updateObj.nm_kurir = name;
    updateObj.no_hp = phone;
    updateObj.plat_no = document.getElementById('profile-plat').value.trim();
    if (pass) updateObj.password = pass;
    store.updateProfile('kurir', user.id_kurir, updateObj);
  } else if (role === 'admin') {
    updateObj.nm_admin = name;
    updateObj.no_hp = phone;
    if (pass) updateObj.password = pass;
    store.updateProfile('admin', user.id_admin, updateObj);
  }

  showToast('Profil Anda berhasil diperbarui!', 'success');
  initAppView();
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  const current = store.getCurrentUser();
  if (current) {
    initAppView();
  } else {
    switchAuthView('login');
  }
});
