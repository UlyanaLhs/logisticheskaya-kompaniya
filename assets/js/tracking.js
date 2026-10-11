/**
 * NEXORA LOGISTICS — SHIPMENT TRACKING MODULE
 * Interactive tracking interface with demo records, URL search support, and API integration hooks.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTrackingSearch();
  parseTrackingUrlParams();
});

// Curated Demonstration Shipment Database
const DEMO_SHIPMENTS = {
  'NEX-849201': {
    id: 'NEX-849201',
    mode: 'Multimodal (Ocean & Rail)',
    status: 'In Transit',
    statusClass: 'status-transit',
    service: 'Standard Intermodal Freight',
    origin: 'Rotterdam Port Terminal, Netherlands',
    destination: 'Munich Logistics Park, Germany',
    sender: 'North Sea Marine Logistics B.V.',
    receiver: 'Bavaria Industrial Fabrication GmbH',
    pieces: '1 x 40ft High Cube Container (TGHU-918230)',
    weight: '18,450 kg',
    estDelivery: 'Tomorrow, 16:30 CEST',
    milestones: [
      {
        title: 'Intermodal Rail Departure',
        location: 'Duisburg Intermodal Rail Yard, DE',
        time: 'Today, 06:15 CET',
        desc: 'Cargo transferred to dedicated electric freight locomotive #482-901 bound for Munich terminal.',
        completed: true,
        current: true
      },
      {
        title: 'Inland Terminal Clearance & Transfer',
        location: 'Port of Rotterdam Maasvlakte, NL',
        time: 'Yesterday, 18:40 CET',
        desc: 'Customs transit document T1 validated. Container dispatched via feeder rail connection.',
        completed: true,
        current: false
      },
      {
        title: 'Vessel Unloading & Quay Inspection',
        location: 'ECT Delta Terminal Rotterdam, NL',
        time: '2 days ago, 09:20 CET',
        desc: 'Vessel discharge completed. Physical seal verified intact.',
        completed: true,
        current: false
      },
      {
        title: 'Shipment Registered & Origin Booking Confirmed',
        location: 'Rotterdam Logistics Desk, NL',
        time: '4 days ago, 14:00 CET',
        desc: 'Electronic Bill of Lading generated and assigned.',
        completed: true,
        current: false
      }
    ]
  },
  'NEX-104928': {
    id: 'NEX-104928',
    mode: 'Air Freight Priority',
    status: 'Customs Cleared',
    statusClass: 'status-cleared',
    service: 'Express Air Cargo Transatlantic',
    origin: 'Chicago O\'Hare International (ORD), USA',
    destination: 'Frankfurt Airport Hub (FRA), Germany',
    sender: 'Midwest Precision Components Corp.',
    receiver: 'Rhein-Main Technologie AG',
    pieces: '4 Skids / Euro-pallets',
    weight: '1,280 kg',
    estDelivery: 'Today, 18:00 CET',
    milestones: [
      {
        title: 'Import Customs Cleared & Depot Transfer',
        location: 'CargoCity South, Frankfurt (FRA), DE',
        time: 'Today, 11:20 CET',
        desc: 'Import declaration accepted under code EU-EXP-2026. Handover to regional delivery dispatcher.',
        completed: true,
        current: true
      },
      {
        title: 'Flight Arrival & Ramp Discharge',
        location: 'Frankfurt Airport Terminal 4, DE',
        time: 'Today, 05:45 CET',
        desc: 'Flight NX-942 landed safely. Pallets offloaded to temperature-controlled air freight apron.',
        completed: true,
        current: false
      },
      {
        title: 'Flight Departure',
        location: 'Chicago O\'Hare (ORD), US',
        time: 'Yesterday, 17:15 CST',
        desc: 'Direct transatlantic cargo flight in air.',
        completed: true,
        current: false
      },
      {
        title: 'Air Waybill Issued & Security Screening',
        location: 'Chicago Freight Center, US',
        time: 'Yesterday, 10:30 CST',
        desc: 'X-ray inspection passed, AWB #020-8910240 assigned.',
        completed: true,
        current: false
      }
    ]
  },
  'NEX-552190': {
    id: 'NEX-552190',
    mode: 'Dedicated Road Freight (FTL)',
    status: 'Arrived at Hub',
    statusClass: 'status-hub',
    service: 'Full Truckload Continental Direct',
    origin: 'Lyon Industrial Zone, France',
    destination: 'Madrid South Logistics Platform, Spain',
    sender: 'Rhône Manufacturing Solutions SAS',
    receiver: 'Iberia Automoción Distribución SL',
    pieces: '33 Euro-pallets (Full Trailer)',
    weight: '21,600 kg',
    estDelivery: 'Tomorrow, 09:00 CET',
    milestones: [
      {
        title: 'Arrived at Cross-Dock Hub',
        location: 'Zaragoza Logistics Depot, ES',
        time: 'Today, 08:30 CET',
        desc: 'Driver mandatory rest break completed; vehicle safety inspection performed.',
        completed: true,
        current: true
      },
      {
        title: 'Border Crossing / Transit Toll Gate',
        location: 'La Jonquera Border Checkpoint, ES/FR',
        time: 'Yesterday, 23:15 CET',
        desc: 'Crossed into Spain territory via AP-7 highway corridor.',
        completed: true,
        current: false
      },
      {
        title: 'Departed Shipper Facility',
        location: 'Lyon Hub East, FR',
        time: 'Yesterday, 14:00 CET',
        desc: 'Driver verified secure strap lashing and CMR documentation signed.',
        completed: true,
        current: false
      }
    ]
  }
};

function parseTrackingUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const trackId = params.get('track');
  if (trackId) {
    const input = document.getElementById('tracking-number-input');
    if (input) {
      input.value = trackId;
      executeTrackingLookup(trackId);
    }
  }
}

function initTrackingSearch() {
  const form = document.getElementById('tracking-lookup-form');
  const input = document.getElementById('tracking-number-input');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim().toUpperCase();
      if (!query) {
        if (window.NEXORA?.showToast) {
          window.NEXORA.showToast('Please enter a tracking or reference code.', 'warning');
        }
        return;
      }
      executeTrackingLookup(query);
    });
  }

  // Sample number pill clicks
  document.querySelectorAll('.sample-ref-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      if (code && input) {
        input.value = code;
        executeTrackingLookup(code);
      }
    });
  });
}

function executeTrackingLookup(code) {
  const resultsContainer = document.getElementById('tracking-results-area');
  if (!resultsContainer) return;

  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Clean code formatting
  const normalized = code.trim().toUpperCase();
  const shipment = DEMO_SHIPMENTS[normalized];

  if (shipment) {
    renderShipmentDetails(shipment, resultsContainer);
  } else {
    renderUnknownShipment(normalized, resultsContainer);
  }
}

function renderShipmentDetails(shipment, container) {
  let milestonesHtml = shipment.milestones.map((m, idx) => `
    <div class="timeline-item ${m.completed ? 'completed' : ''} ${m.current ? 'current' : ''}">
      <div class="timeline-marker">
        ${m.current ? '<svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="6"/></svg>' : (m.completed ? '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : '•')}
      </div>
      <div class="timeline-content">
        <div class="timeline-header">
          <span class="timeline-title">${m.title}</span>
          <span class="timeline-time">${m.time}</span>
        </div>
        <div style="font-size: 11px; color: var(--color-accent); font-family: var(--font-mono); margin-bottom: 4px;">📍 ${m.location}</div>
        <p class="timeline-desc">${m.desc}</p>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="card" style="border-color: var(--border-medium); background: var(--color-surface-1);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 20px; margin-bottom: 24px;">
        <div>
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <span class="demo-badge">Sample Demo Record</span>
            <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-muted);">${shipment.mode}</span>
          </div>
          <h2 style="font-size: 26px; font-family:var(--font-mono); color: #FFF; margin:0;">${shipment.id}</h2>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Service Type: <strong>${shipment.service}</strong></div>
        </div>
        <div style="text-align: right;">
          <div style="display:inline-block; padding: 6px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight:700; background: rgba(56, 189, 248, 0.15); color: var(--color-accent); border: 1px solid var(--border-strong);">
            STATUS: ${shipment.status.toUpperCase()}
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">Est. Arrival: <strong style="color:#FFF;">${shipment.estDelivery}</strong></div>
        </div>
      </div>

      <!-- Route Overview Strip -->
      <div style="display:grid; grid-template-columns: 1fr auto 1fr; gap:16px; align-items:center; background:var(--color-surface-2); padding:18px; border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-bottom:24px;">
        <div>
          <div style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-family:var(--font-mono);">Origin</div>
          <div style="font-size:15px; font-weight:700; color:#FFF; margin-top:2px;">${shipment.origin}</div>
          <div style="font-size:12px; color:var(--text-subtle); margin-top:2px;">Shipper: ${shipment.sender}</div>
        </div>
        <div style="color:var(--color-accent); display:flex; align-items:center; justify-content:center;">
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </div>
        <div>
          <div style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-family:var(--font-mono);">Destination</div>
          <div style="font-size:15px; font-weight:700; color:#FFF; margin-top:2px;">${shipment.destination}</div>
          <div style="font-size:12px; color:var(--text-subtle); margin-top:2px;">Consignee: ${shipment.receiver}</div>
        </div>
      </div>

      <!-- Shipment Specs Grid -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:12px; margin-bottom: 28px; padding: 14px; background:var(--color-midnight); border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
        <div>
          <div style="font-size:11px; color:var(--text-muted);">Cargo Units</div>
          <div style="font-size:13px; font-weight:600; color:#FFF; margin-top:2px;">${shipment.pieces}</div>
        </div>
        <div>
          <div style="font-size:11px; color:var(--text-muted);">Gross Weight</div>
          <div style="font-size:13px; font-weight:600; color:#FFF; margin-top:2px;">${shipment.weight}</div>
        </div>
        <div>
          <div style="font-size:11px; color:var(--text-muted);">Data Stream</div>
          <div style="font-size:13px; font-weight:600; color:#10B981; margin-top:2px;">• Active Sensor Feed</div>
        </div>
        <div>
          <div style="font-size:11px; color:var(--text-muted);">Customs Status</div>
          <div style="font-size:13px; font-weight:600; color:#38BDF8; margin-top:2px;">Cleared / In Compliance</div>
        </div>
      </div>

      <!-- Activity Timeline -->
      <h3 style="font-size: 16px; margin-bottom: 12px; color: #FFF; display:flex; align-items:center; gap:8px;">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Operational Checkpoints & Milestones
      </h3>
      <div class="timeline">
        ${milestonesHtml}
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="font-size: 12px; color: var(--text-muted);">
          *This record is an interactive demonstration. Real-time carrier feeds link via Project44, FourKites or EDI 214.
        </div>
        <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${shipment.id}'); window.NEXORA?.showToast('Reference copied: ${shipment.id}', 'info');">
          Copy Reference
        </button>
      </div>
    </div>
  `;
}

function renderUnknownShipment(query, container) {
  container.innerHTML = `
    <div class="card" style="border-color: rgba(239, 68, 68, 0.3); background: var(--color-surface-1); text-align: center; padding: 40px 24px;">
      <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(239, 68, 68, 0.12); border: 1px solid var(--color-danger); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--color-danger);">
        <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <h3 style="font-size: 20px; color: #FFF; margin-bottom: 8px;">Reference Not Found</h3>
      <p style="color: var(--text-muted); font-size: 14px; max-width: 500px; margin: 0 auto 20px;">
        No active shipment record matching <code style="background:var(--color-surface-2); padding:2px 6px; border-radius:4px; color:var(--color-accent); font-family:var(--font-mono);">${query}</code> was located in our demonstration registry.
      </p>
      
      <div style="background: var(--color-surface-2); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; max-width: 500px; margin: 0 auto 24px; text-align: left; font-size: 13px;">
        <div style="font-weight: 600; color: #FFF; margin-bottom: 6px;">Try testing one of these sample demonstration IDs:</div>
        <ul style="display:flex; flex-direction:column; gap:6px; color:var(--text-secondary);">
          <li><code style="color:var(--color-accent); font-family:var(--font-mono);">NEX-849201</code> — Ocean & Rail Multimodal (Rotterdam → Munich)</li>
          <li><code style="color:var(--color-accent); font-family:var(--font-mono);">NEX-104928</code> — Priority Air Cargo (Chicago → Frankfurt)</li>
          <li><code style="color:var(--color-accent); font-family:var(--font-mono);">NEX-552190</code> — Full Truckload Road Freight (Lyon → Madrid)</li>
        </ul>
      </div>

      <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
        <a href="contact.html" class="btn btn-secondary btn-sm">Contact Operations Desk</a>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('tracking-number-input').value='NEX-849201'; document.getElementById('tracking-lookup-form').dispatchEvent(new Event('submit'));">
          Load Sample NEX-849201
        </button>
      </div>
    </div>
  `;
}
