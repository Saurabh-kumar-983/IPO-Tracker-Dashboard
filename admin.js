const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpenBtam9ydHZpamR3eXlkdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTEwMTcsImV4cCI6MjA5Nzg2NzAxN30.41CO6OSasC1b6m6uoNzURgNQGymOciABNpr1-FVO-8w";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let editingId = null;

async function loginAdmin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("adminBox").style.display = "grid";
  loadAdminIPOs();
}

async function logoutAdmin() {
  await supabaseClient.auth.signOut();
  location.reload();
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

  let result;

  if (editingId) {
    result = await supabaseClient
      .from("ipos")
      .update(ipoData)
      .eq("id", editingId);
  } else {
    result = await supabaseClient
      .from("ipos")
      .insert([ipoData]);
  }

  if (result.error) {
    alert(result.error.message);
    return;
  }

  alert(editingId ? "IPO updated successfully" : "IPO added successfully");

  editingId = null;
  clearForm();
  loadAdminIPOs();
}

async function loadAdminIPOs() {
  const { data, error } = await supabaseClient
    .from("ipos")
    .select("*")
    .order("open_date", { ascending: true });

  if (error) {
    document.getElementById("adminTable").innerHTML =
      `<tr><td colspan="6">${error.message}</td></tr>`;
    return;
  }

  document.getElementById("adminCount").innerText = `${data.length} records`;

  document.getElementById("adminTable").innerHTML = data.map(ipo => `
    <tr>
      <td>${ipo.company_name || "-"}</td>
      <td>${ipo.symbol || "-"}</td>
      <td>${ipo.status || "-"}</td>
      <td>${ipo.open_date || "-"}</td>
      <td>${ipo.close_date || "-"}</td>
      <td class="actions">
        <a onclick="editIPO(${ipo.id})">Edit</a>
        <a class="blue" onclick="deleteIPO(${ipo.id})">Delete</a>
      </td>
    </tr>
  `).join("");
}

async function editIPO(id) {
  const { data, error } = await supabaseClient
    .from("ipos")
    .select("*")
    .eq("id", id)
    .single();

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

  const { error } = await supabaseClient
    .from("ipos")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadAdminIPOs();
}

function clearForm() {
  document.querySelectorAll("#adminBox input").forEach(input => input.value = "");
  document.getElementById("status").value = "Upcoming";
}

document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminBox").style.display = "grid";
    loadAdminIPOs();
  }
});
