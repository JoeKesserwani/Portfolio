import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { emptyProject, loadPortfolio, savePortfolio } from "./storage";
import type { PortfolioData, Profile, Project, ProjectImage } from "./types";

type IconName = "arrow" | "external" | "github" | "linkedin" | "mail" | "plus" | "close" | "upload" | "spark" | "pin" | "check" | "trash" | "edit" | "back" | "sun" | "moon";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    external: <><path d="M14 3h7v7" /><path d="M10 14 21 3" /><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" /></>,
    github: <><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.7c3 0 6.2 1.5 6.2 6.7" /><path d="M9 21v-3.9a3.4 3.4 0 0 1 .9-2.7C6.9 14.4 4 12.9 4 8.6a5.4 5.4 0 0 1 1.5-3.7A5 5 0 0 1 5.6 1S7.1.5 10 2.5a13.2 13.2 0 0 1 6 0C18.9.5 20.4 1 20.4 1a5 5 0 0 1 .1 3.9A5.4 5.4 0 0 1 22 8.6c0 4.3-2.9 5.8-5.9 5.8" /></>,
    linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    close: <><path d="m18 6-12 12" /><path d="m6 6 12 12" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></>,
    edit: <><path d="m16 4 4 4L9 19l-5 1 1-5Z" /><path d="m14 6 4 4" /></>,
    back: <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    moon: <><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function imageUrl(image: ProjectImage): string {
  if (typeof image.src === "string") return image.src;
  let url = blobUrls.get(image.src);
  if (!url) {
    url = URL.createObjectURL(image.src);
    blobUrls.set(image.src, url);
  }
  return url;
}

const blobUrls = new WeakMap<Blob, string>();

function usePortfolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    loadPortfolio().then(setData).catch((error: unknown) => {
      setLoadError(error instanceof Error ? error.message : "Portfolio data could not be loaded.");
    });
  }, []);

  async function updatePortfolio(next: PortfolioData) {
    await savePortfolio(next);
    setData(next);
  }
  return { data, setData, updatePortfolio, loadError };
}

function App() {
  const portfolio = usePortfolio();
  const isAdmin = window.location.pathname.replace(/\/+$/, "") === "/admin";
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("folio-theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem("folio-admin-authenticated") === "true");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#111713" : "#f7f8f6");
  }, [theme]);
  useEffect(() => {
    const browserTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const followBrowserTheme = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem("folio-theme")) setTheme(event.matches ? "dark" : "light");
    };
    browserTheme.addEventListener("change", followBrowserTheme);
    return () => browserTheme.removeEventListener("change", followBrowserTheme);
  }, []);
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("folio-theme", nextTheme);
    setTheme(nextTheme);
  };
  if (portfolio.loadError) {
    return <main className="load-error"><Icon name="spark" size={26} /><h1>We couldn't open your portfolio.</h1><p>{portfolio.loadError}</p><p>Check your browser's local storage settings and refresh the page.</p></main>;
  }
  if (!portfolio.data) return <div className="loading-screen"><span className="loading-mark">a.</span><span>Making room for good work…</span></div>;
  if (isAdmin && !isAuthenticated) {
    return <AdminLogin theme={theme} onToggleTheme={toggleTheme} onAuthenticated={() => {
      sessionStorage.setItem("folio-admin-authenticated", "true");
      setIsAuthenticated(true);
    }} />;
  }
  return isAdmin
    ? <Admin data={portfolio.data} updatePortfolio={portfolio.updatePortfolio} theme={theme} onToggleTheme={toggleTheme} onLogout={() => {
      sessionStorage.removeItem("folio-admin-authenticated");
      setIsAuthenticated(false);
    }} />
    : <Portfolio data={portfolio.data} theme={theme} onToggleTheme={toggleTheme} />;
}

