document.getElementById('pcc-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Step 1: Get RouterOS Version (ROS 6 or ROS 7)
    var routerosVersion = document.getElementById('routeros-version').value;
    
    // Step 2: Get WAN IP/Gateway and LAN IP
    var wanIp = document.getElementById('wan-ip').value;
    var lanIp = document.getElementById('lan-ip').value;
    
    // Step 3: Get LAN Interface and Gateway IP
    var interface = document.getElementById('interface').value;
    var gateway = document.getElementById('gateway').value;
    var routingMark = document.getElementById('routing-mark').value;

    // Step 4: Get WAN Source IPs (allowing dynamic addition)
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

    // Step 5: Configure Mangle Rules for PCC
    config += `
/ip firewall mangle
add chain=prerouting src-address=${wanIp} dst-address=${lanIp} action=mark-connection new-connection-mark=conn1 passthrough=yes
add chain=prerouting connection-mark=conn1 action=mark-routing new-routing-mark=${routingMark}
    `;

    // Step 6: Add dynamic WAN sources
    wanSources.forEach(function(wan, index) {
        config += `
# WAN Source ${index + 1}
add chain=prerouting in-interface=${interface} src-address=${wan} action=mark-connection new-connection-mark=conn${index + 1} passthrough=yes
add chain=prerouting connection-mark=conn${index + 1} action=mark-routing new-routing-mark=route${index + 1}
        `;
    });

    // Step 7: Add routing rule for Gateway IP
    config += `
/ip route
add gateway=${gateway} routing-mark=${routingMark}
    `;

    // Step 8: Output the generated configuration into the textarea
    document.getElementById('output').value = config;
});

// Add additional WAN Source input dynamically
document.getElementById('add-wan-source').addEventListener('click', function() {
    var wanSourceDiv = document.createElement('div');
    wanSourceDiv.classList.add('wan-source');
    wanSourceDiv.innerHTML = '<input type="text" name="wan-source" placeholder="Enter WAN Source">';
    document.getElementById('wan-sources').appendChild(wanSourceDiv);
});
