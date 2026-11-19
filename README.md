# Grian UI dashboard mockups

HTML mockups for the Telemetry dashboards of [Grian UI](https://opendev.org/openstack/grian-ui),
the Horizon plugin that shows OpenStack telemetry (Ceilometer → Prometheus, read through Aetos).

They are design mockups, not the implementation. Each page is a single HTML file that looks like
Horizon (Bootstrap 3, Font Awesome 4, Chart.js 4.4.1) and can be opened directly in a browser.

## Viewing

Open any `.html` file in a browser. The pages load Bootstrap, Font Awesome and Chart.js from a CDN,
so an internet connection is needed. The sidebar links the pages of each side to each other.

The yellow banner at the top of each page switches between data sets:

- **Real data:** a snapshot of a DevStack cloud (2026-11-18), read through Aetos and the OpenStack
  APIs, as `demo/demo` for the project pages and as `admin` for the admin pages. Stored in
  `project-demo-data.js` and `admin-demo-data.js`. The cloud is small (one host, five instances), so
  some states can't be shown with it.
- **Sample:** invented data for larger clouds and problem states (full quotas, slow hosts, outages,
  services down). Always labelled "Sample" in the banner.

Add `?scn=<name>` to a URL to open a scenario directly; the names are the `data-scn` values of the
banner buttons (for example `admin-network-health.html?scn=outage`).

Every page ends with a **How this page is calculated** section that lists the queries and thresholds.

## Admin → Telemetry

For cloud operators (admin role); every page covers all projects.

| Page | Question it answers | Status |
|---|---|---|
| [`compute-host-health-v2.html`](compute-host-health-v2.html) | Is any compute node overloaded? | Implemented, under review |
| [`instance-health.html`](instance-health.html) | Which VMs are in trouble right now? | Implemented, not yet submitted |
| [`admin-storage-health.html`](admin-storage-health.html) | Is block storage healthy, and when does it run out? Rework of the existing Volume Metrics panel; a checkbox marks NEW and CHANGED sections. | Proposed |
| [`admin-top-consumers.html`](admin-top-consumers.html) | Who is using the cloud's resources? | Proposed |
| [`admin-network-health.html`](admin-network-health.html) | Is the network healthy, and is a problem the platform's or one project's? | Proposed |
| [`admin-provisioning.html`](admin-provisioning.html) | Are new instances getting slower to boot, or failing? | Proposed |

## Project → Telemetry

For members of a project; every page shows only the current project (Aetos multitenancy).

| Page | Question it answers |
|---|---|
| [`project-compute.html`](project-compute.html) | How much compute quota is left, what holds it, and are my instances the right size and healthy? |
| [`project-storage.html`](project-storage.html) | How much volume quota is left, and what can be cleaned up? |
| [`project-network.html`](project-network.html) | Is my network working, and if not, is it me or the cloud? |
| [`project-usage.html`](project-usage.html) | What did my project hold and actually use this month? |
| [`project-instance-metrics.html`](project-instance-metrics.html) | What is this one instance doing? (opened from the other pages) |

All project pages are proposed.

## Other files

| File | What it is |
|---|---|
| `project-common.css`, `project-common.js` | Shared styles and helpers (cards, quota bars, charts, sample data) |
| `admin-common.js` | Shared admin sidebar and categorical palette |
| `project-demo-data.js`, `admin-demo-data.js` | The real DevStack snapshots |
| `compute-host-health.html` | First version of Compute Host Health, superseded by v2 |
| `poc-compute-host-health-*.png` | Screenshots of early proof-of-concept work |

## Design notes

- Status colours are Horizon's Bootstrap 3 contextual colours and always come with an icon and a word.
- Series colours were checked with a palette validator for colour-vision deficiencies and contrast:
  `#337ab7` / `#b0417a` for two series, and `#337ab7`, `#eb6834`, `#1baf7a`, `#b0417a`, `#6250d6`
  plus grey for "top 5 + Other".
- Panels are bounded ("max 25 rows", "top 10", "max 2000 points") so pages stay fast whatever the
  cloud size.