function ThemeToggle({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) {
  const nextTheme = theme === "dark" ? "light" : "dark";
  return <button className="theme-toggle" onClick={onToggle} type="button" aria-label={`Switch to ${nextTheme} mode`} title={`Switch to ${nextTheme} mode`}><Icon name={theme === "dark" ? "sun" : "moon"} size={16} /><span>{theme === "dark" ? "Light" : "Dark"}</span></button>;
}

function AdminLogin({ theme, onToggleTheme, onAuthenticated }: { theme: "light" | "dark"; onToggleTheme: () => void; onAuthenticated: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (password !== "admin27") {
      setError("That password doesn’t look right. Please try again.");
      setPassword("");
      return;
    }
    onAuthenticated();
  };
  return <main className="login-shell"><div className="login-top"><a className="admin-brand" href="/"><span className="admin-brand-mark">{"</>"}</span><span>folio<span className="brand-muted">.dev</span><small>DEVELOPER PORTFOLIO</small></span></a><ThemeToggle theme={theme} onToggle={onToggleTheme} /></div><form className="login-card" onSubmit={submit}><span className="eyebrow">ADMIN / AUTHENTICATION</span><h1>Welcome back.</h1><p>Authenticate to manage your portfolio.</p><label className="field"><span>Password</span><input type="password" autoComplete="current-password" autoFocus value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="Enter password" required /></label>{error && <p className="login-error" role="alert">{error}</p>}<button className="button button-dark login-submit" type="submit">Sign in <Icon name="arrow" size={16} /></button><a className="login-home" href="/"><Icon name="back" size={15} />Back to portfolio</a></form><span className="login-footnote">FOLIO.DEV · ADMIN ACCESS</span></main>;
}

function Portfolio({ data, theme, onToggleTheme }: { data: PortfolioData; theme: "light" | "dark"; onToggleTheme: () => void }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const profile = data.profile;
  useEffect(() => {
    document.title = `${profile.name} — ${profile.role}`;
  }, [profile.name, profile.role]);
  return (
    <main className="portfolio-page">
      <header className="site-header page-wrap">
        <a className="wordmark" href="/" aria-label="Home"><span>&lt;</span>{profile.name.split(" ").map((word) => word[0]).join("").slice(0, 2).toLowerCase()}<span>/&gt;</span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#work">Work</a><a href="#about">About</a><a href={`mailto:${profile.email}`}>Contact <span className="nav-arrow">↗</span></a>
        </nav>
        <a className="availability" href={`mailto:${profile.email}`}><span className="availability-dot" />{profile.availability}</a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>
      <section className="hero page-wrap">
        <div className="hero-kicker"><span className="code-index">01</span><span className="kicker-line" /> // HELLO, I’M {profile.name.toUpperCase()}</div>
        <h1>{profile.intro}</h1>
        <div className="hero-bottom">
          <p>{profile.role}.</p>
          <a className="text-link" href="#work">View selected work <span className="round-arrow"><Icon name="arrow" size={16} /></span></a>
        </div>
      </section>
      <section className="work-section page-wrap" id="work">
        <div className="section-heading"><div><span className="eyebrow"><span className="code-index">02</span> / PROJECTS</span><h2>Selected projects<span className="heading-period">.</span></h2></div><span className="project-count">{String(data.projects.length).padStart(2, "0")} projects</span></div>
        {data.projects.length ? <div className="project-grid">{data.projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} onOpen={() => setSelectedProject(project)} />)}</div> : <div className="empty-projects"><Icon name="spark" size={28} /><p>New work is on its way. Check back soon.</p></div>}
      </section>
      <section className="about-section" id="about">
        <div className="about-wrap page-wrap">
          <div className="about-aside"><span className="eyebrow"><span className="code-index">03</span> / ABOUT</span></div>
          <div className="about-copy"><h2>About <span>me.</span></h2><p>{profile.about}</p><div className="about-meta"><span><Icon name="pin" size={15} />{profile.location}</span><a href={`mailto:${profile.email}`}><Icon name="mail" size={15} />{profile.email}</a>{profile.resume && <a href={profile.resume} target="_blank" rel="noreferrer"><Icon name="external" size={15} />Resume</a>}</div><div className="skill-list">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>
        </div>
      </section>
      <footer className="site-footer page-wrap"><a className="wordmark" href="#top">{"</>"}</a><p></p><div className="footer-links">{profile.github && <a href={profile.github} aria-label="GitHub"><Icon name="github" /></a>}{profile.linkedin && <a href={profile.linkedin} aria-label="LinkedIn"><Icon name="linkedin" /></a>}<a href={`mailto:${profile.email}`} aria-label="Email"><Icon name="mail" /></a></div><span className="copyright">© {new Date().getFullYear()}</span></footer>
      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </main>
  );
}

