const SUPABASE_URL = "https://iizpmjortvijdwyydtec.supabase.co";

const SUPABASE_KEY = "YOUR_ANON_KEY";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let newsData = [];

async function loadNews() {
  const newsList = document.getElementById("newsList");
  newsList.innerHTML = "Loading news...";

  const { data, error } = await supabaseClient
    .from("ipo_news")
    .select("*")
    .eq("is_active", true)
    .order("news_date", { ascending: false });

  if (error) {
    newsList.innerHTML = `<p>${error.message}</p>`;
    return;
  }

  newsData = data || [];
  renderNews(newsData);
}

function renderNews(data) {
  const newsList = document.getElementById("newsList");
  document.getElementById("newsCount").innerText = `${data.length} records`;

  if (!data.length) {
    newsList.innerHTML = `<p>No news found.</p>`;
    return;
  }

  newsList.innerHTML = data.map(item => `
    <div class="news-card">
      <div class="news-top">
        <span class="news-tag">${item.category || "IPO"}</span>
        <small>${item.news_date || "-"}</small>
      </div>

      <h3>${item.title || "-"}</h3>
      <p>${item.summary || "No summary available."}</p>

      <div class="news-bottom">
        <span>${item.source || "IPO Tracker"}</span>
        ${item.link ? `<a href="${item.link}">Read More</a>` : ""}
      </div>
    </div>
  `).join("");
}

function filterNews(category) {
  if (!category) {
    renderNews(newsData);
    return;
  }

  renderNews(newsData.filter(item => item.category === category));
}

document.addEventListener("DOMContentLoaded", loadNews);
