// Shared helpers for the Admin → Telemetry mockups. Load after project-common.js (reuses its
// formatting, cards and chart helpers) and admin-demo-data.js (ADM: real snapshot of the DevStack cloud).

// Sidebar: the same list on every admin mockup, in enabled-file order.
const ADMIN_PANELS = [
  ['chh', 'Compute Host Health', 'compute-host-health-v2.html'],
  ['ih', 'Instance Health', 'instance-health.html'],
  ['vol', 'Storage Health', 'admin-storage-health.html'],
  ['top', 'Top Consumers', 'admin-top-consumers.html'],
  ['net', 'Network Health', 'admin-network-health.html'],
  ['prov', 'Provisioning', 'admin-provisioning.html'],
];
function adminChrome(active) {
  document.getElementById('topbar').innerHTML =
    '<span class="brand">openstack.</span> <i class="fa fa-cube"></i> admin ▾ <span class="pull-right"><i class="fa fa-user"></i> admin ▾</span>';
  document.getElementById('sidebar').innerHTML = `
    <div class="grp">Project</div><div class="grp">Admin</div>
    <a>Overview</a><div class="grp sub">Compute</div><div class="grp sub">Volume</div><div class="grp sub">Network</div>
    <div class="grp sub">Telemetry</div>
    ${ADMIN_PANELS.map(([k, t, href]) => `<a href="${href}" class="${k === active ? 'active' : ''}">${t}</a>`).join('')}
    <div class="grp">Identity</div>`;
}

// Categorical palette for "top N + Other" (fixed order, never cycled). Validated with the dataviz
// palette validator in this adjacency order: CVD ΔE ≥ 9.2, normal-vision ΔE ≥ 20.2. Aqua is below
// 3:1 contrast, so every chart that uses it has a table with the same numbers next to it.
const CAT = ['#337ab7', '#eb6834', '#1baf7a', '#b0417a', '#6250d6'];
const OTHER = '#999999';
const hexA = (h, a) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`;

// Real 24 h series in ADM are [[t, v], ...] at 15 min steps.
const admLabels = s => s.map(([t]) => clockLabel(t));
const admValues = s => s.map(([, v]) => v);
const median = a => { const v = a.filter(x => x != null).sort((x, y) => x - y); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const quantile = (a, q) => { const v = a.filter(x => x != null).sort((x, y) => x - y); return v.length ? v[Math.min(v.length - 1, Math.floor(q * v.length))] : null; };

// Sample cloud for the admin samples: invented, labelled "sample" in the UI.
const SAMPLE_PROJECTS = ['web-shop', 'data-lake', 'ci-runners', 'ml-training', 'erp', 'analytics', 'mobile-api', 'staging', 'monitoring', 'backup', 'sandbox', 'hr-portal'];