function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  const firstImage = project.images[0];
  const url = firstImage ? imageUrl(firstImage) : "";
  return <button className={`project-card project-card-${index % 3}`} onClick={onOpen} type="button">
    <span className="project-image-wrap">{firstImage ? <img className="project-image" src={url} alt={firstImage.alt || project.title} /> : <span className="project-image-placeholder"><Icon name="spark" size={36} /></span>}<span className="project-open"><Icon name="arrow" size={19} /></span>{project.images.length > 1 && <span className="image-count">{String(project.images.length).padStart(2, "0")} images</span>}</span>
    <span className="project-info"><span className="project-category">{project.category || "Selected project"} <span>{project.year}</span></span><span className="project-title">{project.title || "Untitled project"}</span><span className="project-description">{project.description}</span><span className="project-tags">{project.stack.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</span></span>
  </button>;
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="project-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={onClose} aria-label="Close project"><Icon name="close" /></button><div className="modal-topline"><span>{project.category}</span><span>{project.year}</span></div><h2 id="modal-title">{project.title}</h2><p className="modal-description">{project.description}</p><div className="modal-tags">{project.stack.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="modal-gallery">{project.images.map((image) => <img key={image.id} src={imageUrl(image)} alt={image.alt || project.title} />)}</div><div className="modal-links">{project.liveUrl && <a className="button button-dark" href={project.liveUrl} target="_blank" rel="noreferrer">View live project <Icon name="external" size={16} /></a>}{project.sourceUrl && <a className="button button-light" href={project.sourceUrl} target="_blank" rel="noreferrer"><Icon name="github" size={16} />View source</a>}</div></section></div>;
}

