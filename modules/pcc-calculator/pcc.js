
document.getElementById("pcc-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const connLimit = document.getElementById("connLimit").value;
    const interface = document.getElementById("interface").value;
    
    // Menyusun script PCC berdasarkan input
    const pccScript = `
        /interface pppoe-client add name=pppoe-out1 user=admin password=admin service-name=${interface} disabled=no
        /ip firewall mangle add action=mark-connection chain=prerouting in-interface=${interface} new-connection-mark=conn-${connLimit}
        /ip route add gateway=${interface} routing-mark=conn-${connLimit}
    `;
    
    // Menampilkan hasil script
    document.getElementById("result").innerText = "Script PCC yang dihasilkan:\n\n" + pccScript;
});
