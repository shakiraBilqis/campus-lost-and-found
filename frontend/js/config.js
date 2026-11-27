// Alamat backend. Default: origin yang sama dengan halaman (backend Flask
// juga menyajikan frontend), jadi port mengikuti PORT server.
// Saat deploy ke AWS dengan frontend & backend terpisah, ganti dengan
// alamat backend, misalnya "http://<public-ip-ec2>:5000" atau URL load balancer.
const API_BASE =
  location.protocol === "file:" ? "http://localhost:5000" : location.origin;
