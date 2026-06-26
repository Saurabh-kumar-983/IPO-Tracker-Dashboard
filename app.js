const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "PASTE_YOUR_FULL_ANON_KEY_HERE";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadIPOs(status = null) {
  const ipoList = document.getElementById("ipoList");
  ipoList.innerHTML = "<p>Loading IPO data...</p>";

  let query = supabase.from("ipos").select("*").order("open_date", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    ipoList.innerHTML = `<p>Error: ${error.message}</p>`;
    return;
  }

  ipoList.innerHTML = data.map(ipo => `
    <div class="card">
      <h2>${ipo.company_name}</h2>
      <p><b>Symbol:</b> ${ipo.symbol}</p>
      <p><b>Status:</b> ${ipo.status}</p>
      <p><b>Open:</b> ${ipo.open_date}</p>
      <p><b>Close:</b> ${ipo.close_date}</p>
      <p><b>Price Band:</b> ${ipo.price_band}</p>
      <p><b>Lot Size:</b> ${ipo.lot_size}</p>
      <p><b>Issue Size:</b> ${ipo.issue_size}</p>
      <p><b>Registrar:</b> ${ipo.registrar}</p>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadIPOs();
});
