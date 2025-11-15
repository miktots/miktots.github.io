document.getElementById('pcc-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Step 1: Get RouterOS Version and ISP Settings
    var routerosVersion = document.getElementById('routeros-version').value;
    var jumlahIsp = document.getElementById('jumlah-isp').value;

    // ISP 1
    var interfaceIsp1 = document.getElementById('interface-isp1').value;
    var gatewayIsp1 = document.getElementById('gateway-isp1').value;
    var dnsIsp1 = document.getElementById('dns-isp1').value;
    var bandwidthIsp1 = document.getElementById('bandwidth-isp1').value;

    // ISP 2
    var interfaceIsp2 = document.getElementById('interface-isp2').value;
    var gatewayIsp2 = document.getElementById('gateway-isp2').value;
    var dnsIsp2 = document.getElementById('dns-isp2').value;
    var bandwidthIsp2 = document.getElementById('bandwidth-isp2').value;

    // Advanced Features
    var recursive = document.getElementById('recursive').value;
    var bandwidthRatio = document.getElementById('bandwidth-ratio').value;

    // Start Building Config
    var config = '';
    if (routerosVersion === '6') {
        config += "# RouterOS 6 Configuration\n";
    } else if (routerosVersion === '7') {
        config += "# RouterOS 7 Configuration\n";
    }

    config += `
/ip firewall mangle
# ISP 1 Configuration
add chain=prerouting in-interface=${interfaceIsp1} gateway=${gatewayIsp1} dns=${dnsIsp1} bandwidth=${bandwidthIsp1} action=mark-connection new-connection-mark=conn1

# ISP 2 Configuration
add chain=prerouting in-interface=${interfaceIsp2} gateway=${gatewayIsp2} dns=${dnsIsp2} bandwidth=${bandwidthIsp2} action=mark-connection new-connection-mark=conn2
    `;

    if (recursive === "ON") {
        config += "\n# Enable Recursive Routing\n";
        // Add logic for recursive routing if needed
    }

    if (bandwidthRatio === "ON") {
        config += "\n# Enable Bandwidth Ratio\n";
        // Add logic for bandwidth ratio if needed
    }

    config += `
# Routing based on connection marks
/ip route
add gateway=${gatewayIsp1} routing-mark=conn1
add gateway=${gatewayIsp2} routing-mark=conn2
    `;

    // Output the generated configuration
    document.getElementById('output').value = config;
});
