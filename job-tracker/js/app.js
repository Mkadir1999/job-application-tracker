const STATUSES = ["Saved", "Applied", "Interview", "Rejected", "Offer"];

const state = {
  applications: [],
  selectedId: null,
  filterStatus: null,
  isNew: false,
  draftKeywords: [],
  draftQA: [],
};

const els = {
  statusSummary: document.getElementById("status-summary"),
  applicationList: document.getElementById("application-list"),
  listCount: document.getElementById("list-count"),
  detailPanel: document.getElementById("detail-panel"),
  detailEmpty: document.getElementById("detail-empty"),
  detailForm: document.getElementById("detail-form"),
  formTitle: document.getElementById("form-title"),
  jobTitle: document.getElementById("job-title"),
  company: document.getElementById("company"),
  location: document.getElementById("location"),
  salary: document.getElementById("salary"),
  jobLink: document.getElementById("job-link"),
  dateApplied: document.getElementById("date-applied"),
  status: document.getElementById("status"),
  notes: document.getElementById("notes"),
  interviewQAList: document.getElementById("interview-qa-list"),
  keywordInput: document.getElementById("keyword-input"),
  keywordTags: document.getElementById("keyword-tags"),
  btnDelete: document.getElementById("btn-delete"),
  btnAdd: document.getElementById("btn-add"),
  btnAddEmpty: document.getElementById("btn-add-empty"),
  btnCancel: document.getElementById("btn-cancel"),
  btnCloseDetail: document.getElementById("btn-close-detail"),
  btnAddQA: document.getElementById("btn-add-qa"),
  btnAddKeyword: document.getElementById("btn-add-keyword"),
  btnExport: document.getElementById("btn-export"),
  importFile: document.getElementById("import-file"),
  main: document.querySelector(".main"),
};

function generateId() {
  return crypto.randomUUID();
}

