const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpenBtam9ydHZpamR3eXlkdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTEwMTcsImV4cCI6MjA5Nzg2NzAxN30.41CO6OSasC1b6m6uoNzURgNQGymOciABNpr1-FVO-8w";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let ipoList = [];

async function loadIPOsForAllotment() {
  const select = document.getElementById("ipoSelect");

  const { data, error } = await supabaseClient
    .from("ipos")
    .select("*")
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

function safe(value) {
  return value || "-";
}

function validatePAN(pan) {
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(pan);
}

function getSelectedIPO() {
  const id = document.getElementById("ipoSelect").value;
  if (!id) return null;

  return ipoList.find(ipo => String(ipo.id) === String(id));
}

function showIPOInfo() {
  const ipo = getSelectedIPO();
  const infoBox = document.getElementById("ipoInfoBox");
  const guideBox = document.getElementById("registrarGuideBox");

  if (!ipo) {
    infoBox.innerHTML = "Select IPO to view registrar details.";
    guideBox.innerHTML = "Select IPO to view registrar-specific instructions.";
    return;
  }

  infoBox.innerHTML = `
    <h3>${safe(ipo.company_name)}</h3>
    <p><b>Symbol:</b> ${safe(ipo.symbol)}</p>
    <p><b>Registrar:</b> ${safe(ipo.registrar)}</p>
    <p><b>Open Date:</b> ${safe(ipo.open_date)}</p>
    <p><b>Close Date:</b> ${safe(ipo.close_date)}</p>
    <p><b>Allotment Date:</b> ${safe(ipo.allotment_date)}</p>
    <p><b>Listing Date:</b> ${safe(ipo.listing_date)}</p>
    <p><b>Registrar Link:</b> ${ipo.registrar_url ? "Available" : "Not Available"}</p>
  `;

  guideBox.innerHTML = getRegistrarGuide(ipo.registrar);
}

function getRegistrarGuide(registrarName) {
  const registrar = String(registrarName || "").toLowerCase();

  if (registrar.includes("link") || registrar.includes("intime") || registrar.includes("mufg")) {
    return `
      <h3>Link Intime / MUFG Intime Guide</h3>
      <ol class="guide-list">
        <li>Open the official registrar allotment page.</li>
        <li>Select the IPO name from the dropdown.</li>
        <li>Choose PAN, Application Number, or DP/Client ID option.</li>
        <li>Enter the required details carefully.</li>
        <li>Submit and verify allotment status.</li>
      </ol>
    `;
  }

  if (registrar.includes("kfin") || registrar.includes("kfintech") || registrar.includes("karvy")) {
    return `
      <h3>KFintech Guide</h3>
      <ol class="guide-list">
        <li>Open the KFintech IPO allotment status page.</li>
        <li>Select the IPO from the issue dropdown.</li>
        <li>Enter PAN, Application Number, or Demat details.</li>
        <li>Complete any security/captcha step if shown.</li>
        <li>Submit and check final allotment status.</li>
      </ol>
    `;
  }

  if (registrar.includes("bigshare")) {
    return `
      <h3>Bigshare Services Guide</h3>
      <ol class="guide-list">
        <li>Open Bigshare IPO allotment page.</li>
        <li>Select company/IPO name.</li>
        <li>Enter PAN, Application Number, or Beneficiary ID.</li>
        <li>Submit the form after verification.</li>
        <li>Check allotment status on the official result page.</li>
      </ol>
    `;
  }

  if (registrar.includes("skyline")) {
    return `
      <h3>Skyline Financial Services Guide</h3>
      <ol class="guide-list">
        <li>Open the official registrar page.</li>
        <li>Select the IPO/company name.</li>
        <li>Enter PAN or application details.</li>
        <li>Submit after verifying the entered information.</li>
        <li>Check the allotment result carefully.</li>
      </ol>
    `;
  }

  return `
    <h3>General Registrar Guide</h3>
    <ol class="guide-list">
      <li>Open the official registrar allotment link.</li>
      <li>Select the IPO/company name.</li>
      <li>Enter PAN, Application Number, or Demat details.</li>
      <li>Submit the form on the registrar website.</li>
      <li>Verify allotment status only from official sources.</li>
    </ol>
  `;
}

function checkAllotment() {
  const ipo = getSelectedIPO();
  const pan = document.getElementById("panNumber").value.trim().toUpperCase();
  const applicationNo = document.getElementById("applicationNumber").value.trim();

  if (!ipo) {
    alert("Please select an IPO.");
    return;
  }

  if (!pan && !applicationNo) {
    alert("Please enter PAN Number or Application Number.");
    return;
  }

  if (pan && !validatePAN(pan)) {
    alert("Invalid PAN format. Example: ABCDE1234F");
    return;
  }

  if (!ipo.registrar_url) {
    alert("Registrar URL is not available for this IPO.");
    return;
  }

  alert(`Redirecting to ${ipo.registrar || "registrar"} official page.`);
  window.open(ipo.registrar_url, "_blank");
}

document.addEventListener("DOMContentLoaded", loadIPOsForAllotment);
