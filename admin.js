const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpenBtam9ydHZpamR3eXlkdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTEwMTcsImV4cCI6MjA5Nzg2NzAxN30.41CO6OSasC1b6m6uoNzURgNQGymOciABNpr1-FVO-8w";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let editingId = null;
let editingNewsId = null;

async function loginAdmin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    alert(error.message);
    return;
  }

  showAdminPanels();
}

async function logoutAdmin() {
  await supabaseClient.auth.signOut();
  location.reload();
}

function showAdminPanels() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("adminBox").style.display = "grid";
  document.getElementById("liveBox").style.display = "grid";
  document.getElementById("newsBox").style.display = "grid";

  loadAdminIPOs();
  loadNewsAdmin();
}

async function saveIPO() {
  const ipoData = {
    company_name: document.getElementById("company_name").value.trim(),
    symbol: document.getElementById("symbol").value.trim(),
    ipo_type: document.getElementById("ipo_type").value.trim() || "Mainboard",
    exchange: document.getElementById("exchange").value.trim() || "NSE/BSE",
    price_band: document.getElementById("price_band").value.trim(),
    lot_size: Number(document.getElementById("lot_size").value) || null,
    issue_size: document.getElementById("issue_size").value.trim(),
    open_date: document.getElementById("open_date").value || null,
    close_date: document.getElementById("close_date").value || null,
    allotment_date: document.getElementById("allotment_date").value || null,
    refund_date: document.getElementById("refund_date").value || null,
    listing_date: document.getElementById("listing_date").value || null,
    status: document.getElementById("status").value,
    registrar: document.getElementById("registrar").value.trim(),
    rhp_url: document.getElementById("rhp_url").value.trim(),
    registrar_url: document.getElementById("registrar_url").value.trim(),
    remarks: document.getElementById("remarks").value.trim()
  };

  if (!ipoData.company_name) {
    alert("Company Name is required.");
    return;
  }

  const result = editingId
    ? await supabaseClient.from("ipos").update(ipoData).eq("id", editingId)
    : await supabaseClient.from("ipos").insert([ipoData]);

  if (result.error) {
    alert(result.error.message);
    return;
  }

  alert(editingId ? "IPO updated successfully" : "IPO added successfully");
  editingId = null;
  clearForm();
  loadAdminIPOs();
}

async function saveLiveUpdate() {
  const ipoId = document.getElementById("live_ipo_id").value;

  if (!ipoId) {
    alert("Select IPO first.");
    return;
  }

  const liveData = {
    ipo_id: Number(ipoId),
    gmp: document.getElementById("gmp").value.trim(),
    retail_subscription: document.getElementById("retail_subscription").value.trim(),
    qib_subscription: document.getElementById("qib_subscription").value.trim(),
    nii_subscription: document.getElementById("nii_subscription").value.trim(),
    total_subscription: document.getElementById("total_subscription").value.trim(),
    last_updated: new Date().toISOString()
  };

  const { data: existing } = await supabaseClient
    .from("ipo_live_updates")
    .select("id")
    .eq("ipo_id", Number(ipoId))
    .maybeSingle();

  const result = existing
    ? await supabaseClient.from("ipo_live_updates").update(liveData).eq("ipo_id", Number(ipoId))
    : await supabaseClient.from("ipo_live_updates").insert([liveData]);

  if (result.error) {
    alert(result.error.message);
    return;
  }

  alert("Live update saved successfully.");
  clearLiveForm();
  loadAdminIPOs();
}

async function loadAdminIPOs() {
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
    document.getElementById("adminTable").innerHTML =
      `<tr><td colspan="8">${error.message}</td></tr>`;
    return;
  }

  document.getElementById("adminCount").innerText = `${data.length} records`;
  populateLiveDropdown(data);

  document.getElementById("adminTable").innerHTML = data.map(ipo => {
    const live = ipo.ipo_live_updates && ipo.ipo_live_updates.length
      ? ipo.ipo_live_updates[0]
      : {};

    return `
      <tr>
        <td>${ipo.company_name || "-"}</td>
        <td>${ipo.symbol || "-"}</td>
        <td><span class="${badgeClass(ipo.status)}">${ipo.status || "-"}</span></td>
        <td>${ipo.open_date || "-"}</td>
        <td>${ipo.close_date || "-"}</td>
        <td>${live.gmp || "-"}</td>
        <td>${live.total_subscription || "-"}</td>
        <td class="actions">
          <a onclick="editIPO(${ipo.id})">Edit</a>
          <a onclick="loadLiveForEdit(${ipo.id})">Live</a>
          <a class="blue" onclick="deleteIPO(${ipo.id})">Delete</a>
        </td>
      </tr>
    `;
  }).join("");
}

function populateLiveDropdown(ipos) {
  const select = document.getElementById("live_ipo_id");

  select.innerHTML = `<option value="">Select IPO for Live Update</option>` +
    ipos.map(ipo => `
      <option value="${ipo.id}">${ipo.company_name || "-"} (${ipo.symbol || "-"})</option>
    `).join("");
}

