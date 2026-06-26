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
  renderTable(allIPOs);
}

function updateStats(data) {
  document.getElementById("totalCount").innerText = data.length;
  document.getElementById("upcomingCount").innerText =
    data.filter(x => x.status === "Upcoming").length;
  document.getElementById("openCount").innerText =
    data.filter(x => x.status === "Open").length;
  document.getElementById("closedCount").innerText =
    data.filter(x => x.status === "Closed").length;
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
      (status === "" || ipo.status === status) &&
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
  if (sectionName === "Dashboard") {
    resetFilters();
    return;
  }

  if (sectionName === "Current IPOs") {
    quickFilter("Open");
    return;
  }

  if (sectionName === "Upcoming IPOs") {
    quickFilter("Upcoming");
    return;
  }

  if (sectionName === "Past IPOs") {
    quickFilter("Closed");
    return;
  }

  alert(sectionName + " section coming soon.");
}

function badgeClass(status) {
  if (status === "Open") return "badge badge-open";
  if (status === "Closed") return "badge badge-closed";
  return "badge badge-upcoming";
}

function safe(v) {
  return v || "-";
}

function getLive(ipo) {
  return ipo.ipo_live_updates && ipo.ipo_live_updates.length
    ? ipo.ipo_live_updates[0]
    : {};
}

function renderTable(data) {
  const tbody = document.getElementById("ipoTableBody");
  document.getElementById("recordCount").innerText = `${data.length} records`;

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="13">No IPO data found.</td></tr>`;
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
        <td><span class="${badgeClass(ipo.status)}">${safe(ipo.status)}</span></td>
        <td class="actions">
          ${ipo.rhp_url ? `<a href="${ipo.rhp_url}" target="_blank">RHP</a>` : ""}
          ${ipo.registrar_url ? `<a class="blue" href="${ipo.registrar_url}" target="_blank">Allotment</a>` : ""}
        </td>
      </tr>
    `;
  }).join("");
}

function downloadCSV() {
  const rows = [
    ["Company", "Symbol", "Type", "Price Band", "Issue Size", "Lot Size", "GMP", "Total Subscription", "Open", "Close", "Allotment", "Listing", "Status"],
    ...allIPOs.map(ipo => {
      const live = getLive(ipo);

      return [
        safe(ipo.company_name),
        safe(ipo.symbol),
        safe(ipo.ipo_type),
        safe(ipo.price_band),
        safe(ipo.issue_size),
        safe(ipo.lot_size),
        live.gmp || "-",
        live.total_subscription || "-",
        safe(ipo.open_date),
        safe(ipo.close_date),
        safe(ipo.allotment_date),
        safe(ipo.listing_date),
        safe(ipo.status)
      ];
    })
  ];

  const csv = rows.map(row =>
    row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ipo-tracker.csv";
  a.click();

  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", fetchAllIPOs);
