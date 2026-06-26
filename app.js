const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpenBtam9ydHZpamR3eXlkdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTEwMTcsImV4cCI6MjA5Nzg2NzAxN30.41CO6OSasC1b6m6uoNzURgNQGymOciABNpr1-FVO-8w";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadIPOs(status = null) {
  const ipoList = document.getElementById("ipoList");
  ipoList.innerHTML = "<p>Loading IPO data...</p>";

  let query = supabaseClient
    .from("ipos")
    .select("*")
    .order("open_date", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    ipoList.innerHTML = `<p>Error loading IPO data: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    ipoList.innerHTML = "<p>No IPO data found.</p>";
    return;
  }

  ipoList.innerHTML = data.map(ipo => `
    <div class="card">
      <h2>${ipo.company_name || "-"}</h2>
      <p><b>Symbol:</b> ${ipo.symbol || "-"}</p>
      <p><b>Status:</b> ${ipo.status || "-"}</p>
      <p><b>IPO Type:</b> ${ipo.ipo_type || "-"}</p>
      <p><b>Exchange:</b> ${ipo.exchange || "-"}</p>
      <p><b>Open Date:</b> ${ipo.open_date || "-"}</p>
      <p><b>Close Date:</b> ${ipo.close_date || "-"}</p>
      <p><b>Price Band:</b> ${ipo.price_band || "-"}</p>
      <p><b>Lot Size:</b> ${ipo.lot_size || "-"}</p>
      <p><b>Issue Size:</b> ${ipo.issue_size || "-"}</p>
      <p><b>Registrar:</b> ${ipo.registrar || "-"}</p>
      <p><b>Allotment Date:</b> ${ipo.allotment_date || "-"}</p>
      <p><b>Refund Date:</b> ${ipo.refund_date || "-"}</p>
      <p><b>Listing Date:</b> ${ipo.listing_date || "-"}</p>
      <p><b>Remarks:</b> ${ipo.remarks || "-"}</p>

      <div class="links">
        ${ipo.rhp_url ? `<a href="${ipo.rhp_url}" target="_blank">View RHP</a>` : ""}
        ${ipo.registrar_url ? `<a href="${ipo.registrar_url}" target="_blank">Check Allotment</a>` : ""}
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadIPOs();
});
