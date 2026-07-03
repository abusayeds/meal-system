import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);
dns.setDefaultResultOrder("ipv4first");

export async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }

  const withoutScheme = uri.slice("mongodb+srv://".length);
  const atIndex = withoutScheme.lastIndexOf("@");
  if (atIndex === -1) {
    throw new Error("Invalid MongoDB SRV URI");
  }

  const authPart = withoutScheme.slice(0, atIndex + 1);
  const hostPart = withoutScheme.slice(atIndex + 1);
  const slashIndex = hostPart.indexOf("/");
  const hostname =
    slashIndex === -1
      ? hostPart.split("?")[0]
      : hostPart.slice(0, slashIndex).split("?")[0];
  const pathAndQuery = slashIndex === -1 ? "" : hostPart.slice(slashIndex);

  const srvHost = `_mongodb._tcp.${hostname}`;

  const [srvRecords, txtRecords] = await Promise.all([
    dns.promises.resolveSrv(srvHost),
    dns.promises.resolveTxt(hostname).catch(() => [] as string[][]),
  ]);

  if (!srvRecords.length) {
    throw new Error(`No SRV records found for ${srvHost}`);
  }

  const hosts = srvRecords
    .map((record) => `${record.name.replace(/\.$/, "")}:${record.port}`)
    .join(",");

  const params = new URLSearchParams(
    pathAndQuery.includes("?") ? pathAndQuery.split("?")[1] : ""
  );

  if (!params.has("ssl") && !params.has("tls")) {
    params.set("ssl", "true");
  }

  for (const txt of txtRecords.flat()) {
    for (const part of txt.split("&")) {
      const [key, value] = part.split("=");
      if (key && value && !params.has(key)) {
        params.set(key, value);
      }
    }
  }

  const query = params.toString();
  const path = pathAndQuery.split("?")[0];

  return `mongodb://${authPart}${hosts}${path}${query ? `?${query}` : ""}`;
}
