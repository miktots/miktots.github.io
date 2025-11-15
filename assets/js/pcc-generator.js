document.getElementById('pcc-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Step 1: Get RouterOS Version, ISP Settings, and PCC Type
    var routerosVersion = document.getElementById('routeros-version').value;
    var jumlahIsp = document.getElementById('jumlah-isp').value;
    var pccType = document.getElementById('pcc-type').value;

    var ispConfigs = []; // Will hold configurations for each ISP
    for (var i = 1; i <= jumlahIsp; i++) {
        var interfaceIsp = document.getElementById(`interface-isp${i}`).value;
        var gatewayIsp = document.getElementById(`gateway-isp${i}`).value;
        var dnsIsp = document.getElementById(`dns-isp${i}`).value;
        var bandwidthIsp = document.getElementById(`bandwidth-isp${i}`).value;
        ispConfigs.push({
            interface: interfaceIsp,
            gateway: gatewayIsp,
            dns: dnsIsp,
            bandwidth: bandwidthIsp
        });
    }

    // Step 2: Bridge LAN IP and LAN Interface
    var bridgeIp = document.getElementById('bridge-ip').value;
    var etherInterface = document.getElementById('ether-interface').value;

    var recursive = document.getElementById('recursive').value;
    var bandwidthRatio = document.getElementById('bandwidth-ratio').value;

    // Start Building Config
    var config = '';
    if (routerosVersion === '6') {
        config += "# RouterOS 6 Configuration\n";
    } else if (routerosVersion === '7') {
        config += "# RouterOS 7 Configuration\n";
    }

    // Step 3: DHCP Server Configuration for Bridge LAN
    config += `
/interface bridge add name=bridge-LAN
/interface bridge port add bridge=bridge-LAN interface=${etherInterface}
# DHCP Configuration
/ip address add address=${bridgeIp} interface=bridge-LAN
/ip pool add name=dhcp-pool ranges=${bridgeIp.split('/')[0].slice(0, -1)}.10-${bridgeIp.split('/')[0].slice(0, -1)}.100
/ip dhcp-server add name=dhcp-LAN interface=bridge-LAN lease-time=1d address-pool=dhcp-pool
/ip dhcp-server network add address=${bridgeIp} gateway=${bridgeIp.split('/')[0]}.1
/ip arp add address=${bridgeIp.split('/')[0]}.1 interface=bridge-LAN
    `;

    // Step 4: Bypass IP Lokal (Address List)
    config += `
/ip firewall address-list add list=LIST-LOKAL address=10.0.0.0/8
/ip firewall address-list add list=LIST-LOKAL address=172.16.0.0/12
/ip firewall address-list add list=LIST-LOKAL address=192.168.0.0/16
    `;

    ispConfigs.forEach(function(isp, index) {
        config += `
/ip firewall mangle
# ISP ${index + 1} Configuration
add chain=prerouting in-interface=${isp.interface} gateway=${isp.gateway} dns=${isp.dns} bandwidth=${isp.bandwidth} action=mark-connection new-connection-mark=conn${index + 1} pcc=${pccType}
        `;
    });

    // Step 5: Routing for each ISP
    ispConfigs.forEach(function(isp, index) {
        config += `
/ip route
add gateway=${isp.gateway} routing-mark=conn${index + 1}
        `;
    });

    // Step 6: Recursive and Bandwidth Ratio Logic
    if (recursive === "ON") {
        config += "\n# Enable Recursive Routing\n";
    }

    if (bandwidthRatio === "ON") {
        config += "\n# Enable Bandwidth Ratio\n";
    }

    // Display the generated config in the textarea
    document.getElementById('output').value = config;
});

// Add More ISPs dynamically
document.getElementById('add-isp-btn').addEventListener('click', function() {
    var jumlahIsp = document.getElementById('jumlah-isp').value;
    jumlahIsp = parseInt(jumlahIsp) + 1;
    document.getElementById('jumlah-isp').value = jumlahIsp;

    var ispContainer = document.getElementById('isp-config-container');
    var newIsp = document.createElement('div');
    newIsp.classList.add('isp-config');
    newIsp.innerHTML = `
        <div class="section-header">
            <h3>ISP ${jumlahIsp}</h3>
        </div>
        <div class="form-row">
            <label for="interface-isp${jumlahIsp}">Interface:</label>
            <input type="text" id="interface-isp${jumlahIsp}" name="interface-isp${jumlahIsp}" placeholder="e.g., ether${jumlahIsp}" required>
        </div>
        <div class="form-row">
            <label for="gateway-isp${jumlahIsp}">Gateway:</label>
            <input type="text" id="gateway-isp${jumlahIsp}" name="gateway-isp${jumlahIsp}" placeholder="e.g., 192.168.${jumlahIsp}.1" required>
        </div>
        <div class="form-row">
            <label for="dns-isp${jumlahIsp}">DNS:</label>
            <input type="text" id="dns-isp${jumlahIsp}" name="dns-isp${jumlahIsp}" placeholder="e.g., 1.1.1.${jumlahIsp}" required>
        </div>
        <div class="form-row">
            <label for="bandwidth-isp${jumlahIsp}">Bandwidth (Mbps):</label>
            <input type="number" id="bandwidth-isp${jumlahIsp}" name="bandwidth-isp${jumlahIsp}" placeholder="e.g., 100" required>
        </div>
    `;
    ispContainer.appendChild(newIsp);
});

// Add functionality for Copy to Clipboard button
document.getElementById('copy-btn').addEventListener('click', function() {
    var configText = document.getElementById('output');
    configText.select();
    configText.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");

    // Notify user that the config has been copied
    alert("Configuration copied to clipboard!");
});
