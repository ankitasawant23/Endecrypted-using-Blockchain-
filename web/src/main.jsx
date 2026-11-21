import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const Icon = ({ name, size = 20 }) => {
  const paths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/>',
    unlock: '<rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 7-2.7"/><path d="M12 14v3"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    verify: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    chain: '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L7.6 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 6.4 14H6v-2.6h.4A1.7 1.7 0 0 0 8 10.4a1.7 1.7 0 0 0-.3-1.9L7.6 8l1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 12.4 5v-.2H15V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21v2.6h-.4A1.7 1.7 0 0 0 19.4 15z"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 7l3 3M14 9l2 2"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>'
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: paths[name] || paths.grid }} />;
};

async function api(path, options = {}) {
  const token = localStorage.getItem('cipherchain_token');
  let response;

  try {
    response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error('Cannot reach the backend API. Start the backend server on port 5000.');
  }

  const contentType = response.headers.get('content-type') || '';
  const rawText = await response.text();

  let data;
  if (contentType.includes('application/json')) {
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error('The backend returned an invalid JSON response.');
    }
  } else if (rawText) {
    throw new Error('Cannot reach the backend API. Make sure the server is running on port 5000.');
  } else {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}.`);
  }

  return data;
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password }) });
        onLogin(data.token, data.user);
      } else {
        await api('/api/auth/register', { method: 'POST', body: JSON.stringify(form) });
        setRegistered(true);
        setForm((current) => ({ ...current, password: '' }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="brand brand-light"><div className="brand-mark"><Icon name="lock" size={19} /></div><span>CipherChain</span></div>
        <div className="brand-visual">
          <div className="visual-orbit orbit-one"></div><div className="visual-orbit orbit-two"></div>
          <div className="visual-core"><Icon name="shield" size={44} /></div>
          <span className="particle p1"></span><span className="particle p2"></span><span className="particle p3"></span>
        </div>
        <div className="brand-copy">
          <span className="eyebrow">SECURE ENCRYPTION PLATFORM</span>
          <h1>Your data. Protected by<br />stronger technology.</h1>
          <p>Encrypt sensitive information with enterprise-grade cryptography and preserve integrity through blockchain records.</p>
        </div>
        <div className="brand-security"><Icon name="shield" size={16} /> RSA-2048 · AES-256-GCM · SHA-256</div>
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <div className="mobile-brand brand"><div className="brand-mark"><Icon name="lock" size={19} /></div><span>CipherChain</span></div>
          {registered ? (
            <div className="registration-success">
              <div className="registration-success-icon"><Icon name="shield" size={30} /></div>
              <span className="eyebrow">ACCOUNT CREATED</span>
              <h2>Welcome to CipherChain</h2>
              <p>Your account has been created successfully. Sign in with <strong>{form.email}</strong> to open your secure workspace.</p>
              <button className="primary-button" type="button" onClick={() => { setRegistered(false); setMode('login'); setError(''); setForm((current) => ({ ...current, password: '' })); }}>Sign in now<Icon name="arrow" size={17} /></button>
              <button className="success-secondary-button" type="button" onClick={() => { setRegistered(false); setMode('register'); setError(''); }}>Create another account</button>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}</span>
                <h2>{mode === 'login' ? 'Sign in to your workspace' : 'Start securing your data'}</h2>
                <p>{mode === 'login' ? 'Enter your credentials to continue.' : 'Create your secure CipherChain account.'}</p>
              </div>
              {mode === 'register' && (
                <label className="field">Full name<input required maxLength={100} placeholder="Alex Morgan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              )}
              <label className="field">Email address<input required type="email" placeholder="name@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label className="field">Password<div className="password-input"><input required minLength={mode === 'register' ? 8 : 1} maxLength={72} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility"><Icon name="eye" size={18} /></button></div></label>
              {error && <div className={error.includes('successfully') ? 'form-message success' : 'form-message'}>{error}</div>}
              <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}<Icon name="arrow" size={17} /></button>
              <p className="auth-switch">{mode === 'login' ? 'New to CipherChain?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></p>
            </>
          )}
        </form>
      </section>
    </main>
  );
}

function App() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('cipherchain_token');
    const user = JSON.parse(localStorage.getItem('cipherchain_user') || 'null');
    return token && user ? { token, user } : null;
  });
  const [active, setActive] = useState('Overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const navigate = (event) => setActive(event.detail);
    window.addEventListener('cipherchain:navigate', navigate);
    return () => window.removeEventListener('cipherchain:navigate', navigate);
  }, []);

  const login = (token, user) => {
    localStorage.setItem('cipherchain_token', token);
    localStorage.setItem('cipherchain_user', JSON.stringify(user));
    setSession({ token, user });
  };
  const logout = () => {
    localStorage.removeItem('cipherchain_token');
    localStorage.removeItem('cipherchain_user');
    setSession(null);
  };

  if (!session) return <AuthScreen onLogin={login} />;
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand sidebar-brand"><div className="brand-mark"><Icon name="lock" size={18} /></div><span>CipherChain</span><button className="sidebar-close" onClick={() => setMobileNav(false)}><Icon name="close" /></button></div>
        <nav className="main-nav">
          {[
            ['Overview', 'grid'], ['Encrypt', 'lock'], ['Decrypt', 'unlock'], ['My files', 'file'],
            ['Verification', 'verify'], ['History', 'history'], ['Blockchain', 'chain']
          ].map(([label, icon]) => <button key={label} className={active === label ? 'active' : ''} onClick={() => { setActive(label); setMobileNav(false); }}><Icon name={icon} /><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => setActive('Settings')}><Icon name="settings" /><span>Settings</span></button>
          <button onClick={logout}><Icon name="logout" /><span>Sign out</span></button>
        </div>
      </aside>
      {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation"></button>}
      <section className="workspace">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)}><Icon name="menu" /></button>
          <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{active}</strong></div>
          <div className="topbar-actions">
            <div className={`global-search ${searchOpen ? 'open' : ''}`}>
              {searchOpen && <input
                autoFocus
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setActive('My files');
                  if (event.key === 'Escape') setSearchOpen(false);
                }}
                placeholder="Search encrypted files..."
                aria-label="Search encrypted files"
              />}
              <button className="icon-button" aria-label="Search files" onClick={() => setSearchOpen((open) => !open)}><Icon name={searchOpen ? 'close' : 'search'} size={18} /></button>
            </div>
            <div className="profile"><div className="avatar">{session.user.name?.charAt(0)?.toUpperCase() || 'U'}</div><div><strong>{session.user.name || 'User'}</strong><span>Member</span></div></div>
          </div>
        </header>
        <main className="content">
          {active === 'Overview' && <Overview setActive={setActive} />}
          {active === 'Encrypt' && <EncryptPage />}
          {active === 'Decrypt' && <DecryptPage />}
          {active === 'My files' && <FilesPage initialSearch={globalSearch} />}
          {active === 'Verification' && <VerificationPage />}
          {active === 'History' && <HistoryPage />}
          {active === 'Blockchain' && <BlockchainPage />}
          {active === 'Settings' && <SettingsPage user={session.user} />}
        </main>
      </section>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }) {
  return <div className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

function Overview({ setActive }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/api/files/my-files')
      .then((data) => setFiles(Array.isArray(data.files) ? data.files : []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <PageHeader eyebrow="SECURITY OVERVIEW" title="Good morning" description="Here is a summary of your encrypted workspace." action={<button className="primary-button compact" onClick={() => setActive('Encrypt')}><Icon name="plus" size={17} />New encryption</button>} />
      <div className="stats-grid">
        <StatCard label="Encrypted files" value={loading ? '—' : String(files.length).padStart(2, '0')} trend={loading ? 'Loading' : 'Your files'} icon="file" tone="blue" />
        <StatCard label="Verified records" value={loading ? '—' : files.length === 0 ? '0' : '—'} trend={loading ? 'Loading' : files.length === 0 ? 'No records' : 'Not tracked'} icon="verify" tone="green" />
        <StatCard label="Blockchain status" value="Pending" trend="Integration pending" icon="chain" tone="violet" />
      </div>
      <div className="overview-grid">
        <section className="panel activity-panel">
          <div className="panel-header"><div><h3>Recent activity</h3><p>Latest encrypted records</p></div><button className="text-button" onClick={() => setActive('My files')}>View all <Icon name="arrow" size={15} /></button></div>
          <div className="file-table">
            {loading && <div className="activity-empty">Loading your encrypted files...</div>}
            {!loading && error && <div className="activity-empty error">{error}</div>}
            {!loading && !error && files.length === 0 && <div className="activity-empty">No encrypted files yet. Create your first encrypted record.</div>}
            {!loading && !error && files.slice(0, 5).map((file) => <div className="file-row" key={file.id}><div className="file-icon"><Icon name="file" size={18} /></div><div className="file-meta"><strong>{file.file_name || 'Encrypted record'}</strong><span>{file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Recently'}</span></div><span className="status-pill"><i></i>Secured</span><button className="row-action" onClick={() => setActive('Verification')}>•••</button></div>)}
          </div>
        </section>
        <section className="panel security-panel">
          <div className="panel-header"><div><h3>Security health</h3><p>System integrity</p></div><span className="health-score">Excellent</span></div>
          <div className="health-ring"><div><strong>96</strong><span>/100</span></div></div>
          <div className="health-list">
            <div><span><i className="dot green"></i>Encryption</span><strong>Strong</strong></div>
            <div><span><i className="dot blue"></i>Key protection</span><strong>Secure</strong></div>
            <div><span><i className="dot violet"></i>Integrity checks</span><strong>Active</strong></div>
          </div>
        </section>
      </div>
    </>
  );
}

function StatCard({ label, value, trend, icon, tone }) {
  return <section className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon} size={20} /></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong></div><span className="stat-trend">{trend}</span></section>;
}

function EncryptPage() {
  const [form, setForm] = useState({ fileName: '', message: '', decryptionKey: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const data = await api('/api/encryption/encrypt', { method: 'POST', body: JSON.stringify({ fileName: form.fileName || 'Untitled record', message: form.message, decryptionKey: form.decryptionKey }) });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return <><PageHeader eyebrow="PROTECT INFORMATION" title="Encrypt data" description="Convert sensitive text into a securely encrypted record." /><div className="two-column"><form className="panel form-panel" onSubmit={submit}><div className="panel-header"><div><h3>Encryption details</h3><p>Enter the information you want to protect.</p></div></div><label className="field">Record name<input value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} placeholder="e.g. Client agreement" /></label><label className="field">Secure text<textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Enter confidential text..." required maxLength={10000} /><span className="character-count">{form.message.length} / 10,000</span></label><label className="field">Decryption key<input type="password" minLength={8} maxLength={72} required value={form.decryptionKey} onChange={(e) => setForm({ ...form, decryptionKey: e.target.value })} placeholder="Create a key with at least 8 characters" /><span className="field-help">This key will be required before anyone can decrypt this record.</span></label>{error && <div className="form-message">{error}</div>}<button className="primary-button" disabled={loading || !form.message.trim() || form.decryptionKey.length < 8}>{loading ? 'Encrypting...' : 'Encrypt and store'}<Icon name="lock" size={16} /></button></form><section className="panel result-panel"><div className="panel-header"><div><h3>Encryption result</h3><p>Output summary</p></div></div>{result ? <div className="result-content"><div className="success-mark"><Icon name="shield" size={26} /></div><h3>Encrypted successfully</h3><p>Record #{result.fileId} was stored securely.</p><div className="hash-box"><span>SHA-256 hash</span><code>{result.dataHash}</code><button onClick={() => navigator.clipboard.writeText(result.dataHash)}><Icon name="copy" size={16} /></button></div></div> : <div className="empty-result"><div><Icon name="lock" size={30} /></div><h3>Ready to encrypt</h3><p>Your encrypted result will appear here.</p></div>}</section></div></>;
}

function DecryptPage() {
  const [fileId, setFileId] = useState('');
  const [decryptionKey, setDecryptionKey] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError(''); setResult(null);
    try { setResult(await api('/api/encryption/decrypt', { method: 'POST', body: JSON.stringify({ fileId: Number(fileId), decryptionKey }) })); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return <><PageHeader eyebrow="SECURE ACCESS" title="Decrypt data" description="Enter the decryption key to restore an encrypted record." /><div className="two-column"><form className="panel form-panel" onSubmit={submit}><div className="panel-header"><div><h3>Decryption request</h3><p>Select a record and enter its key.</p></div></div><label className="field">File ID<input type="number" min="1" required value={fileId} onChange={(e) => setFileId(e.target.value)} placeholder="Enter file ID" /></label><label className="field">Decryption key<input type="password" required value={decryptionKey} onChange={(e) => setDecryptionKey(e.target.value)} placeholder="Enter the record key" /></label>{error && <div className="form-message">{error}</div>}<button className="primary-button" disabled={loading || !fileId || !decryptionKey}>{loading ? 'Verifying...' : 'Decrypt record'}<Icon name="unlock" size={16} /></button></form><section className="panel result-panel"><div className="panel-header"><div><h3>Decrypted content</h3><p>Integrity-verified output</p></div></div>{result ? <div className="decrypted-box"><span>DECRYPTED DATA</span><p>{result.decryptedData}</p></div> : <div className="empty-result"><div><Icon name="unlock" size={30} /></div><h3>Waiting for a record</h3><p>Decrypted content will appear here.</p></div>}</section></div></>;
}

function FilesPage({ initialSearch = '' }) {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const loadFiles = () => {
    setLoading(true);
    api('/api/files/my-files')
      .then((data) => setFiles(data.files?.length ? data.files : []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  };
  useEffect(loadFiles, []);
  const deleteFile = async (file) => {
    if (!window.confirm(`Delete "${file.file_name || 'this encrypted record'}"? This cannot be undone.`)) return;
    try {
      await api(`/api/files/${file.id}`, { method: 'DELETE' });
      loadFiles();
    } catch (error) {
      window.alert(error.message);
    }
  };
  const visible = files.filter((file) => (file.file_name || '').toLowerCase().includes(search.toLowerCase()));
  return <><PageHeader eyebrow="DATA VAULT" title="My files" description="Manage all of your encrypted records." action={<button className="primary-button compact" onClick={() => window.dispatchEvent(new CustomEvent('cipherchain:navigate', { detail: 'Encrypt' }))}><Icon name="plus" size={17} />Add record</button>} /><section className="panel table-panel"><div className="table-toolbar"><div className="search-box"><Icon name="search" size={16} /><input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><span>{visible.length} records</span></div><div className="data-table"><div className="data-head"><span>Name</span><span>Hash</span><span>Created</span><span>Status</span><span></span></div>{loading ? <div className="table-empty">Loading records...</div> : visible.length ? visible.map((file) => <div className="data-row" key={file.id}><div className="data-name"><div className="file-icon"><Icon name="file" size={17} /></div><div><strong>{file.file_name || 'Encrypted record'}</strong><small>#{file.id}</small></div></div><code>{file.data_hash?.slice(0, 12)}…</code><span>{file.created_at ? new Date(file.created_at).toLocaleDateString() : '—'}</span><span className="status-pill"><i></i>Secured</span><button className="row-action delete-action" title="Delete encrypted record" aria-label={`Delete ${file.file_name}`} onClick={() => deleteFile(file)}>Delete</button></div>) : <div className="table-empty">No encrypted records found.</div>}</div></section></>;
}

function VerificationPage() {
  const [fileId, setFileId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const submit = async (event) => { event.preventDefault(); setLoading(true); try { setResult(await api('/api/verification/verify', { method: 'POST', body: JSON.stringify({ fileId: Number(fileId) }) })); } catch (err) { setResult({ success: false, message: err.message, isValid: false }); } finally { setLoading(false); } };
  return <><PageHeader eyebrow="INTEGRITY CONTROL" title="Verify record" description="Confirm that encrypted data has not been altered." /><div className="two-column"><form className="panel form-panel" onSubmit={submit}><div className="panel-header"><div><h3>Verification request</h3><p>Check the stored SHA-256 hash.</p></div></div><label className="field">File ID<input type="number" min="1" required value={fileId} onChange={(e) => setFileId(e.target.value)} placeholder="Enter file ID" /></label><button className="primary-button" disabled={loading || !fileId}>{loading ? 'Checking...' : 'Run verification'}<Icon name="verify" size={16} /></button></form><section className="panel result-panel"><div className="panel-header"><div><h3>Verification status</h3><p>Integrity result</p></div></div>{result ? <div className="verification-result"><div className={`verification-mark ${result.isValid ? 'valid' : 'invalid'}`}><Icon name={result.isValid ? 'shield' : 'close'} size={28} /></div><h3>{result.isValid ? 'Integrity verified' : 'Verification failed'}</h3><p>{result.message}</p>{result.storedHash && <div className="hash-stack"><div><span>Stored hash</span><code>{result.storedHash}</code></div><div><span>Calculated hash</span><code>{result.calculatedHash}</code></div></div>}</div> : <div className="empty-result"><div><Icon name="verify" size={30} /></div><h3>No verification yet</h3><p>Run a check to see integrity status.</p></div>}</section></div></>;
}

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api('/api/history?page=1&limit=20').then((data) => setHistory(data.history || [])).catch(() => setHistory([])).finally(() => setLoading(false)); }, []);
  return <><PageHeader eyebrow="AUDIT TRAIL" title="Transaction history" description="Review encryption activity and blockchain record status." /><section className="panel table-panel"><div className="table-toolbar"><h3>All transactions</h3><span>{history.length} records</span></div><div className="data-table history-table"><div className="data-head"><span>Record</span><span>Encrypted at</span><span>Transaction</span><span>Status</span></div>{loading ? <div className="table-empty">Loading history...</div> : history.length ? history.map((item) => <div className="data-row" key={item.fileId}><div className="data-name"><div className="file-icon"><Icon name="history" size={17} /></div><div><strong>{item.fileName}</strong><small>#{item.fileId}</small></div></div><span>{new Date(item.encryptedAt).toLocaleString()}</span><code>{item.transactionHash ? item.transactionHash.slice(0, 16) + '…' : 'Not recorded'}</code><span className={`status-pill ${item.transactionHash ? 'matched' : ''}`}><i></i>{item.transactionHash ? 'Recorded' : 'Pending'}</span></div>) : <div className="table-empty">No transaction history is available.</div>}</div></section></>;
}

function BlockchainPage() {
  const [fileId, setFileId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const store = async (event) => { event.preventDefault(); setLoading(true); try { setResult(await api('/api/blockchain/store-hash', { method: 'POST', body: JSON.stringify({ fileId: Number(fileId) }) })); } catch (err) { setResult({ success: false, message: err.message }); } finally { setLoading(false); } };
  const verify = async () => { if (!fileId) return; setLoading(true); try { setResult(await api('/api/blockchain/verify', { method: 'POST', body: JSON.stringify({ fileId: Number(fileId) }) })); } catch (err) { setResult({ success: false, message: err.message }); } finally { setLoading(false); } };
  return <><PageHeader eyebrow="BLOCKCHAIN LAYER" title="Blockchain records" description="Prepare and verify immutable integrity references." /><div className="two-column"><form className="panel form-panel" onSubmit={store}><div className="panel-header"><div><h3>Record management</h3><p>Use a file ID to manage its blockchain reference.</p></div></div><label className="field">File ID<input type="number" min="1" required value={fileId} onChange={(e) => setFileId(e.target.value)} placeholder="Enter file ID" /></label><div className="button-row"><button className="primary-button" disabled={loading || !fileId}>Prepare record<Icon name="chain" size={16} /></button><button type="button" className="secondary-button" disabled={loading || !fileId} onClick={verify}>Verify on-chain</button></div></form><section className="panel result-panel"><div className="panel-header"><div><h3>Blockchain status</h3><p>Latest action</p></div></div>{result ? <div className="verification-result"><div className={`verification-mark ${result.success ? 'valid' : 'invalid'}`}><Icon name={result.success ? 'chain' : 'close'} size={27} /></div><h3>{result.blockchainStatus || (result.success ? 'Ready' : 'Action failed')}</h3><p>{result.message}</p>{result.dataHash && <div className="hash-box"><span>DATA HASH</span><code>{result.dataHash}</code></div>}</div> : <div className="empty-result"><div><Icon name="chain" size={30} /></div><h3>No record selected</h3><p>Blockchain status will appear here.</p></div>}</section></div></>;
}

function SettingsPage({ user }) {
  return <><PageHeader eyebrow="ACCOUNT" title="Settings" description="Manage your profile and workspace preferences." /><div className="settings-grid"><section className="panel form-panel"><div className="panel-header"><div><h3>Profile information</h3><p>Your account details</p></div></div><div className="profile-details"><div className="avatar large">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div><div><strong>{user.name}</strong><span>{user.email}</span></div></div><label className="field">Display name<input defaultValue={user.name} /></label><label className="field">Email address<input defaultValue={user.email} disabled /></label><button className="secondary-button" disabled>Save changes</button></section><section className="panel form-panel"><div className="panel-header"><div><h3>Security preferences</h3><p>Workspace protection</p></div></div><Toggle label="Two-factor authentication" detail="Add another layer of account security" /><Toggle label="Encryption notifications" detail="Alert me after sensitive actions" /><Toggle label="Session reminders" detail="Notify me about active sessions" /></section></div></>;
}

function Toggle({ label, detail }) {
  const [on, setOn] = useState(label === 'Encryption notifications');
  return <div className="toggle-row"><div><strong>{label}</strong><span>{detail}</span></div><button className={`toggle ${on ? 'on' : ''}`} onClick={() => setOn(!on)} aria-label={label}><i></i></button></div>;
}

createRoot(document.getElementById('root')).render(<App />);
