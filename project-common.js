// Shared helpers for the Project → Telemetry mockups.
// Two data sets:
//   DEMO   (project-demo-data.js): real snapshot of the DevStack "demo" project, 2026-11-18.
//   SAMPLE (below): an invented larger project, clearly labelled as sample data in the UI,
//          to show states the small dev cloud can't produce (full quotas, many instances, outages).

// ---------- colours ----------
// Status colours = Bootstrap 3 contextual colours, as in the admin mockups (always with icon + text).
// Series: #337ab7 (primary; "in", "read", "used") and #b0417a (second series; "out", "write").
// The pair was checked with the dataviz palette validator: CVD ΔE 10.7, normal-vision ΔE 21.8, contrast ≥ 3:1.
const C = { blue: '#337ab7', blueFill: 'rgba(51,122,183,.12)', mag: '#b0417a', ok: '#5cb85c', warn: '#f0ad4e',
  crit: '#d9534f', grey: '#999', light: '#9bbbd9', info: '#5bc0de' };

// ---------- frame ----------
function chrome(active) {
  document.getElementById('topbar').innerHTML =
    '<span class="brand">openstack.</span> <i class="fa fa-cube"></i> demo ▾ <span class="pull-right"><i class="fa fa-user"></i> demo ▾</span>';
  const link = (k, t) => `<a href="project-${k}.html" class="${active === k ? 'active' : ''}">${t}</a>`;
  document.getElementById('sidebar').innerHTML = `
    <div class="grp">Project</div>
    <a>API Access</a>
    <div class="grp sub">Compute</div><div class="grp sub">Volumes</div><div class="grp sub">Network</div>
    <div class="grp sub">Telemetry</div>
    ${link('compute', 'Compute')}${link('storage', 'Storage')}${link('network', 'Network')}${link('usage', 'Usage')}
    <div class="grp">Identity</div>`;
}

// Scenario buttons in the mockup banner. onChange(key) is called with the data-scn value.
function scenarios(onChange) {
  const btns = [...document.querySelectorAll('.mock-banner [data-scn]')];
  btns.forEach(b => b.onclick = () => { btns.forEach(x => x.classList.toggle('active', x === b)); onChange(b.dataset.scn); });
  const want = new URLSearchParams(location.search).get('scn');   // e.g. ?scn=sample, for screenshots and links
  const first = btns.find(b => b.dataset.scn === want) || btns.find(b => b.classList.contains('active')) || btns[0];
  btns.forEach(x => x.classList.toggle('active', x === first));
  onChange(first.dataset.scn);
}

