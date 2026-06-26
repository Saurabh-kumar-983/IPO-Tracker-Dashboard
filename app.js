const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpenBtam9ydHZpamR3eXlkdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTEwMTcsImV4cCI6MjA5Nzg2NzAxN30.41CO6OSasC1b6m6uoNzURgNQGymOciABNpr1-FVO-8w";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allIPOs = [];

async function fetchAllIPOs() {
  const ipoList = document.getElementById("ipoList");
  ipoList.innerHTML = `<p class="empty">Loading IPO data...</p>`;

  const { data, error } = await supabaseClient
    .from("ipos")
    .select("*")
    .order("open_date", { ascending: true });

  if (error) {
    ipoList.innerHTML = `<p class="empty">Error loading IPO data: ${error.message}</p>`;
    return;
  }

  allIPOs = data || [];
  updateStats(allIPOs);
  renderIPOs(allIPOs);
}

function updateStats(data) {
  document.getElementById("totalCount").innerText = data.length;
  document.getElementById("upcomingCount").innerText = data.filter(ipo => ipo.status === "Upcoming").length;
  document.getElementById("openCount").innerText = data.filter(ipo => ipo.status === "Open").length;
  document.getElementById("closedCount").innerText = data.filter(ipo => ipo.status === "Closed").length;
}

function applyFilters() {
  const searchText = document.getElementById("searchInput").value.toLowerCase().trim();
  const selectedStatus = document.getElementById("statusFilter").value;

  const filteredIPOs = allIPOs.filter(ipo => {
    const companyName = (ipo.company_name || "").toLowerCase();
    const symbol = (ipo.symbol || "").toLowerCase();

    const matchesSearch = companyName.includes(searchText) || symbol.includes(searchText);
    const matchesStatus = selectedStatus === "" || ipo.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  renderIPOs(filteredIPOs);
}

function getBadgeClass(status) {
  if (status === "Open") return "badge badge-open";
  if (status === "Closed") return "badge badge-closed";
  return "badge badge-upcoming";
}

function getSafeValue(value) {
  return value || "-";
}

function renderIPOs(data) {
  const ipoList = document.getElementById("ipoList");

  if (!data || data.length === 0) {
    ipoList.innerHTML = `<p class="empty">No IPO data found.</p>`;
    return;
  }

  ipoList.innerHTML = data.map(ipo => `
    <div class="card premium-card">
      <div class="card-top">
        <div>
          <span class="${getBadgeClass(ipo.status)}">${getSafeValue(ipo.status)}</span>
          <h2>${getSafeValue(ipo.company_name)}</h2>
          <div class="symbol">
            ${getSafeValue(ipo.symbol)} · ${getSafeValue(ipo.exchange)} · ${getSafeValue(ipo.ipo_type)}
          </div>
        </div>
      </div>

      <div class="highlight-row">
        <div><span>Price Band</span><strong>${getSafeValue(ipo.price_band)}</strong></div>
        <div><span>Lot Size</span><strong>${getSafeValue(ipo.lot_size)}</strong></div>
        <div><span>Issue Size</span><strong>${getSafeValue(ipo.issue_size)}</strong></div>
      </div>

      <div class="timeline">
        <div><b>Open</b><span>${getSafeValue(ipo.open_date)}</span></div>
        <div><b>Close</b><span>${getSafeValue(ipo.close_date)}</span></div>
        <div><b>Allotment</b><span>${getSafeValue(ipo.allotment_date)}</span></div>
        <div><b>Listing</b><span>${getSafeValue(ipo.listing_date)}</span></div>
      </div>

      <div class="ipo-meta">
        <p><b>Registrar:</b> ${getSafeValue(ipo.registrar)}</p>
        <p><b>Refund Date:</b> ${getSafeValue(ipo.refund_date)}</p>
        <p><b>Remarks:</b> ${ipo.remarks || "Important IPO details will be updated here."}</p>
      </div>

      <div class="links">
        ${ipo.rhp_url ? `<a class="secondary" href="${ipo.rhp_url}" target="_blank">View RHP</a>` : ""}
        ${ipo.registrar_url ? `<a href="${ipo.registrar_url}" target="_blank">Check Allotment</a>` : ""}
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", fetchAllIPOs);
