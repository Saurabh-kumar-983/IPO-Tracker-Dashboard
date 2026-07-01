const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpenBtam9ydHZpamR3eXlkdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTEwMTcsImV4cCI6MjA5Nzg2NzAxN30.41CO6OSasC1b6m6uoNzURgNQGymOciABNpr1-FVO-8w";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function loadGMP() {
  const tbody = document.getElementById("gmpTableBody");

  tbody.innerHTML = `<tr><td colspan="6">Loading GMP data...</td></tr>`;

  const { data, error } = await supabaseClient
    .from("ipos")
    .select(`
      *,
      ipo_live_updates (
        gmp,
        total_subscription
      )
    `)
    .order("open_date", { ascending: true });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
    return;
  }

  renderGMP(data || []);
}

function renderGMP(data) {
  const tbody = document.getElementById("gmpTableBody");

  document.getElementById("totalIPO").innerText = data.length;

  let highest = 0;
  let total = 0;
  let active = 0;

  tbody.innerHTML = data.map(ipo => {
    const live = ipo.ipo_live_updates?.[0] || {};
    const gmp = parseFloat((live.gmp || "0").toString().replace(/[^\d.-]/g, "")) || 0;

    if (gmp > 0) {
      active++;
      total += gmp;
      if (gmp > highest) highest = gmp;
    }

    return `
      <tr>
        <td>${ipo.company_name || "-"}</td>
        <td>${live.gmp || "-"}</td>
        <td>${live.total_subscription || "-"}</td>
        <td>${ipo.ipo_type || "-"}</td>
        <td>${ipo.open_date || "-"}</td>
        <td>${ipo.close_date || "-"}</td>
      </tr>
    `;
  }).join("");

  document.getElementById("activeCount").innerText = active;
  document.getElementById("highestGMP").innerText = `₹${highest}`;
  document.getElementById("avgGMP").innerText =
    active > 0 ? `₹${(total / active).toFixed(2)}` : "₹0";
}

document.addEventListener("DOMContentLoaded", loadGMP);
