function ip2long(IP) {
    var i = 0;
    IP = IP.match(
	    /([1-9]\d*|0[0-7]*|0x[\da-f]+)(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?/i
    ); // Verify IP format.
    if (!IP) {
	return false;
    }
    IP[0] = 0;
    for (i = 1; i < 5; i += 1) {
	IP[0] += !!((IP[i] || '')
		    .length);
	IP[i] = parseInt(IP[i]) || 0;
    }
    IP.push(256, 256, 256, 256);
    IP[4 + IP[0]] *= Math.pow(256, 4 - IP[0]);
    if (IP[1] >= IP[5] || IP[2] >= IP[6] || IP[3] >= IP[7] || IP[4] >= IP[8]) {
	return false;
    }
    return IP[1] * (IP[0] === 1 || 16777216) + IP[2] * (IP[0] <= 2 || 65536) + IP[3] * (IP[0] <= 3 || 256) + IP[4] * 1;
}

function ipsort(l,r) {
    lip = ip2long(l); rip = ip2long(r);
    if(lip==false||rip==false) { return l < r ? -1 : (l > r ? 1 : 0) ; }
    else { return lip < rip ? -1 : (lip > rip ? 1 : 0) ; }
}
