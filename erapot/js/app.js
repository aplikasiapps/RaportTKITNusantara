const API_URL = "https://script.google.com/macros/s/AKfycbzZrKnj_9XlItZ3sisBik0r6ykhlr9BhSbJi0W0vGFHnZZql1xyeSHnYK6cH9qW-DEt/exec";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('button');
    const oldText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memvalidasi...';
    btn.disabled = true;
    
    const payload = {
        action: 'login',
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();

        if (result.status === 'success') {
            localStorage.setItem('user_session', JSON.stringify(result.user));
            renderInterface();
        } else {
            alert("Gagal Login: " + result.message);
        }
    } catch (err) {
        alert('Gagal terhubung: ' + err.message);
    } finally {
        btn.innerHTML = oldText;
        btn.disabled = false;
    }
});

function renderInterface() {
    const session = localStorage.getItem('user_session');
    if (!session) return;
    
    const user = JSON.parse(session);
    document.getElementById('login-section').classList.add('d-none');
    document.getElementById('app-section').classList.remove('d-none');
    document.getElementById('welcome-msg').innerText = `Selamat Datang, ${user.nama} (${user.role})`;
    
    // INI BAGIAN YANG DITAMBAHKAN UNTUK GURU
    if (user.role === 'Admin') {
        loadAdminStats();
    } else if (user.role === 'Guru') {
        loadGuruDashboard();
    } else {
        document.getElementById('dashboard-stats').innerHTML = `
            <div class="col-12"><div class="alert alert-info">Dashboard fitur ${user.role} siap dikembangkan.</div></div>`;
    }
}

// FUNGSI DASHBOARD YANG SUDAH DIPERBAIKI (MENGGUNAKAN POST)
async function loadAdminStats() {
    try {
        const payload = { action: 'getDashboardAdmin' };
        const response = await fetch(API_URL, {
            method: 'POST', // Diubah menjadi POST agar tidak diblokir
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            const stats = result.data;
            document.getElementById('dashboard-stats').innerHTML = `
                <div class="col-md-4 mb-3">
                    <div class="card stat-card p-3 bg-white">
                        <div class="text-muted small text-uppercase fw-bold">Jumlah Murid</div>
                        <h2 class="fw-bold text-emerald m-0">${stats.total_murid} Anak</h2>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card stat-card p-3 bg-white" style="border-left-color: #f59e0b;">
                        <div class="text-muted small text-uppercase fw-bold">Total Guru</div>
                        <h2 class="fw-bold text-warning m-0">${stats.total_guru} Orang</h2>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card stat-card p-3 bg-white" style="border-left-color: #3b82f6;">
                        <div class="text-muted small text-uppercase fw-bold">Rapor Selesai</div>
                        <h2 class="fw-bold text-primary m-0">${stats.rapor_selesai} / ${stats.total_murid}</h2>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error("Gagal memuat statistik:", error);
    }
}

function logout() {
    localStorage.removeItem('user_session');
    window.location.reload();
}

window.onload = () => {
    if (localStorage.getItem('user_session')) {
        renderInterface();
    }
};
// ==========================================
// FITUR DASHBOARD GURU
// ==========================================

async function loadGuruDashboard() {
    // Tampilkan bagian guru, sembunyikan stats admin
    document.getElementById('dashboard-stats').classList.add('d-none');
    document.getElementById('guru-dashboard').classList.remove('d-none');
    
    const tbody = document.getElementById('tabel-murid');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><i class="fas fa-spinner fa-spin text-emerald fa-2x"></i><br>Memuat data murid...</td></tr>';

    try {
        const payload = { action: 'getDaftarMurid' };
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            const data = result.data;
            if(data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Belum ada data murid di database.</td></tr>';
                return;
            }

            let barisHTML = '';
            data.forEach((murid, index) => {
                barisHTML += `
                    <tr>
                        <td class="fw-bold">${index + 1}</td>
                        <td class="fw-bold text-emerald">${murid.nama}</td>
                        <td>${murid.nisn}</td>
                        <td><span class="badge bg-warning text-dark">Belum Diisi</span></td>
                        <td>
                            <button class="btn btn-sm btn-gold fw-bold" onclick="bukaFormRapor('${murid.id_murid}', '${murid.nama}')">
                                <i class="fa-solid fa-pen-to-square"></i> Isi Rapor
                            </button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = barisHTML;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Gagal memuat data: ${error.message}</td></tr>`;
    }
}

function bukaFormRapor(idMurid, namaMurid) {
    // Setel nama murid di judul form
    document.getElementById('namaMuridModal').innerText = `Input Rapor: ${namaMurid}`;
    document.getElementById('id_murid_input').value = idMurid;
    
    // Tampilkan Modal Bootstrap
    const modalRapor = new bootstrap.Modal(document.getElementById('modalInputRapor'));
    modalRapor.show();
}

// Modifikasi fungsi renderInterface agar membaca role Guru
// Cari fungsi renderInterface() di atas, dan ubah bagian "if (user.role === 'Admin')" menjadi seperti ini:
/*
    if (user.role === 'Admin') {
        loadAdminStats();
    } else if (user.role === 'Guru') {
        loadGuruDashboard();
    } else {
        // ... dst
    }
*/
