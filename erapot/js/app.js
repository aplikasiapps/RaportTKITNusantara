const API_URL = "https://script.google.com/macros/s/AKfycbxGShEv4bosJRFX2NR1aezlkW55gqrddzPOMQ0S8KBPWHsK7m4S4K_n8_DmODPtvig/exec";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Mendefinisikan tombol agar tidak error (btn is not defined)
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
        alert('Terjadi kesalahan jaringan atau API belum terhubung. Detail: ' + err.message);
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
    
    if (user.role === 'Admin') {
        loadAdminStats();
    } else {
        document.getElementById('dashboard-stats').innerHTML = `
            <div class="col-12"><div class="alert alert-info">Dashboard fitur ${user.role} siap dikembangkan lebih lanjut.</div></div>`;
    }
}

async function loadAdminStats() {
    try {
        const response = await fetch(`${API_URL}?action=getDashboardAdmin`);
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
