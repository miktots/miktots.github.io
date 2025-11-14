document.getElementById('pcc-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var srcIp = document.getElementById('src-ip').value;
    var dstIp = document.getElementById('dst-ip').value;
    var interface = document.getElementById('interface').value;
    var gateway = document.getElementById('gateway').value;
    var routingMark = document.getElementById('mark-routing').value;

    var config = `
# PCC Configuration for RouterOS
/ip firewall mangle
add chain=prerouting src-address=${srcIp} dst-address=${dstIp} action=mark-connection new-connection-mark=conn1 passthrough=yes
add chain=prerouting connection-mark=conn1 action=mark-routing new-routing-mark=${routingMark}
# Add routing rule to use the specific gateway
/ip route
add gateway=${gateway} routing-mark=${routingMark}
    `;

    // Mengisi textarea dengan output konfigurasi
    document.getElementById('output').value = config;
});