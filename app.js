const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpenBtam9ydHZpamR3eXlkdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTEwMTcsImV4cCI6MjA5Nzg2NzAxN30.41CO6OSasC1b6m6uoNzURgNQGymOciABNpr1-FVO-8w";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allIPOs = [];

async function fetchAllIPOs() {
  const tableBody = document.getElementById("ipoTableBody");
  tableBody.innerHTML = `<tr><td colspan="13">Loading IPO data...</td></tr>`;

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
    tableBody.innerHTML = `<tr><td colspan="13">Error: ${error.message}</td></tr>`;
    return;
  }

  allIPOs = data || [];
  updateStats(allIPOs);
  renderWidgets(allIPOs);
  renderSubscriptionAnalytics(allIPOs);
  renderTable(allIPOs);
}

function getAutoStatus(ipo) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const openDate = ipo.open_date ? new Date(ipo.open_date) : null;
  const closeDate = ipo.close_date ? new Date(ipo.close_date) : null;

  if (openDate) openDate.setHours(0, 0, 0, 0);
  if (closeDate) closeDate.setHours(0, 0, 0, 0);

  if (openDate && today < openDate) return "Upcoming";
  if (openDate && closeDate && today >= openDate && today <= closeDate) return "Open";
  if (closeDate && today > closeDate) return "Closed";

  return ipo.status || "Upcoming";
}

function parseSub(value) {
  if (!value) return 0;
  return parseFloat(String(value).replace(/[^\d.-]/g, "")) || 0;
}

function getLive(ipo) {
  return ipo.ipo_live_updates && ipo.ipo_live_updates.length
    ? ipo.ipo_live_updates[0]
    : {};
}

function safe(v) {
  return v || "-";
}

function updateStats(data) {
  document.getElementById("totalCount").innerText = data.length;
  document.getElementById("upcomingCount").innerText =
    data.filter(x => getAutoStatus(x) === "Upcoming").length;
  document.getElementById("openCount").innerText =
    data.filter(x => getAutoStatus(x) === "Open").length;
  document.getElementById("closedCount").innerText =
    data.filter(x => getAutoStatus(x) === "Closed").length;
}

function renderSubscriptionAnalytics(data) {
  let highestTotal = { name: "-", value: 0 };
  let highestRetail = { name: "-", value: 0 };
  let highestQib = { name: "-", value: 0 };
  let highestNii = { name: "-", value: 0 };

  data.forEach(ipo => {
    const live = getLive(ipo);

    const total = parseSub(live.total_subscription);
    const retail = parseSub(live.retail_subscription);
    const qib = parseSub(live.qib_subscription);
    const nii = parseSub(live.nii_subscription);

    if (total > highestTotal.value) highestTotal = { name: ipo.company_name, value: total };
    if (retail > highestRetail.value) highestRetail = { name: ipo.company_name, value: retail };
    if (qib > highestQib.value) highestQib = { name: ipo.company_name, value: qib };
    if (nii > highestNii.value) highestNii = { name: ipo.company_name, value: nii };
  });

  document.getElementById("highestTotalSub").innerText =
    highestTotal.value ? `${highestTotal.value}x` : "-";

  document.getElementById("highestRetailSub").innerText =
    highestRetail.value ? `${highestRetail.value}x` : "-";

  document.getElementById("highestQibSub").innerText =
    highestQib.value ? `${highestQib.value}x` : "-";

  document.getElementById("highestNiiSub").innerText =
    highestNii.value ? `${highestNii.value}x` : "-";
}

function renderWidgets(data) {
  renderGMPWidget(data);
  renderClosingWidget(data);
  renderListingWidget(data);
  renderCalendarWidget(data);
}

function renderGMPWidget(data) {
  const container = document.getElementById("gmpWidget");
  if (!container) return;

  container.innerHTML = data.slice(0, 5).map(ipo => {
    const live = getLive(ipo);
    return `
      <div>
        <strong>${safe(ipo.company_name)}</strong><br>
        GMP: <span class="green">${live.gmp || "-"}</span>
      </div>
    `;
  }).join("");
}

function renderClosingWidget(data) {
  const container = document.getElementById("closingWidget");
  if (!container) return;

  const today = new Date().toISOString().split("T")[0];
  const count = data.filter(x => x.close_date === today).length;
  container.innerHTML = `<div class="widget-big-number">${