async function loadLiveForEdit(ipoId) {
  document.getElementById("live_ipo_id").value = ipoId;

  const { data, error } = await supabaseClient
    .from("ipo_live_updates")
    .select("*")
    .eq("ipo_id", ipoId)
    .maybeSingle();

  if (error) {
    alert(error.message);
    return;
  }

  document.getElementById("gmp").value = data?.gmp || "";
  document.getElementById("retail_subscription").value = data?.retail_subscription || "";
  document.getElementById("qib_subscription").value = data?.qib_subscription || "";
  document.getElementById("nii_subscription").value = data?.nii_subscription || "";
  document.getElementById("total_subscription").value = data?.total_subscription || "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function editIPO(id) {
  const { data, error } = await supabaseClient.from("ipos").select("*").eq("id", id).single();

  if (error) {
    alert(error.message);
    return;
  }

  editingId = id;

  Object.keys(data).forEach(key => {
    const field = document.getElementById(key);
    if (field) field.value = data[key] || "";
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteIPO(id) {
  if (!confirm("Delete this IPO record?")) return;

  const { error } = await supabaseClient.from("ipos").delete().eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadAdminIPOs();
}

/* NEWS ADMIN */

async function saveNews() {
  const newsData = {
    title: document.getElementById("news_title").value.trim(),
    category: document.getElementById("news_category").value,
    news_date: document.getElementById("news_date").value || null,
    source: document.getElementById("news_source").value.trim(),
    link: document.getElementById("news_link").value.trim(),
    summary: document.getElementById("news_summary").value.trim(),
    is_active: document.getElementById("news_active").value === "true"
  };

  if (!newsData.title) {
    alert("News title is required.");
    return;
  }

  const result = editingNewsId
    ? await supabaseClient.from("ipo_news").update(newsData).eq("id", editingNewsId)
    : await supabaseClient.from("ipo_news").insert([newsData]);

  if (result.error) {
    alert(result.error.message);
    return;
  }

  alert(editingNewsId ? "News updated successfully" : "News added successfully");

  editingNewsId = null;
  clearNewsForm();
  loadNewsAdmin();
}

async function loadNewsAdmin() {
  const { data, error } = await supabaseClient
    .from("ipo_news")
    .select("*")
    .order("news_date", { ascending: false });

  if (error) {
    document.getElementById("newsAdminTable").innerHTML =
      `<tr><td colspan="6">${error.message}</td></tr>`;
    return;
  }

  document.getElementById("newsAdminCount").innerText = `${data.length} records`;

  document.getElementById("newsAdminTable").innerHTML = data.map(news => `
    <tr>
      <td>${news.title || "-"}</td>
      <td>${news.category || "-"}</td>
      <td>${news.news_date || "-"}</td>
      <td>${news.source || "-"}</td>
      <td>${news.is_active ? "Active" : "Inactive"}</td>
      <td class="actions">
        <a onclick="editNews(${news.id})">Edit</a>
        <a class="blue" onclick="deleteNews(${news.id})">Delete</a>
      </td>
    </tr>
  `).join("");
}

async function editNews(id) {
  const { data, error } = await supabaseClient
    .from("ipo_news")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  editingNewsId = id;

  document.getElementById("news_title").value = data.title || "";
  document.getElementById("news_category").value = data.category || "IPO";
  document.getElementById("news_date").value = data.news_date || "";
  document.getElementById("news_source").value = data.source || "";
  document.getElementById("news_link").value = data.link || "";
  document.getElementById("news_summary").value = data.summary || "";
  document.getElementById("news_active").value = data.is_active ? "true" : "false";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteNews(id) {
  if (!confirm("Delete this news record?")) return;

  const { error } = await supabaseClient.from("ipo_news").delete().eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadNewsAdmin();
}

/* CLEAR + SESSION */

function clearForm() {
  document.querySelectorAll("#adminBox input").forEach(input => input.value = "");
  document.getElementById("status").value = "Upcoming";
  editingId = null;
}

function clearLiveForm() {
  document.getElementById("live_ipo_id").value = "";
  document.getElementById("gmp").value = "";
  document.getElementById("retail_subscription").value = "";
  document.getElementById("qib_subscription").value = "";
  document.getElementById("nii_subscription").value = "";
  document.getElementById("total_subscription").value = "";
}

function clearNewsForm() {
  document.getElementById("news_title").value = "";
  document.getElementById("news_category").value = "IPO";
  document.getElementById("news_date").value = "";
  document.getElementById("news_source").value = "";
  document.getElementById("news_link").value = "";
  document.getElementById("news_summary").value = "";
  document.getElementById("news_active").value = "true";
  editingNewsId = null;
}

function badgeClass(status) {
  if (status === "Open") return "badge badge-open";
  if (status === "Closed") return "badge badge-closed";
  return "badge badge-upcoming";
}

document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    showAdminPanels();
  }
});
