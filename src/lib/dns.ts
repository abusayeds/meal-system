import dns from "dns";

// Fix MongoDB Atlas SRV lookup on Windows / some networks (ECONNREFUSED on _mongodb._tcp)
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);
dns.setDefaultResultOrder("ipv4first");
