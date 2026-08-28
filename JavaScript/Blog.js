document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("blog-status");
  const feedEl = document.getElementById("blog-feed");
  const layoutSection = document.querySelector(".blog-layout");
  const postView = document.getElementById("blog-post-view");
  const postContentEl = document.getElementById("blog-post-content");
  const backBtn = document.getElementById("back-to-list");
  const shareBtn = document.getElementById("share-post-btn");

  const POSTS_PER_PAGE = 5;
  let allPosts = [];
  let currentPage = 1;

  async function loadPosts() {
    const { data, error } = await supabaseClient
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      statusEl.textContent =
        "Couldn't load posts right now. Please try again shortly.";
      console.error(error);
      return;
    }

    allPosts = data;

    if (data.length === 0) {
      statusEl.textContent = "No posts yet — check back soon.";
      return;
    }

    statusEl.hidden = true;
    renderFeed();

    // If the URL has ?post=some-slug, open that post directly —
    // this is what makes a link shareable.
    const params = new URLSearchParams(window.location.search);
    const requestedSlug = params.get("post");
    if (requestedSlug) {
      const post = allPosts.find((p) => p.slug === requestedSlug);
      if (post) {
        showPost(post, { updateUrl: false });
      } else {
        statusEl.hidden = false;
        statusEl.textContent =
          "That post couldn't be found — showing all posts instead.";
      }
    }
  }

  function renderFeed() {
    const [featured, ...rest] = allPosts;

    const featuredHtml = `
      <article class="featured-post" data-slug="${featured.slug}">
        ${
          featured.image_url
            ? `<div class="featured-post-media"><img src="${featured.image_url}" alt="${escapeHtml(featured.title)}" loading="lazy" /></div>`
            : ""
        }
        <time class="blog-card-date">${formatDate(featured.created_at)}</time>
        <h2 class="featured-post-title">${escapeHtml(featured.title)}</h2>
        <p class="featured-post-excerpt">${excerpt(featured.content, 220)}</p>
        <span class="read-more-link">Read post →</span>
      </article>
    `;

    const totalPages = Math.max(1, Math.ceil(rest.length / POSTS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const pageItems = rest.slice(start, start + POSTS_PER_PAGE);

    const restHtml = rest.length
      ? `
        <h3 class="recent-heading">More Posts</h3>
        <div class="recent-list">
          ${pageItems
            .map(
              (post) => `
              <article class="recent-row" data-slug="${post.slug}">
                <time class="blog-card-date">${formatDate(post.created_at)}</time>
                <h4 class="recent-row-title">${escapeHtml(post.title)}</h4>
              </article>
            `,
            )
            .join("")}
        </div>
        ${totalPages > 1 ? renderPagination(totalPages) : ""}
      `
      : "";

    feedEl.innerHTML = featuredHtml + restHtml;

    feedEl.querySelectorAll("[data-slug]").forEach((el) => {
      el.addEventListener("click", () => {
        const slug = el.getAttribute("data-slug");
        const post = allPosts.find((p) => p.slug === slug);
        if (post) showPost(post);
      });
    });

    const pagEl = feedEl.querySelector(".pagination");
    if (pagEl) {
      pagEl.querySelectorAll("[data-page]").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentPage = parseInt(btn.getAttribute("data-page"), 10);
          renderFeed();
          feedEl.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }
  }

  function getPageList(current, total) {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = new Set([1, 2, 3, current - 1, current, current + 1, total]);
    const sorted = [...pages]
      .filter((p) => p >= 1 && p <= total)
      .sort((a, b) => a - b);

    const result = [];
    let prev = null;
    for (const p of sorted) {
      if (prev !== null && p - prev > 1) result.push("...");
      result.push(p);
      prev = p;
    }
    return result;
  }

  function renderPagination(totalPages) {
    const pageList = getPageList(currentPage, totalPages);

    const numberButtons = pageList
      .map((p) =>
        p === "..."
          ? `<span class="page-ellipsis">…</span>`
          : `<button class="page-btn${p === currentPage ? " active" : ""}" data-page="${p}">${p}</button>`,
      )
      .join("");

    const nextButton =
      currentPage < totalPages
        ? `<button class="page-btn page-next" data-page="${currentPage + 1}">Older posts →</button>`
        : "";

    return `<div class="pagination">${numberButtons}${nextButton}</div>`;
  }

  function showPost(post, { updateUrl = true } = {}) {
    postContentEl.innerHTML = `
      <time class="blog-post-date">${formatDate(post.created_at)}</time>
      <h1 class="blog-post-title">${escapeHtml(post.title)}</h1>
      ${
        post.image_url
          ? `<img class="blog-post-image" src="${post.image_url}" alt="${escapeHtml(post.title)}" />`
          : ""
      }
      <div class="blog-post-body">${formatContent(post.content)}</div>
    `;
    layoutSection.hidden = true;
    postView.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (updateUrl) {
      const newUrl = `${window.location.pathname}?post=${encodeURIComponent(post.slug)}`;
      history.pushState({ slug: post.slug }, "", newUrl);
    }

    shareBtn.onclick = () => copyShareLink(post.slug);
  }

  function copyShareLink(slug) {
    const url = `${window.location.origin}${window.location.pathname}?post=${encodeURIComponent(slug)}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        const original = shareBtn.textContent;
        shareBtn.textContent = "Link copied!";
        setTimeout(() => {
          shareBtn.textContent = original;
        }, 1800);
      })
      .catch(() => {
        prompt("Copy this link:", url);
      });
  }

  function backToList() {
    postView.hidden = true;
    layoutSection.hidden = false;
    history.pushState({}, "", window.location.pathname);
  }

  backBtn.addEventListener("click", backToList);

  // Handle browser back/forward buttons
  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("post");
    if (slug) {
      const post = allPosts.find((p) => p.slug === slug);
      if (post) {
        showPost(post, { updateUrl: false });
        return;
      }
    }
    postView.hidden = true;
    layoutSection.hidden = false;
  });

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-IE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function excerpt(text, length = 140) {
    const clean = text.replace(/\n+/g, " ").trim();
    return clean.length > length
      ? escapeHtml(clean.slice(0, length)) + "…"
      : escapeHtml(clean);
  }

  function formatContent(text) {
    // Simple paragraph-per-blank-line rendering. Content is stored as
    // plain text, so escape it, then turn blank-line breaks into <p> tags.
    return text
      .split(/\n\s*\n/)
      .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  loadPosts();
});
