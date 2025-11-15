document.getElementById('pcc-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Step 1: Get RouterOS Version
    var routerosVersion = document.getElementById('routeros-version').value;
    
    // Step 2: Get Source IP (WAN IP/Gateway) and Destination IP (LAN IP/Bridge)
    var wanIp = document.getElementById('src-ip').value; // IP WAN / Gateway
    var lanIp = document.getElementById('dst-ip').value; // IP LAN / Bridge-LAN
    
    // Step 3: Get Interface and Gateway
    var interface = document.getElementById('interface').value;
    var gateway = document.getElementById('gateway').value;
    var routingMark = document.getElementById('mark-routing').value;

    // Step 4: Get WAN Sources (dynamic inputs)
    var wanSources = [];
    var wanInputs = document.querySelectorAll('input[name="wan-source"]');
    wanInputs.forEach(function(input) {
        wanSources.push(input.value);
    });

    var config = '';
    if (routerosVersion === '6') {
        config += "# RouterOS 6 Configuration\n";
    } else if (routerosVersion === '7') {
        config += "# RouterOS 7 Configuration\n";
    }

    // Step 5: Mangle Rules for PCC (based on WAN IP and LAN IP)
    config += `
/ip firewall mangle
add chain=prerouting src-address=${wanIp} dst-address=${lanIp} action=mark-connection new-connection-mark=conn1 passthrough=yes
add chain=prerouting connection-mark=conn1 action=mark-routing new-routing-mark=${routingMark}
    `;

    // Step 6: Add multiple WAN Sources
    wanSources.forEach(function(wan, index) {
        config += `
# WAN Source ${index + 1}
add chain=prerouting in-interface=${interface} src-address=${wan} action=mark-connection new-connection-mark=conn${index + 1} passthrough=yes
add chain=prerouting connection-mark=conn${index + 1} action=mark-routing new-routing-mark=route${index + 1}
        `;
    });

    // Step 7: Add routing rule for gateway
    config += `
/ip route
add gateway=${gateway} routing-mark=${routingMark}
    `;

    // Output the generated configuration to textarea
    document.getElementById('output').value = config;
});

// Add WAN source input dynamically
document.getElementById('add-wan-source').addEventListener('click', function() {
    var wanSourceDiv = document.createElement('div');
    wanSourceDiv.classList.add('wan-source');
    wanSourceDiv.innerHTML = '<input type="text" name="wan-source" placeholder="Enter WAN Source">';
    document.getElementById('wan-sources').appendChild(wanSourceDiv);
});
