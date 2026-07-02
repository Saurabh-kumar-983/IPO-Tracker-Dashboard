const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpenBtam9ydHZpamR3eXlkdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTEwMTcsImV4cCI6MjA5Nzg2NzAxN30.41CO6OSasC1b6m6uoNzURgNQGymOciABNpr1-FVO-8w";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allIPOs = [];

async function fetchAllIPOs() {
  const tableBody = document.getElementById("ipoTableBody");
  tableBody.innerHTML = `<tr><td colspan="15">Loading IPO data...</td></tr>`;

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
    tableBody.innerHTML = `<tr><td colspan="15">Error: ${error.message}</td></tr>`;
    return;
  }

  allIPOs = data || [];
  updateStats(allIPOs);
  renderWidgets(allIPOs);
  renderSubscriptionAnalytics(allIPOs);
  renderScoringAnalytics(allIPOs);
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
  let highestTotal = 0;
  let highestRetail = 0;
  let highestQib = 0;
  let highestNii = 0;

  data.forEach(ipo => {
    const live = getLive(ipo);
    highestTotal = Math.max(highestTotal, parseSub(live.total_subscription));
    highestRetail = Math.max(highestRetail, parseSub(live.retail_subscription));
    highestQib = Math.max(highestQib, parseSub(live.qib_subscription));
    highestNii = Math.max(highestNii, parseSub(live.nii_subscription));
  });

  document.getElementById("highestTotalSub").innerText = highestTotal ? `${highestTotal}x` : "-";
  document.getElementById("highestRetailSub").innerText = highestRetail ? `${highestRetail}x` : "-";
  document.getElementById("highestQibSub").innerText = highestQib ? `${highestQib}x` : "-";
  document.getElementById("highestNiiSub").innerText = highestNii ? `${highestNii}x` : "-";
}

function calculateIPOScore(ipo) {
  const live = getLive(ipo);

  const gmp = parseSub(live.gmp);
  const total = parseSub(live.total_subscription);
  const retail = parseSub(live.retail_subscription);
  const qib = parseSub(live.qib_subscription);
  const nii = parseSub(live.nii_subscription);

  let score = 0;

  score += Math.min(gmp, 100) * 0.30;
  score += Math.min(total * 10, 100) * 0.30;
  score += Math.min(retail * 10, 100) * 0.15;
  score += Math.min(qib * 10, 100) * 0.15;
  score += Math.min(nii * 10, 100) * 0.10;

  return Math.round(score);
}

function getScoreClass(score) {
  if (score >= 80) return "score-hot";
  if (score >= 50) return "score-mid";
  return "score-low";
}

function getSignal(score) {
  if (score >= 80) return "🔥 Hot IPO";
  if (score >= 50) return "🟡 Moderate";
  return "🔴 Weak";
}

function getSignalClass(score) {
  if (score >= 80) return "signal-pill signal-hot";
  if (score >= 50) return "signal-pill signal-mid";
  return "signal-pill signal-low";
}

function renderScoringAnalytics(data) {
  let topIPO = "-";
  let highestScore = 0;
  let hotCount = 0;
  let moderateCount = 0;

  data.forEach(ipo => {
    const score = calculateIPOScore(ipo);

    if (score > highestScore) {
      highestScore = score;
      topIPO = ipo.company_name || "-";
    }

    if (score >= 80) hotCount++;
    if (score >= 50 && score < 80) moderateCount++;
  });

  document.getElementById("topScoredIPO").innerText = topIPO;
  document.getElementById("highestScore").innerText = highestScore ? `${highestScore}/100` : "-";
  document.getElementById("hotIPOCount").innerText = hotCount;
  document.getElementById("moderateIPOCount").innerText = moderateCount;
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
  container.innerHTML = `<div class="widget-big-number">${count}</div>`;
}

function renderListingWidget(data) {
  const container = document.getElementById("listingWidget");
  if (!container) return;

  const today = new Date().toISOString().split("T")[0];
  const count = data.filter(x => x.listing_date === today).length;
  container.innerHTML = `<div class="widget-big-number">${count}</div>`;
}

function renderCalendarWidget(data) {
  const container = document.getElementById("calendarWidget");
  if (!container) return;

  container.innerHTML = data.slice(0, 5).map(ipo => `
    <div>
      <strong>${safe(ipo.company_name)}</strong><br>
      Open: ${safe(ipo.open_date)} | Close: ${safe(ipo.close_date)}
    </div>
  `).join("");
}

function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase().trim();
  const status = document.getElementById("statusFilter").value;
  const type = document.getElementById("typeFilter").value;

  const filtered = allIPOs.filter(ipo => {
    const name = (ipo.company_name || "").toLowerCase();
    const symbol = (ipo.symbol || "").toLowerCase();

    return (
      (name.includes(search) || symbol.includes(search)) &&
      (status === "" || getAutoStatus(ipo) === status) &&
      (type === "" || ipo.ipo_type === type)
    );
  });

  renderTable(filtered);
}

function quickFilter(status) {
  document.getElementById("statusFilter").value = status;
  applyFilters();
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("statusFilter").value = "";
  document.getElementById("typeFilter").value = "";
  renderTable(allIPOs);
}

function showSection(sectionName) {
  if (sectionName === "Dashboard") return resetFilters();
  if (sectionName === "Current IPOs") return quickFilter("Open");
  if (sectionName === "Upcoming IPOs") return quickFilter("Upcoming");
  if (sectionName === "Past IPOs") return quickFilter("Closed");
  if (sectionName === "GMP") return window.location.href = "gmp.html";
  if (sectionName === "News") return window.location.href = "news.html";
}

function badgeClass(status) {
  if (status === "Open") return "badge badge-open";
  if (status === "Closed") return "badge badge-closed";
  return "badge badge-upcoming";
}

function renderTable(data) {
  const tbody = document.getElementById("ipoTableBody");
  document.getElementById("recordCount").innerText = `${data.length} records`;

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="15">No IPO data found.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(ipo => {
    const live = getLive(ipo);
    const autoStatus = getAutoStatus(ipo);
    const score = calculateIPOScore(ipo);

    return `
      <tr>
        <td>
          <a class="company" href="ipo.html?id=${ipo.id}">${safe(ipo.company_name)}</a>
          <span class="sub">${safe(ipo.symbol)} · ${safe(ipo.exchange)}</span>
        </td>
        <td><span class="type">${safe(ipo.ipo_type)}</span></td>
        <td>${safe(ipo.price_band)}</td>
        <td>${safe(ipo.issue_size)}</td>
        <td>${safe(ipo.lot_size)}</td>
        <td>${live.gmp || "-"}</td>
        <td>${live.total_subscription || "-"}</td>
        <td>${safe(ipo.open_date)}</td>
        <td>${safe(ipo.close_date)}</td>
        <td>${safe(ipo.allotment_date)}</td>
        <td>${safe(ipo.listing_date)}</td>
        <td class="${getScoreClass(score)}">${score}/100</td>
        <td><span class="${getSignalClass(score)}">${getSignal(score)}</span></td>
        <td><span class="${badgeClass(autoStatus)}">${autoStatus}</span></td>
        <td class="actions">
          ${ipo.rhp_url ? `<a href="${ipo.rhp_url}" target="_blank">RHP</a>` : ""}
          ${ipo.registrar_url ? `<a class="blue" href="${ipo.registrar_url}" target="_blank">Allotment</a>` : ""}
        </td>
      </tr>
    `;
  }).join("");
}

function downloadCSV() {
  alert("CSV will be updated in next phase.");
}

document.addEventListener("DOMContentLoaded", fetchAllIPOs);
