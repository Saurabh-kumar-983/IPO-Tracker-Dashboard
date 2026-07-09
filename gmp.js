const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpenBtam9ydHZpamR3eXlkdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTEwMTcsImV4cCI6MjA5Nzg2NzAxN30.41CO6OSasC1b6m6uoNzURgNQGymOciABNpr1-FVO-8w";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allGMPData = [];

async function loadGMP() {
  const tbody = document.getElementById("gmpTableBody");
  tbody.innerHTML = `<tr><td colspan="9">Loading GMP data...</td></tr>`;

  const { data, error } = await supabaseClient
    .from("ipos")
    .select(`
      *,
      ipo_live_updates (
        gmp,
        retail_subscription,
        qib_subscription,
        nii_subscription,
        total_subscription,
        last_updated
      )
    `)
    .order("open_date", { ascending: true });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="9">${error.message}</td></tr>`;
    return;
  }

  allGMPData = data || [];
  updateGMPStats(allGMPData);
  renderGMPTable(allGMPData);
}

function getLive(ipo) {
  return ipo.ipo_live_updates && ipo.ipo_live_updates.length
    ? ipo.ipo_live_updates[0]
    : {};
}

function safe(v) {
  return v || "-";
}

function parseMoney(value) {
  if (!value) return 0;
  return parseFloat(String(value).replace(/[^\d.-]/g, "")) || 0;
}

function getUpperPrice(priceBand) {
  if (!priceBand) return 0;

  const numbers = String(priceBand).match(/\d+(\.\d+)?/g);
  if (!numbers || numbers.length === 0) return 0;

  return Number(numbers[numbers.length - 1]) || 0;
}

function estimateGain(gmp, priceBand) {
  const gmpValue = parseMoney(gmp);
  const upperPrice = getUpperPrice(priceBand);

  if (!gmpValue || !upperPrice) return "-";

  return `${((gmpValue / upperPrice) * 100).toFixed(1)}%`;
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function updateGMPStats(data) {
  let active = 0;
  let highest = 0;
  let total = 0;

  data.forEach(ipo => {
    const live = getLive(ipo);
    const gmpValue = parseMoney(live.gmp);

    if (gmpValue > 0) {
      active++;
      total += gmpValue;
      highest = Math.max(highest, gmpValue);
    }
  });

  document.getElementById("activeCount").innerText = active;
  document.getElementById("highestGMP").innerText = `₹${highest}`;
  document.getElementById("avgGMP").innerText =
    active > 0 ? `₹${(total / active).toFixed(2)}` : "₹0";
  document.getElementById("totalIPO").innerText = data.length;
}

function filterGMP(filterValue) {
  let filtered = allGMPData;

  if (filterValue === "Mainboard" || filterValue === "SME") {
    filtered = allGMPData.filter(ipo => ipo.ipo_type === filterValue);
  }

  if (filterValue === "Open" || filterValue === "Upcoming") {
    filtered = allGMPData.filter(ipo => ipo.status === filterValue);
  }

  renderGMPTable(filtered);
}

function badgeClass(status) {
  if (status === "Open") return "badge badge-open";
  if (status === "Closed") return "badge badge-closed";
  return "badge badge-upcoming";
}

function gmpClass(gmp) {
  const value = parseMoney(gmp);

  if (value > 0) return "gmp-positive";
  if (value < 0) return "gmp-negative";
  return "";
}

function renderGMPTable(data) {
  const tbody = document.getElementById("gmpTableBody");
  document.getElementById("gmpRecordCount").innerText = `${data.length} records`;

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="9">No GMP data found.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(ipo => {
    const live = getLive(ipo);

    return `
      <tr>
        <td>
          <a class="company" href="ipo.html?id=${ipo.id}">${safe(ipo.company_name)}</a>
          <span class="sub">${safe(ipo.symbol)} · ${safe(ipo.exchange)}</span>
        </td>
        <td class="${gmpClass(live.gmp)}"><b>${safe(live.gmp)}</b></td>
        <td>${estimateGain(live.gmp, ipo.price_band)}</td>
        <td>${safe(live.total_subscription)}</td>
        <td><span class="type">${safe(ipo.ipo_type)}</span></td>
        <td><span class="${badgeClass(ipo.status)}">${safe(ipo.status)}</span></td>
        <td>${safe(ipo.open_date)}</td>
        <td>${safe(ipo.close_date)}</td>
        <td>${formatDateTime(live.last_updated)}</td>
      </tr>
    `;
  }).join("");
}

document.addEventListener("DOMContentLoaded", loadGMP);
