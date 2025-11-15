document.getElementById('pcc-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var routerosVersion = document.getElementById('routeros-version').value;

    var srcIp = document.getElementById('src-ip').value;
    var dstIp = document.getElementById('dst-ip').value;
    var interface = document.getElementById('interface').value;
    var gateway = document.getElementById('gateway').value;
    var routingMark = document.getElementById('mark-routing').value;

    var wanSources = [];
    var wanInputs = document.querySelectorAll('input[name="wan-source"]');
    wanInputs.forEach(function(input) {
        wanSources.push(input.value);
    });

    var config = '';
    if (routerosVersion === '6') {
        config += "# RouterOS 6 Configuration
";
    } else if (routerosVersion === '7') {
        config += "# RouterOS 7 Configuration
";
    }

    config += `
/ip firewall mangle
add chain=prerouting src-address=${srcIp} dst-address=${dstIp} action=mark-connection new-connection-mark=conn1 passthrough=yes
add chain=prerouting connection-mark=conn1 action=mark-routing new-routing-mark=${routingMark}
    `;

    wanSources.forEach(function(wan, index) {
        config += `
# WAN Source ${index + 1}
add chain=prerouting in-interface=${interface} src-address=${wan} action=mark-connection new-connection-mark=conn${index + 1} passthrough=yes
add chain=prerouting connection-mark=conn${index + 1} action=mark-routing new-routing-mark=route${index + 1}
        `;
    });

    config += `
/ip route
add gateway=${gateway} routing-mark=${routingMark}
    `;

    document.getElementById('output').value = config;
});

document.getElementById('add-wan-source').addEventListener('click', function() {
    var wanSourceDiv = document.createElement('div');
    wanSourceDiv.classList.add('wan-source');
    wanSourceDiv.innerHTML = '<input type="text" name="wan-source" placeholder="Enter WAN Source">';
    document.getElementById('wan-sources').appendChild(wanSourceDiv);
});