function statusClass(status) {
  return `badge--${status.toLowerCase()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function sortApplications(apps) {
  return [...apps].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function getFilteredApplications() {
  const sorted = sortApplications(state.applications);
  if (!state.filterStatus) return sorted;
  return sorted.filter((app) => app.status === state.filterStatus);
}

function getApplication(id) {
  return state.applications.find((app) => app.id === id);
}

function createEmptyApplication() {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    jobTitle: "",
    company: "",
    location: "",
    salary: "",
    jobLink: "",
    dateApplied: "",
    status: "Saved",
    notes: "",
    interviewQA: [],
    resumeKeywords: [],
    createdAt: now,
    updatedAt: now,
  };
}

function createApplication(data) {
  const app = { ...createEmptyApplication(), ...data, id: generateId() };
  app.createdAt = new Date().toISOString();
  app.updatedAt = app.createdAt;
  state.applications.push(app);
  saveApplications(state.applications);
  return app;
}

function updateApplication(id, data) {
  const index = state.applications.findIndex((app) => app.id === id);
  if (index === -1) return null;
  state.applications[index] = {
    ...state.applications[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  saveApplications(state.applications);
  return state.applications[index];
}

function deleteApplication(id) {
  state.applications = state.applications.filter((app) => app.id !== id);
  saveApplications(state.applications);
}

function renderStatusCounts() {
  const counts = { All: state.applications.length };
  STATUSES.forEach((s) => {
    counts[s] = state.applications.filter((app) => app.status === s).length;
  });

  els.statusSummary.innerHTML = "";

  const allChip = document.createElement("button");
  allChip.type = "button";
  allChip.className = `status-chip status-chip--all${state.filterStatus === null ? " active" : ""}`;
  allChip.innerHTML = `<span>All</span><span class="status-chip__count">${counts.All}</span>`;
  allChip.addEventListener("click", () => {
    state.filterStatus = null;
    render();
  });
  els.statusSummary.appendChild(allChip);

  STATUSES.forEach((status) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `status-chip${state.filterStatus === status ? " active" : ""}`;
    chip.innerHTML = `<span class="badge badge--${status.toLowerCase()}">${status}</span><span class="status-chip__count">${counts[status]}</span>`;
    chip.addEventListener("click", () => {
      state.filterStatus = state.filterStatus === status ? null : status;
      render();
    });
    els.statusSummary.appendChild(chip);
  });
}

function renderList() {
  const filtered = getFilteredApplications();
  els.listCount.textContent = `${filtered.length} shown`;

  if (filtered.length === 0) {
    els.applicationList.innerHTML = `
      <div class="list-empty">
        <p>${state.applications.length === 0 ? "No applications yet. Add your first IT job application!" : "No applications match this filter."}</p>
        ${state.applications.length === 0 ? '<button type="button" class="btn btn--primary" id="btn-add-inline">Add Application</button>' : ""}
      </div>
    `;
    const inlineBtn = document.getElementById("btn-add-inline");
    if (inlineBtn) inlineBtn.addEventListener("click", openNewForm);
    return;
  }

  els.applicationList.innerHTML = filtered
    .map(
      (app) => `
      <article class="app-card${app.id === state.selectedId ? " active" : ""}" data-id="${app.id}" tabindex="0" role="button" aria-label="${escapeHtml(app.jobTitle)} at ${escapeHtml(app.company)}">
        <h3 class="app-card__title">${escapeHtml(app.jobTitle)}</h3>
        <p class="app-card__company">${escapeHtml(app.company)}</p>
        <div class="app-card__meta">
          <span class="badge ${statusClass(app.status)}">${app.status}</span>
          ${app.location ? `<span>${escapeHtml(app.location)}</span>` : ""}
          ${app.dateApplied ? `<span>${formatDate(app.dateApplied)}</span>` : ""}
        </div>
      </article>
    `
    )
    .join("");

  els.applicationList.querySelectorAll(".app-card").forEach((card) => {
    card.addEventListener("click", () => openEditForm(card.dataset.id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openEditForm(card.dataset.id);
      }
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderInterviewQA() {
  if (state.draftQA.length === 0) {
    els.interviewQAList.innerHTML = '<p class="qa-empty">No interview questions yet. Add one to start preparing.</p>';
    return;
  }

  els.interviewQAList.innerHTML = state.draftQA
    .map(
      (qa, index) => `
      <div class="qa-item" data-index="${index}">
        <div class="qa-item__header">
          <button type="button" class="btn btn--secondary btn--small btn-remove-qa" data-index="${index}">Remove</button>
        </div>
        <label for="qa-q-${index}">Question</label>
        <input type="text" id="qa-q-${index}" class="qa-question" data-index="${index}" value="${escapeHtml(qa.question)}" placeholder="e.g. Tell me about your troubleshooting process">
        <label for="qa-a-${index}">Answer</label>
        <textarea id="qa-a-${index}" class="qa-answer" data-index="${index}" placeholder="Your prepared answer">${escapeHtml(qa.answer)}</textarea>
      </div>
    `
    )
    .join("");

  els.interviewQAList.querySelectorAll(".qa-question").forEach((input) => {
    input.addEventListener("input", (e) => {
      state.draftQA[Number(e.target.dataset.index)].question = e.target.value;
    });
  });

  els.interviewQAList.querySelectorAll(".qa-answer").forEach((textarea) => {
    textarea.addEventListener("input", (e) => {
      state.draftQA[Number(e.target.dataset.index)].answer = e.target.value;
    });
  });

  els.interviewQAList.querySelectorAll(".btn-remove-qa").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.draftQA.splice(Number(btn.dataset.index), 1);
      renderInterviewQA();
    });
  });
}

function renderKeywords() {
  if (state.draftKeywords.length === 0) {
    els.keywordTags.innerHTML = '<p class="keywords-empty">Add keywords from the job posting to tailor your resume.</p>';
    return;
  }

  els.keywordTags.innerHTML = state.draftKeywords
    .map(
      (keyword, index) => `
      <span class="keyword-tag">
        ${escapeHtml(keyword)}
        <button type="button" class="btn-remove-keyword" data-index="${index}" aria-label="Remove ${escapeHtml(keyword)}">&times;</button>
      </span>
    `
    )
    .join("");

  els.keywordTags.querySelectorAll(".btn-remove-keyword").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.draftKeywords.splice(Number(btn.dataset.index), 1);
      renderKeywords();
    });
  });
}

function showDetailPanel() {
  els.detailEmpty.classList.add("hidden");
  els.detailForm.classList.remove("hidden");
  els.detailPanel.classList.add("open");
  els.main.classList.add("detail-open");
}

function hideDetailPanel() {
  els.detailEmpty.classList.remove("hidden");
  els.detailForm.classList.add("hidden");
  els.detailPanel.classList.remove("open");
  els.main.classList.remove("detail-open");
  state.selectedId = null;
  state.isNew = false;
}

function openNewForm() {
  state.selectedId = null;
  state.isNew = true;
  state.draftQA = [];
  state.draftKeywords = [];

  els.formTitle.textContent = "New Application";
  els.detailForm.reset();
  els.status.value = "Saved";
  els.btnDelete.classList.add("hidden");

  renderInterviewQA();
  renderKeywords();
  showDetailPanel();
  els.jobTitle.focus();
}

function openEditForm(id) {
  const app = getApplication(id);
  if (!app) return;

  state.selectedId = id;
  state.isNew = false;
  state.draftQA = app.interviewQA.map((qa) => ({ ...qa }));
  state.draftKeywords = [...app.resumeKeywords];

  els.formTitle.textContent = "Edit Application";
  els.jobTitle.value = app.jobTitle;
  els.company.value = app.company;
  els.location.value = app.location;
  els.salary.value = app.salary;
  els.jobLink.value = app.jobLink;
  els.dateApplied.value = app.dateApplied;
  els.status.value = app.status;
  els.notes.value = app.notes;
  els.btnDelete.classList.remove("hidden");

  renderInterviewQA();
  renderKeywords();
  showDetailPanel();
  renderList();
}

function collectFormData() {
  return {
    jobTitle: els.jobTitle.value.trim(),
    company: els.company.value.trim(),
    location: els.location.value.trim(),
    salary: els.salary.value.trim(),
    jobLink: els.jobLink.value.trim(),
    dateApplied: els.dateApplied.value,
    status: els.status.value,
    notes: els.notes.value.trim(),
    interviewQA: state.draftQA.map((qa) => ({
      id: qa.id || generateId(),
      question: qa.question.trim(),
      answer: qa.answer.trim(),
    })),
    resumeKeywords: [...state.draftKeywords],
  };
}

function validateForm(data) {
  let valid = true;
  els.jobTitle.classList.remove("invalid");
  els.company.classList.remove("invalid");

  if (!data.jobTitle) {
    els.jobTitle.classList.add("invalid");
    valid = false;
  }
  if (!data.company) {
    els.company.classList.add("invalid");
    valid = false;
  }

  if (data.jobLink) {
    try {
      new URL(data.jobLink);
      els.jobLink.classList.remove("invalid");
    } catch {
      els.jobLink.classList.add("invalid");
      valid = false;
    }
  } else {
    els.jobLink.classList.remove("invalid");
  }

  return valid;
}

function handleSave(e) {
  e.preventDefault();
  const data = collectFormData();
  if (!validateForm(data)) return;

  if (state.isNew) {
    const app = createApplication(data);
    state.selectedId = app.id;
    state.isNew = false;
    els.btnDelete.classList.remove("hidden");
    els.formTitle.textContent = "Edit Application";
  } else if (state.selectedId) {
    updateApplication(state.selectedId, data);
  }

  render();
}

function handleDelete() {
  if (!state.selectedId) return;
  const app = getApplication(state.selectedId);
  if (!app) return;

  const confirmed = confirm(`Delete "${app.jobTitle}" at ${app.company}? This cannot be undone.`);
  if (!confirmed) return;

  deleteApplication(state.selectedId);
  hideDetailPanel();
  render();
}

function addQA() {
  state.draftQA.push({ id: generateId(), question: "", answer: "" });
  renderInterviewQA();
  const inputs = els.interviewQAList.querySelectorAll(".qa-question");
  inputs[inputs.length - 1]?.focus();
}

function addKeyword() {
  const value = els.keywordInput.value.trim();
  if (!value) return;
  if (state.draftKeywords.some((k) => k.toLowerCase() === value.toLowerCase())) {
    els.keywordInput.value = "";
    return;
  }
  state.draftKeywords.push(value);
  els.keywordInput.value = "";
  renderKeywords();
}

function handleImport(file) {
  importFromJson(file)
    .then((imported) => {
      const replace = confirm(
        `Import ${imported.length} application(s)?\n\nClick OK to replace all existing data.\nClick Cancel to merge with existing data.`
      );
      if (replace) {
        state.applications = imported;
      } else {
        const existingIds = new Set(state.applications.map((a) => a.id));
        imported.forEach((app) => {
          if (!existingIds.has(app.id)) {
            state.applications.push(app);
          }
        });
      }
      saveApplications(state.applications);
      hideDetailPanel();
      render();
    })
    .catch((err) => alert(err.message));
}

function render() {
  renderStatusCounts();
  renderList();
}

function bindEvents() {
  els.btnAdd.addEventListener("click", openNewForm);
  els.btnAddEmpty.addEventListener("click", openNewForm);
  els.btnCancel.addEventListener("click", hideDetailPanel);
  els.btnCloseDetail.addEventListener("click", hideDetailPanel);
  els.detailForm.addEventListener("submit", handleSave);
  els.btnDelete.addEventListener("click", handleDelete);
  els.btnAddQA.addEventListener("click", addQA);
  els.btnAddKeyword.addEventListener("click", addKeyword);

  els.keywordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  });

  els.jobLink.addEventListener("blur", () => {
    const value = els.jobLink.value.trim();
    if (!value) {
      els.jobLink.classList.remove("invalid");
      return;
    }
    try {
      new URL(value);
      els.jobLink.classList.remove("invalid");
    } catch {
      els.jobLink.classList.add("invalid");
    }
  });

  els.btnExport.addEventListener("click", () => exportToJson(state.applications));

  els.importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleImport(file);
    e.target.value = "";
  });
}

function init() {
  state.applications = loadApplications();
  bindEvents();
  render();
}

init();
