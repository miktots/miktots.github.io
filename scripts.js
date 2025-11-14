document.addEventListener('DOMContentLoaded', () => {
    // Memuat modul-modul secara dinamis untuk PCC Generator
    loadModule('header.html', 'header');
    loadModule('/modules/pcc-generator/form-input.html', 'formInput');
    loadModule('/modules/pcc-generator/script-output.html', 'scriptOutput');
    loadModule('footer.html', 'footer');

    // Menangani pengiriman formulir
    document.getElementById('loadBalancingForm').addEventListener('submit', generateScript);
});

function loadModule(modulePath, elementId) {
    fetch(modulePath)
        .then(response => response.text())
        .then(data => document.getElementById(elementId).innerHTML = data)
        .catch(error => console.error('Error loading module:', error));
}

function generateScript(event) {
    event.preventDefault();

    // Ambil data dari form
    const ispCount = document.getElementById('ispCount').value;
    const routerOS = document.getElementById('routerOS').value;
    const bandwidth = document.getElementById('bandwidth').checked ? 'on' : 'off';
    const recursive = document.getElementById('recursive').checked ? 'on' : 'off';

    // Menghasilkan script berdasarkan input pengguna
    let script = `
# MikroTik PCC Load Balancing Premium Configuration
# Dihasilkan oleh Opuz
# Tanggal: ${new Date().toLocaleString()}
# Versi RouterOS: ${routerOS}
# Jumlah ISP: ${ispCount}
# Fitur Rekursif: ${recursive}
# Pembagian Bandwidth: ${bandwidth}

# Daftar Alamat Lokal
/ip firewall address-list add address=10.0.0.0/8 list=Lokal
/ip firewall address-list add address=172.16.0.0/12 list=Lokal
/ip firewall address-list add address=192.168.0.0/16 list=Lokal

# NAT Global
/ip firewall nat add action=masquerade chain=srcnat comment="NAT Global untuk Load Balancing"

# Tabel Routing (RouterOS v7)
/routing table remove [find name~"ether1" or name~"ether2"]
/routing table add name="ether1" fib
/routing table add name="ether2" fib

# Cek Gateway untuk DNS
/ip route add check-gateway=ping comment="Cek Gateway ether1" distance=1 dst-address=1.1.1.1/32 gateway=192.168.1.1
/ip route add check-gateway=ping comment="Cek Gateway ether2" distance=1 dst-address=1.1.1.2/32 gateway=192.168.2.1

# Routing Default
/ip route add check-gateway=ping comment="Rute Default via ether1" distance=1 gateway=1.1.1.1 target-scope=30
/ip route add check-gateway=ping comment="Rute Default via ether2" distance=2 gateway=1.1.1.2 target-scope=30

# Routing dengan Mark
/ip route add check-gateway=ping comment="Mark Routing untuk ether1" distance=1 gateway=1.1.1.1 routing-table="ether1" target-scope=30
/ip route add check-gateway=ping comment="Mark Routing untuk ether2" distance=1 gateway=1.1.1.2 routing-table="ether2" target-scope=30

# Mangle Rules untuk Lalu Lintas Lokal
/ip firewall mangle add action=accept chain=prerouting comment="Lalu Lintas Lokal Diterima" dst-address-list=Lokal src-address-list=Lokal
/ip firewall mangle add action=accept chain=postrouting dst-address-list=Lokal src-address-list=Lokal
/ip firewall mangle add action=accept chain=forward dst-address-list=Lokal src-address-list=Lokal
/ip firewall mangle add action=accept chain=input dst-address-list=Lokal src-address-list=Lokal
/ip firewall mangle add action=accept chain=output dst-address-list=Lokal src-address-list=Lokal

# Marking Koneksi untuk Input
/ip firewall mangle add action=mark-connection chain=input in-interface="ether1" new-connection-mark="conn_ether1" passthrough=yes
/ip firewall mangle add action=mark-connection chain=input in-interface="ether2" new-connection-mark="conn_ether2" passthrough=yes

# Marking Routing untuk Output
/ip firewall mangle add action=mark-routing chain=output connection-mark="conn_ether1" new-routing-mark="route_ether1" passthrough=yes
/ip firewall mangle add action=mark-routing chain=output connection-mark="conn_ether2" new-routing-mark="route_ether2" passthrough=yes

# Aturan Load Balancing PCC
/ip firewall mangle add action=mark-connection chain=prerouting dst-address-type=!local new-connection-mark="conn_ether1" passthrough=yes per-connection-classifier=both-addresses-and-ports:2/0 dst-address-list=!Lokal src-address-list=Lokal
/ip firewall mangle add action=mark-connection chain=prerouting dst-address-type=!local new-connection-mark="conn_ether2" passthrough=yes per-connection-classifier=both-addresses-and-ports:2/1 dst-address-list=!Lokal src-address-list=Lokal

# Marking Routing untuk PCC
/ip firewall mangle add action=mark-routing chain=prerouting connection-mark="conn_ether1" new-routing-mark="route_ether1" passthrough=yes dst-address-list=!Lokal src-address-list=Lokal
/ip firewall mangle add action=mark-routing chain=prerouting connection-mark="conn_ether2" new-routing-mark="route_ether2" passthrough=yes dst-address-list=!Lokal src-address-list=Lokal

# Konfigurasi Selesai!
# Semoga Berhasil!
    `;

    // Tampilkan script di bagian generatedScript
    document.getElementById('scriptOutputArea').innerText = script;
}
</script>