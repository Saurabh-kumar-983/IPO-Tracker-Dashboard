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
  document.getElementById("upcomingCount").innerText =
    data.filter(ipo => ipo.status === "Upcoming").length;
  document.getElementById("openCount").innerText =
    data.filter(ipo => ipo.status === "Open").length;
  document.getElementById("closedCount").innerText =
    data.filter(ipo => ipo.status === "Closed").length;
}

function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");

  const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedStatus = statusFilter ? statusFilter.value : "";

  const filteredIPOs = allIPOs.filter(ipo => {
    const companyName = (ipo.company_name || "").toLowerCase();
    const symbol = (ipo.symbol || "").toLowerCase();

    const matchesSearch =
      companyName.includes(searchText) || symbol.includes(searchText);

    const matchesStatus =
      selectedStatus === "" || ipo.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  renderIPOs(filteredIPOs);
}

function loadIPOs(status = null) {
  const statusFilter = document.getElementById("statusFilter");

  if (statusFilter) {
    statusFilter.value = status || "";
  }

  applyFilters();
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
    <div class="card">
      <div class="card-top">
        <div>
          <h2>${getSafeValue(ipo.company_name)}</h2>
          <div class="symbol">
            ${getSafeValue(ipo.symbol)} · ${getSafeValue(ipo.exchange)}
          </div>
        </div>
        <span class="${getBadgeClass(ipo.status)}">${getSafeValue(ipo.status)}</span>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <b>IPO Type</b>
          ${getSafeValue(ipo.ipo_type)}
        </div>

        <div class="info-box">
          <b>Price Band</b>
          ${getSafeValue(ipo.price_band)}
        </div>

        <div class="info-box">
          <b>Lot Size</b>
          ${getSafeValue(ipo.lot_size)}
        </div>

        <div class="info-box">
          <b>Issue Size</b>
          ${getSafeValue(ipo.issue_size)}
        </div>

        <div class="info-box">
          <b>Open Date</b>
          ${getSafeValue(ipo.open_date)}
        </div>

        <div class="info-box">
          <b>Close Date</b>
          ${getSafeValue(ipo.close_date)}
        </div>

        <div class="info-box">
          <b>Registrar</b>
          ${getSafeValue(ipo.registrar)}
        </div>

        <div class="info-box">
          <b>Listing Date</b>
          ${getSafeValue(ipo.listing_date)}
        </div>
      </div>

      <div class="dates">
        <b>Important Dates:</b><br>
        Allotment: ${getSafeValue(ipo.allotment_date)} |
        Refund: ${getSafeValue(ipo.refund_date)} |
        Listing: ${getSafeValue(ipo.listing_date)}
      </div>

      <p><b>Remarks:</b> ${ipo.remarks || "No remarks added."}</p>

      <div class="links">
        ${
          ipo.rhp_url
            ? `<a class="secondary" href="${ipo.rhp_url}" target="_blank">View RHP</a>`
            : ""
        }

        ${
          ipo.registrar_url
            ? `<a href="${ipo.registrar_url}" target="_blank">Check Allotment</a>`
            : ""
        }
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", fetchAllIPOs);
