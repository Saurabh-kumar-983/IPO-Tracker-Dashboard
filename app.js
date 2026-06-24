const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadIPOs(status = null) {
  let query = supabase.from("ipos").select("*").order("open_date", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    document.getElementById("ipoList").innerHTML = "Error loading IPO data";
    return;
  }

  document.getElementById("ipoList").innerHTML = data.map(ipo => `
    <div class="card">
      <h2>${ipo.company_name}</h2>
      <p><b>Symbol:</b> ${ipo.symbol || "-"}</p>
      <p><b>Status:</b> ${ipo.status}</p>
      <p><b>Open:</b> ${ipo.open_date || "-"} | <b>Close:</b> ${ipo.close_date || "-"}</p>
      <p><b>Price Band:</b> ${ipo.price_band || "-"}</p>
      <p><b>Lot Size:</b> ${ipo.lot_size || "-"}</p>
      <p><b>Issue Size:</b> ${ipo.issue_size || "-"}</p>
      <p><b>Registrar:</b> ${ipo.registrar || "-"}</p>
      <a href="${ipo.registrar_url || '#'}" target="_blank">Check Allotment</a>
    </div>
  `).join("");
}

loadIPOs();
