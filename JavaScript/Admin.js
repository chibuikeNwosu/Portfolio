document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section");
  const editorSection = document.getElementById("editor-section");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const postForm = document.getElementById("post-form");
  const postStatus = document.getElementById("post-status");
  const logoutBtn = document.getElementById("logout-btn");
  const myPostsList = document.getElementById("my-posts-list");

  // Check if already logged in (e.g. page refresh)
  checkSession();

  async function checkSession() {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
      showEditor();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    loginSection.hidden = false;
    editorSection.hidden = true;
  }

  function showEditor() {
    loginSection.hidden = true;
    editorSection.hidden = false;
    loadMyPosts();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.hidden = true;

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      loginError.textContent = "Login failed: " + error.message;
      loginError.hidden = false;
      return;
    }

    showEditor();
  });

  logoutBtn.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    showLogin();
  });

  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    postStatus.hidden = true;

    const title = document.getElementById("title").value.trim();
    const imageUrl = document.getElementById("image_url").value.trim();
    const content = document.getElementById("content").value.trim();
    const slug = slugify(title);

    const { error } = await supabaseClient.from("posts").insert({
      title,
      slug,
      content,
      image_url: imageUrl || null,
    });

    if (error) {
      postStatus.textContent = "Couldn't publish: " + error.message;
      postStatus.style.color = "#b00020";
      postStatus.hidden = false;
      return;
    }

    postStatus.textContent = "Published!";
    postStatus.style.color = "#1a7a1a";
    postStatus.hidden = false;
    postForm.reset();
    loadMyPosts();
  });

  async function loadMyPosts() {
    const { data, error } = await supabaseClient
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      myPostsList.innerHTML = `<p class="admin-error">Couldn't load posts.</p>`;
      return;
    }

    if (data.length === 0) {
      myPostsList.innerHTML = `<p>No posts yet.</p>`;
      return;
    }

    myPostsList.innerHTML = data
      .map(
        (post) => `
        <div class="admin-post-row" data-id="${post.id}">
          <span>${escapeHtml(post.title)}</span>
          <button class="admin-delete-btn" data-id="${post.id}">Delete</button>
        </div>
      `,
      )
      .join("");

    myPostsList.querySelectorAll(".admin-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this post permanently?")) return;
        const id = btn.getAttribute("data-id");
        await supabaseClient.from("posts").delete().eq("id", id);
        loadMyPosts();
      });
    });
  }

  function slugify(text) {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    // Add a short random suffix so duplicate titles don't collide
    const suffix = Math.random().toString(36).slice(2, 7);
    return `${base}-${suffix}`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