// ---------- formatting ----------
const pct = (a, b) => b > 0 ? Math.round(100 * a / b) : 0;
function fmtBytes(b, d = 1) {
  if (b == null) return '—';
  const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0;
  while (Math.abs(b) >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(i ? d : 0)} ${u[i]}`;
}
const fmtRate = b => b == null ? '—' : fmtBytes(b) + '/s';
const fmtMiB = m => m >= 1024 ? `${(m / 1024).toFixed(m % 1024 ? 1 : 0)} GB` : `${Math.round(m)} MB`;
const clockLabel = t => { const d = new Date(t * 1000); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); };
const dayLabel = t => { const d = new Date(t * 1000); return `${d.getMonth() + 1}/${d.getDate()}`; };

const SEV = { 3: ['danger', 'exclamation-circle', 'Critical'], 2: ['warning', 'exclamation-triangle', 'Warning'], 1: ['default', 'info-circle', 'Info'], 0: ['success', 'check-circle', 'OK'] };
const badge = s => `<span class="label label-${SEV[s][0]}"><i class="fa fa-${SEV[s][1]}"></i> ${SEV[s][2]}</span>`;
const statusText = s => ({ ACTIVE: `<span class="sw" style="background:${C.ok}"></span>ACTIVE`, SHUTOFF: `<span class="sw" style="background:${C.grey}"></span>SHUTOFF`,
  ERROR: `<span class="sw" style="background:${C.crit}"></span>ERROR`, DOWN: `<span class="sw" style="background:${C.crit}"></span>DOWN` }[s] || s);

function card(cls, icon, val, label, sub, cols = 'col-lg-3 col-md-6 col-sm-6') {
  return `<div class="${cols}"><div class="panel ${cls} metric-card"><div class="panel-heading">
    <i class="fa fa-${icon} metric-icon"></i><div class="text-right" style="flex:1"><div class="metric-value">${val}</div>
    <div class="metric-label">${label}</div><div class="metric-sub">${sub}</div></div></div></div></div>`;
}
const levelCls = (p, w = 75, c = 90) => p >= c ? 'panel-red' : p >= w ? 'panel-yellow' : 'panel-green';

// Quota row: segments = [{v, color, label}], limit, unit formatter, forecast text.
function quotaRow(name, segs, limit, fmt, fc) {
  const used = segs.reduce((a, s) => a + s.v, 0), p = pct(used, limit);
  const bar = segs.filter(s => s.v > 0).map(s => `<div class="seg" style="flex:0 0 ${100 * s.v / limit}%;background:${s.color}"
      title="${s.label}: ${fmt(s.v)}"></div>`).join('');
  const valCls = p >= 90 ? 'text-danger' : p >= 75 ? 'text-warning' : '';
  return `<div class="quota-row"><div class="q-name">${name}</div><div class="q-bar" role="img" aria-label="${name}: ${fmt(used)} of ${fmt(limit)} used">${bar}</div>
    <div class="q-val"><strong class="${valCls}">${fmt(used)}</strong> / ${fmt(limit)} <span class="text-muted">(${p}%)</span></div>
    <div class="q-fc">${fc || ''}</div></div>`;
}
const fcText = (days, enoughHistory = true) => !enoughHistory ? '<span class="text-muted"><i class="fa fa-hourglass-half"></i> Not enough history</span>'
  : days == null ? '<span class="text-success"><i class="fa fa-check"></i> Not growing</span>'
  : days <= 14 ? `<span class="text-danger"><i class="fa fa-exclamation-circle"></i> Full in ~${days} days</span>`
  : days <= 30 ? `<span class="text-warning"><i class="fa fa-exclamation-triangle"></i> Full in ~${days} days</span>`
  : `<span class="text-muted"><i class="fa fa-clock-o"></i> Full in ~${days} days</span>`;

// ---------- charts ----------
let CHARTS = [];
function resetCharts() { CHARTS.forEach(c => c.destroy()); CHARTS = []; }
function lineChart(el, labels, datasets, { unit = '', max, min = 0, stacked = false, tickFmt } = {}) {
  const ch = new Chart(el, { type: 'line', data: { labels, datasets: datasets.map(d => ({ pointRadius: 0, pointHoverRadius: 4, borderWidth: 2,
      tension: .25, spanGaps: false, fill: false, ...d })) },
    options: { maintainAspectRatio: false, animation: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.parsed.y == null ? '—' : (tickFmt ? tickFmt(c.parsed.y) : (+c.parsed.y.toFixed(2)) + unit)}` } } },
      scales: { y: { min, max, stacked, ticks: { maxTicksLimit: 5, callback: v => tickFmt ? tickFmt(v) : v + unit }, grid: { color: '#f0f0f0' } },
        x: { ticks: { maxTicksLimit: 6, autoSkip: true }, grid: { display: false } } } } });
  CHARTS.push(ch); return ch;
}
function spark(el, data, color = C.blue, max) {
  const ch = new Chart(el, { type: 'line', data: { labels: data.map(() => ''), datasets: [{ data, borderWidth: 1.5, pointRadius: 0, tension: .3, fill: false, borderColor: color, spanGaps: false }] },
    options: { responsive: false, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false, min: 0, max } } } });
  CHARTS.push(ch); return ch;
}
const refLine = (label, v, n, color = C.grey) => ({ label, data: Array(n).fill(v), borderColor: color, borderDash: [5, 4], borderWidth: 1, pointRadius: 0, pointHoverRadius: 0 });
function legend(items) {
  return '<div class="chart-legend">' + items.map(([label, color, dash]) => `<span><span class="ln ${dash ? 'dash' : ''}" style="border-color:${color}"></span>${label}</span>`).join('') + '</div>';
}

