const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);
dns.setDefaultResultOrder("ipv4first");
