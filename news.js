const newsData = [
  {
    title: "Demo Industries IPO GMP updated to ₹45",
    category: "GMP",
    date: "2026-07-01",
    summary: "Demo Industries Ltd is showing a grey market premium of ₹45 with estimated listing gain around 40.9%.",
    source: "Internal Update",
    link: "gmp.html"
  },
  {
    title: "Demo Industries IPO allotment expected on 06 July 2026",
    category: "Allotment",
    date: "2026-07-01",
    summary: "Investors can check allotment status through the official registrar link after basis of allotment is finalized.",
    source: "Registrar Update",
    link: "index.html"
  },
  {
    title: "Demo Industries IPO listing scheduled for 09 July 2026",
    category: "Listing",
    date: "2026-07-01",
    summary: "Listing date is currently scheduled for 09 July 2026 as per IPO timeline.",
    source: "IPO Timeline",
    link: "index.html"
  }
];

let activeCategory = "";

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
        <span class="news-tag">${item.category}</span>
        <small>${item.date}</small>
      </div>

      <h3>${item.title}</h3>
      <p>${item.summary}</p>

      <div class="news-bottom">
        <span>${item.source}</span>
        <a href="${item.link}">Read More</a>
      </div>
    </div>
  `).join("");
}

function filterNews(category) {
  activeCategory = category;

  if (!category) {
    renderNews(newsData);
    return;
  }

  const filtered = newsData.filter(item => item.category === category);
  renderNews(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  renderNews(newsData);
});