// Real series: DEMO.series[metric][instance] = [[t, v], ...]. Returns {labels, values} aligned on a common time grid.
function demoGrid() {
  // Subquery points sit on multiples of the step, so align the grid to it.
  const step = DEMO.series_step, start = Math.ceil(DEMO.series_start / step) * step, n = Math.floor(12 * 3600 / step) + 1;
  return Array.from({ length: n }, (_, i) => start + i * step);
}
function demoSeries(metric, inst, grid) {
  const pts = new Map((DEMO.series[metric]?.[inst] || []).map(([t, v]) => [Math.round(t / 60), v]));
  return grid.map(t => pts.has(Math.round(t / 60)) ? pts.get(Math.round(t / 60)) : null);
}
const avg = a => { const v = a.filter(x => x != null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
const last = a => { for (let i = a.length - 1; i >= 0; i--) if (a[i] != null) return a[i]; return null; };

// ---------- sample data (invented, labelled "sample" in the UI) ----------
let _s = 11; const rnd = () => (_s = (_s * 16807) % 2147483647, (_s - 1) / 2147483646);
function noisy(level, n, wiggle = .12, trend = 0) {
  return Array.from({ length: n }, (_, i) => Math.max(0, +(level * (1 + trend * (i / n - 1)) * (1 + (rnd() - .5) * 2 * wiggle) + level * .08 * Math.sin(i / 4)).toFixed(3)));
}
const FLAVORS = { 'm1.tiny': [1, 512, 1], 'm1.small': [1, 2048, 20], 'm1.medium': [2, 4096, 40], 'm1.large': [4, 8192, 80], 'm1.xlarge': [8, 16384, 160] };
function sampleServer(name, flavor, status, cpu, mem, extra = {}) {
  const [vcpus, ram, disk] = FLAVORS[flavor];
  return { name, id: Math.floor(rnd() * 0xffffffff).toString(16).padStart(8, '0') + '-' + Math.floor(rnd() * 0xffff).toString(16).padStart(4, '0') + '-4abc-9def-0123456789ab',
    flavor, vcpus, ram_mib: ram, disk_gb: disk, status, cpu, mem, swap: 0, cpuWait: .01, diskUsed: .35 + rnd() * .3, ...extra };
}
const SAMPLE = {
  project: { name: 'web-shop' },
  servers: [
    ...[1, 2, 3, 4, 5, 6].map(i => sampleServer(`web-0${i}`, 'm1.small', 'ACTIVE', .45 + rnd() * .2, .55 + rnd() * .15, { network: 'frontend' })),
    ...[1, 2, 3].map(i => sampleServer(`api-0${i}`, 'm1.medium', 'ACTIVE', .86 + rnd() * .08, .6 + rnd() * .1, { network: 'backend', cpuWait: .02 })),
    sampleServer('db-01', 'm1.large', 'ACTIVE', .32, .93, { network: 'backend', swap: 3.2 }),
    sampleServer('cache-01', 'm1.medium', 'ACTIVE', .02, .14, { network: 'backend' }),
    sampleServer('batch-01', 'm1.xlarge', 'ACTIVE', .03, .08, { network: 'batch' }),
    sampleServer('batch-02', 'm1.xlarge', 'ACTIVE', .01, .06, { network: 'batch' }),
    sampleServer('bastion', 'm1.tiny', 'ACTIVE', .03, .4, { network: 'frontend', fip: '203.0.113.20' }),
    sampleServer('build-01', 'm1.large', 'SHUTOFF', null, null, { since: 23 }),
    sampleServer('old-test', 'm1.medium', 'ERROR', null, null, { since: 9, fault: 'No valid host was found.' }),
  ],
  quotaLimits: { instances: 20, cores: 50, ram_mib: 102400, volumes: 10, volume_gb: 1000, snapshots: 10, backups: 10, ports: 50, routers: 5, floating_ips: 10, security_groups: 10 },
  // used-cores history for the forecast (30 days, daily)
  coresHistory: Array.from({ length: 30 }, (_, i) => Math.round(30 + i * 11 / 29 + (i % 7 === 3 ? 1 : 0))),
  volumes: [
    { name: 'db-data', gb: 120, status: 'in-use', attached: 'db-01', age: 210 },
    { name: 'web-assets', gb: 50, status: 'in-use', attached: 'web-01', age: 180 },
    { name: 'logs-archive', gb: 300, status: 'available', attached: null, age: 95, idle: 41 },
    { name: 'old-test-vol', gb: 60, status: 'available', attached: null, age: 30, idle: 12 },
    { name: 'scratch', gb: 20, status: 'in-use', attached: 'batch-01', age: 60 },
  ],
  snapshots: [
    { name: 'db-data-2026-11-17', gb: 120, volume: 'db-data', age: 1 },
    { name: 'db-data-2026-09-01', gb: 120, volume: 'db-data', age: 78 },
    { name: 'web-assets-base', gb: 50, volume: 'web-assets', age: 120 },
  ],
  images: [
    { name: 'web-golden-2026-10', gb: 2.1, users: 6, age: 40 },
    { name: 'web-golden-2026-06', gb: 2.0, users: 0, age: 155 },
    { name: 'batch-worker', gb: 3.4, users: 2, age: 70 },
  ],
  routers: [{ name: 'shop-router', status: 'ACTIVE', networks: ['frontend', 'backend'], gateway: '203.0.113.5' },
            { name: 'batch-router', status: 'ACTIVE', networks: ['batch'], gateway: '203.0.113.6' }],
  floating_ips: [{ ip: '203.0.113.20', status: 'ACTIVE', target: 'bastion' }, { ip: '203.0.113.21', status: 'ACTIVE', target: 'web-01' },
                 { ip: '203.0.113.22', status: 'DOWN', target: null }],
};
SAMPLE.servers.forEach(s => { if (s.status === 'ACTIVE') { s.netIn = { web: 180e3, api: 90e3, db: 60e3, cache: 4e3, batch: 2e3, bastion: 1e3 }[s.name.split('-')[0]] * (0.8 + rnd() * .4); s.netOut = s.netIn * (0.6 + rnd() * .8); } });