function Admin({ data, updatePortfolio, theme, onToggleTheme, onLogout }: { data: PortfolioData; updatePortfolio: (data: PortfolioData) => Promise<void>; theme: "light" | "dark"; onToggleTheme: () => void; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<"profile" | "projects">("profile");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Profile>(data.profile);
  const sortedProjects = data.projects;
  const saveData = async (next: PortfolioData): Promise<boolean> => {
    setSaving(true);
    setSaveError("");
    try {
      await updatePortfolio(next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Your changes could not be saved.");
      return false;
    } finally {
      setSaving(false);
    }
  };
  const saveProfile = (event: FormEvent) => { event.preventDefault(); void saveData({ ...data, profile: profileDraft }); };
  const saveProject = async (project: Project) => {
    const exists = data.projects.some((item) => item.id === project.id);
    const projects = exists ? data.projects.map((item) => item.id === project.id ? project : item) : [project, ...data.projects];
    if (await saveData({ ...data, projects })) setEditingProject(null);
    else throw new Error("The project could not be saved. Please try again.");
  };
  const deleteProject = (project: Project) => {
    if (!window.confirm(`Delete “${project.title || "Untitled project"}”? This cannot be undone.`)) return;
    void saveData({ ...data, projects: data.projects.filter((item) => item.id !== project.id) });
  };
  return <main className="admin-shell">
    <aside className="admin-sidebar"><a className="admin-brand" href="/"><span className="admin-brand-mark">{"</>"}</span><span>folio<span className="brand-muted">.dev</span><small>DEVELOPER PORTFOLIO</small></span></a><div className="sidebar-label">CONTENT</div><button className={`sidebar-link ${activeTab === "profile" ? "active" : ""}`} onClick={() => { setActiveTab("profile"); setEditingProject(null); }}><span className="sidebar-icon">◉</span>Profile</button><button className={`sidebar-link ${activeTab === "projects" ? "active" : ""}`} onClick={() => { setActiveTab("projects"); setEditingProject(null); }}><span className="sidebar-icon">▧</span>Projects<span className="sidebar-count">{data.projects.length}</span></button><div className="sidebar-bottom"><a className="view-site-link" href="/"><span>↗</span> View live site</a><span className="admin-version">FOLIO.DEV · 01</span></div></aside>
    <div className="admin-main"><header className="admin-topbar"><div className="breadcrumb"><span>Content</span><span>/</span><b>{editingProject ? "Project" : activeTab === "profile" ? "Profile" : "Projects"}</b></div><div className="admin-top-actions"><span className="autosave-label"><span className={`autosave-dot ${saving ? "is-saving" : saved ? "is-saved" : ""}`} />{saving ? "Saving…" : saved ? "All changes saved" : "Saved to this browser"}</span><a className="top-view-button" href="/" target="_blank" rel="noreferrer">Preview site <Icon name="external" size={14} /></a><ThemeToggle theme={theme} onToggle={onToggleTheme} /><button className="logout-button" onClick={onLogout} type="button">Sign out</button></div></header>
      <div className="admin-content">
        {editingProject ? <ProjectEditor project={editingProject} isNew={!data.projects.some((item) => item.id === editingProject.id)} onSave={saveProject} onCancel={() => setEditingProject(null)} /> : activeTab === "profile" ? <section className="editor-page"><div className="editor-heading"><div><span className="eyebrow">// PROFILE</span><h1>Profile details</h1><p>Update the information shown on your public portfolio.</p></div></div><form className="profile-form" onSubmit={saveProfile}><div className="form-section-label"><span>01</span><div><b>Basic information</b><p>Your name, role, and headline.</p></div></div><div className="field-grid"><Field label="Your name" value={profileDraft.name} onChange={(value) => setProfileDraft({ ...profileDraft, name: value })} placeholder="e.g. Alex Morgan" /><Field label="What you do" value={profileDraft.role} onChange={(value) => setProfileDraft({ ...profileDraft, role: value })} placeholder="e.g. Software developer" /><div className="field full-field"><label htmlFor="intro">Your headline</label><textarea id="intro" rows={3} maxLength={180} value={profileDraft.intro} onChange={(event) => setProfileDraft({ ...profileDraft, intro: event.target.value })} placeholder="I build reliable software for the web." /><div className="field-hint">This is the first thing visitors see. Keep it clear. <span>{profileDraft.intro.length}/180</span></div></div><div className="field full-field"><label htmlFor="about">About</label><textarea id="about" rows={4} value={profileDraft.about} onChange={(event) => setProfileDraft({ ...profileDraft, about: event.target.value })} placeholder="Your experience, interests, and approach to development." /></div></div><div className="form-divider" /><div className="form-section-label"><span>02</span><div><b>Contact</b><p>Make it easy for people to get in touch.</p></div></div><div className="field-grid"><Field label="Email address" value={profileDraft.email} onChange={(value) => setProfileDraft({ ...profileDraft, email: value })} placeholder="you@example.com" type="email" /><Field label="Based in" value={profileDraft.location} onChange={(value) => setProfileDraft({ ...profileDraft, location: value })} placeholder="e.g. Brooklyn, NY" /><Field label="Availability note" value={profileDraft.availability} onChange={(value) => setProfileDraft({ ...profileDraft, availability: value })} placeholder="Open to software opportunities" /><Field label="Skills & specialties" value={profileDraft.skills.join(", ")} onChange={(value) => setProfileDraft({ ...profileDraft, skills: value.split(",").map((skill) => skill.trim()).filter(Boolean) })} placeholder="JavaScript, React, TypeScript" hint="Separate each skill with a comma." /></div><div className="form-divider" /><div className="form-section-label"><span>03</span><div><b>Links</b><p>Profiles and links you want to share.</p></div></div><div className="field-grid"><Field label="GitHub URL" value={profileDraft.github} onChange={(value) => setProfileDraft({ ...profileDraft, github: value })} placeholder="https://github.com/you" type="url" /><Field label="LinkedIn URL" value={profileDraft.linkedin} onChange={(value) => setProfileDraft({ ...profileDraft, linkedin: value })} placeholder="https://linkedin.com/in/you" type="url" /><Field label="Resume URL" value={profileDraft.resume} onChange={(value) => setProfileDraft({ ...profileDraft, resume: value })} placeholder="https://…" type="url" /></div><div className="form-actions"><span className="form-saved"><Icon name="check" size={15} />Saved in this browser.</span><button className="button button-dark save-button" disabled={saving} type="submit">{saving ? "Saving…" : saved ? "Changes saved" : "Save changes"} {!saving && <Icon name={saved ? "check" : "arrow"} size={16} />}</button></div>{saveError && <p className="error-message" role="alert">{saveError}</p>}</form></section> : <section className="editor-page projects-admin-page"><div className="editor-heading"><div><span className="eyebrow">// PROJECTS</span><h1>Projects <span className="admin-project-count">{String(data.projects.length).padStart(2, "0")}</span></h1><p>Manage the projects on your portfolio.</p></div><button className="button button-dark" onClick={() => setEditingProject(emptyProject())}><Icon name="plus" size={17} />Add a project</button></div><div className="admin-project-list">{sortedProjects.map((project) => <article className="admin-project-row" key={project.id}><div className="admin-project-thumb">{project.images[0] ? <img src={imageUrl(project.images[0])} alt="" /> : <Icon name="spark" size={22} />}</div><div className="admin-project-details"><b>{project.title || "Untitled project"}</b><span>{project.category || "No category"} · {project.year}</span><small>{project.images.length} {project.images.length === 1 ? "image" : "images"}</small></div><button className="icon-button" onClick={() => setEditingProject(project)} aria-label={`Edit ${project.title}`}><Icon name="edit" size={17} /></button><button className="icon-button delete-button" onClick={() => deleteProject(project)} aria-label={`Delete ${project.title}`}><Icon name="trash" size={17} /></button></article>)}{data.projects.length === 0 && <div className="empty-admin"><span className="empty-spark">✳</span><h3>No projects yet.</h3><p>Add a project to get started.</p><button className="button button-dark" onClick={() => setEditingProject(emptyProject())}><Icon name="plus" size={17} />Add your first project</button></div>}</div>{saveError && <p className="error-message" role="alert">{saveError}</p>}</section>}
      </div>
    </div>
  </main>;
}

function Field({ label, value, onChange, placeholder, type = "text", hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; hint?: string }) {
  const id = useMemo(() => `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, [label]);
  return <div className="field"><label htmlFor={id}>{label}</label><input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />{hint && <div className="field-hint">{hint}</div>}</div>;
}

function ProjectEditor({ project, isNew, onSave, onCancel }: { project: Project; isNew: boolean; onSave: (project: Project) => Promise<void>; onCancel: () => void }) {
  const [draft, setDraft] = useState<Project>(project);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = (patch: Partial<Project>) => setDraft((current) => ({ ...current, ...patch }));
  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const nextImages = files.map((file) => ({ id: crypto.randomUUID(), src: file.slice(0, file.size, file.type), alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") }));
    update({ images: [...draft.images, ...nextImages] });
    event.target.value = "";
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try { await onSave(draft); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : "The project could not be saved."); }
    finally { setBusy(false); }
  };
  return (
    <section className="editor-page project-editor-page">
      <button className="back-link" onClick={onCancel}><Icon name="back" size={17} />Back to projects</button>
      <div className="editor-heading compact-heading">
        <div>
          <span className="eyebrow">// {isNew ? "NEW PROJECT" : "EDIT PROJECT"}</span>
          <h1>{isNew ? "Add a project" : "Edit project"}</h1>
          <p>Share what you built, how it works, and what you used.</p>
        </div>
      </div>
      <form className="profile-form project-form" onSubmit={submit}>
        <div className="form-section-label"><span>01</span><div><b>Project details</b><p>Name the project and summarize the implementation.</p></div></div>
        <div className="field-grid">
          <Field label="Project title" value={draft.title} onChange={(value) => update({ title: value })} placeholder="e.g. Realtime issue tracker" />
          <Field label="Category" value={draft.category} onChange={(value) => update({ category: value })} placeholder="e.g. Full-stack web app" />
          <Field label="Year" value={draft.year} onChange={(value) => update({ year: value })} placeholder="2025" />
          <Field label="Technologies" value={draft.stack.join(", ")} onChange={(value) => update({ stack: value.split(",").map((tag) => tag.trim()).filter(Boolean) })} placeholder="TypeScript, React, PostgreSQL" hint="Separate technologies with commas." />
          <div className="field full-field"><label htmlFor="project-description">Description</label><textarea id="project-description" rows={4} value={draft.description} onChange={(event) => update({ description: event.target.value })} placeholder="What problem does this solve? How is it built?" /></div>
        </div>
        <div className="form-divider" />
        <div className="form-section-label"><span>02</span><div><b>Screenshots</b><p>Add multiple images to show the UI, architecture, or results.</p></div></div>
        <div className="image-upload-area">
          <div className="uploaded-images">{draft.images.map((image) => <div className="uploaded-image" key={image.id}><img src={imageUrl(image)} alt={image.alt || "Project preview"} /><button type="button" onClick={() => update({ images: draft.images.filter((item) => item.id !== image.id) })} aria-label="Remove image"><Icon name="close" size={16} /></button><input aria-label="Describe this image" value={image.alt} placeholder="Describe this image" onChange={(event) => update({ images: draft.images.map((item) => item.id === image.id ? { ...item, alt: event.target.value } : item) })} /></div>)}</div>
          <label className="upload-dropzone"><input type="file" accept="image/*" multiple onChange={handleFiles} /><span className="upload-icon"><Icon name="upload" size={20} /></span><b>Upload screenshots</b><span>JPG, PNG, GIF, or WebP · Select multiple files</span><span className="upload-limit">No image count limit · Stored in this browser</span></label>
        </div>
        <div className="form-divider" />
        <div className="form-section-label"><span>03</span><div><b>Project links</b><p>Optionally link to a live demo and the source repository.</p></div></div>
        <div className="field-grid">
          <Field label="Live demo URL" value={draft.liveUrl} onChange={(value) => update({ liveUrl: value })} placeholder="https://…" type="url" />
          <Field label="Source repository URL" value={draft.sourceUrl} onChange={(value) => update({ sourceUrl: value })} placeholder="https://github.com/…" type="url" />
        </div>
        <div className="form-actions"><span className="form-saved"><Icon name="check" size={15} />Saved in this browser.</span><button type="button" className="button button-light" onClick={onCancel}>Cancel</button><button type="submit" className="button button-dark save-button" disabled={busy}>{busy ? "Saving…" : isNew ? "Add project" : "Save project"} <Icon name="arrow" size={16} /></button></div>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>
    </section>
  );
}

export { App };
