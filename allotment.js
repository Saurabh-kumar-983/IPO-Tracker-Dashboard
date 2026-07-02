const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInJlZiI6ImlpenBtam9ydHZpamR3eXlkdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTEwMTcsImV4cCI6MjA5Nzg2NzAxN30.41CO6OSasC1b6m6uoNzURgNQGymOciABNpr1-FVO-8w";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let ipoList = [];

async function loadIPOsForAllotment() {
  const select = document.getElementById("ipoSelect");

  const { data, error } = await supabaseClient
    .from("ipos")
    .select("id, company_name, symbol, registrar, registrar_url")
    .order("open_date", { ascending: true });

  if (error) {
    select.innerHTML = `<option value="">Error loading IPOs</option>`;
    alert(error.message);
    return;
  }

  ipoList = data || [];

  if (!ipoList.length) {
    select.innerHTML = `<option value="">No IPO records found</option>`;
    return;
  }

  select.innerHTML = `<option value="">Select IPO</option>` +
    ipoList.map(ipo => `
      <option value="${ipo.id}">
        ${ipo.company_name || "-"} (${ipo.symbol || "-"})
      </option>
    `).join("");
}

function checkAllotment() {
  const ipoId = document.getElementById("ipoSelect").value;
  const pan = document.getElementById("panNumber").value.trim().toUpperCase();
  const applicationNo = document.getElementById("applicationNumber").value.trim();

  if (!ipoId) {
    alert("Please select an IPO.");
    return;
  }

  if (!pan && !applicationNo) {
    alert("Please enter PAN Number or Application Number.");
    return;
  }

  const selectedIPO = ipoList.find(ipo => String(ipo.id) === String(ipoId));

  if (!selectedIPO || !selectedIPO.registrar_url) {
    alert("Registrar URL is not available for this IPO.");
    return;
  }

  sessionStorage.setItem("ipo_pan_temp", pan);
  sessionStorage.setItem("ipo_application_temp", applicationNo);

  window.open(selectedIPO.registrar_url, "_blank");
}

document.addEventListener("DOMContentLoaded", loadIPOsForAllotment);
