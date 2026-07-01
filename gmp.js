const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_KEY";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadGMP() {
  const { data, error } = await supabaseClient
    .from("ipos")
    .select(`
      *,
      ipo_live_updates (
        gmp,
        total_subscription
      )
    `);

  if (error) {
    document.getElementById("gmpTableBody").innerHTML =
      `<tr><td colspan="6">${error.message}</td></tr>`;
    return;
  }

  renderGMP(data || []);
}

function renderGMP(data) {
  const tbody = document.getElementById("gmpTableBody");

  document.getElementById("totalIPO").innerText = data.length;

  tbody.innerHTML = data.map(ipo => {
    const live = ipo.ipo_live_updates?.[0] || {};

    return `
      <tr>
        <td>${ipo.company_name}</td>
        <td>${live.gmp || "-"}</td>
        <td>${live.total_subscription || "-"}</td>
        <td>${ipo.ipo_type || "-"}</td>
        <td>${ipo.open_date || "-"}</td>
        <td>${ipo.close_date || "-"}</td>
      </tr>
    `;
  }).join("");
}

document.addEventListener("DOMContentLoaded", loadGMP);
