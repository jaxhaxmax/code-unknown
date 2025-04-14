// Enhanced script.js with loading states and animations
function fetchNews() {
    const query = document.getElementById("searchInput").value || "environment";
    const spinner = document.getElementById("loadingSpinner");
    const container = document.getElementById("newsContainer");
    
    // Show loading spinner
    spinner.style.display = "block";
    container.innerHTML = "";
    
    // Add slight delay to show spinner (UX improvement)
    setTimeout(() => {
      fetch(`/get-news?q=${encodeURIComponent(query)}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          spinner.style.display = "none";
          
          if (data.error) {
            showError(data.error, data.details);
            return;
          }
          
          if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
          } else {
            showNoResults();
          }
        })
        .catch(err => {
          spinner.style.display = "none";
          showError("Failed to fetch news", err.message);
        });
    }, 300);
  }
  
  function displayNews(articles) {
    const container = document.getElementById("newsContainer");
    container.innerHTML = "";
    
    articles.forEach((article, index) => {
      const card = document.createElement("div");
      card.className = "news-card";
      
      // Format date if available
      const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "";
      
      card.innerHTML = `
        ${article.urlToImage ? `
          <div class="card-img-container">
            <img src="${article.urlToImage}" alt="${article.title}" class="card-img" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
          </div>
        ` : ''}
        <div class="card-content">
          <h3>${article.title}</h3>
          ${date ? `<div class="card-source"><i class="far fa-calendar-alt"></i> ${date}</div>` : ''}
          <p>${article.description || "No description available"}</p>
          <a href="${article.url}" target="_blank" class="read-more">
            Read more <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      `;
      
      // Add slight delay for staggered animation
      card.style.animationDelay = `${index * 0.1}s`;
      container.appendChild(card);
    });
  }
  
  function showError(error, details) {
    const container = document.getElementById("newsContainer");
    container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>${error}</h3>
        ${details ? `<p>${details}</p>` : ''}
        <button onclick="fetchNews()" class="retry-btn">
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    `;
  }
  
  function showNoResults() {
    const container = document.getElementById("newsContainer");
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>No articles found</h3>
        <p>Try a different search term</p>
      </div>
    `;
  }
  
  function searchTopic(topic) {
    document.getElementById("searchInput").value = topic;
    fetchNews();
  }
  
  // Add animation to cards when they come into view
  function observeCards() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.news-card').forEach(card => {
      observer.observe(card);
    });
  }
  
  window.onload = function() {
    fetchNews();
    
    // Add event listener for Enter key in search
    document.getElementById("searchInput").addEventListener('keypress', (e) => {
      if (e.key === 'Enter') fetchNews();
    });
  };