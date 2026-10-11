/**
 * NEXORA LOGISTICS — FREIGHT QUOTATION SYSTEM
 * Handles validation, volumetric calculation, URL pre-fill, and demo submission state.
 */

document.addEventListener('DOMContentLoaded', () => {
  initQuoteForm();
  parseUrlParameters();
  initVolumetricCalculator();
});

/**
 * Pre-fill fields from URL query parameters (e.g., from Industry or Service CTAs)
 */
function parseUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  
  const modeParam = params.get('mode');
  if (modeParam) {
    const radio = document.querySelector(`input[name="transport_mode"][value="${modeParam}"]`);
    if (radio) radio.checked = true;
  }

  const industryParam = params.get('industry');
  if (industryParam) {
    const cargoInput = document.getElementById('cargo_description');
    if (cargoInput && !cargoInput.value) {
      const industryNames = {
        'automotive': 'Automotive components & replacement parts',
        'manufacturing': 'Industrial machinery & fabricated parts',
        'retail': 'Retail packaged merchandise & consumer goods',
        'technology': 'Consumer electronics & telecom hardware',
        'healthcare': 'Diagnostic equipment & clinical lab supplies (ambient)',
        'wholesale': 'Palletized bulk wholesale distribution cargo'
      };
      cargoInput.value = industryNames[industryParam] || `${industryParam.toUpperCase()} cargo requirements`;
    }
  }

  const originParam = params.get('origin');
  if (originParam) {
    const originInput = document.getElementById('origin_location');
    if (originInput) originInput.value = originParam;
  }

  const destParam = params.get('dest');
  if (destParam) {
    const destInput = document.getElementById('dest_location');
    if (destInput) destInput.value = destParam;
  }
}

/**
 * Real-time Volumetric & CBM Estimator
 */
function initVolumetricCalculator() {
  const lengthInput = document.getElementById('dim_length');
  const widthInput = document.getElementById('dim_width');
  const heightInput = document.getElementById('dim_height');
  const piecesInput = document.getElementById('cargo_pieces');
  const calcOutput = document.getElementById('volume_calc_output');

  if (!lengthInput || !widthInput || !heightInput || !calcOutput) return;

  function recalculate() {
    const l = parseFloat(lengthInput.value) || 0;
    const w = parseFloat(widthInput.value) || 0;
    const h = parseFloat(heightInput.value) || 0;
    const pieces = parseInt(piecesInput?.value, 10) || 1;

    if (l > 0 && w > 0 && h > 0) {
      // Dimensions in Centimeters
      const cbm = ((l * w * h) / 1000000) * pieces;
      const airVolWeight = ((l * w * h) / 6000) * pieces; // Standard IATA 1:6000
      const roadVolWeight = ((l * w * h) / 3000) * pieces; // Standard 1:3000

      calcOutput.innerHTML = `
        <div style="background: var(--color-surface-2); border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 12px; font-size: 12px; margin-top: 8px;">
          <div style="font-weight: 700; color: var(--color-accent); margin-bottom: 4px;">DIMENSIONAL ESTIMATE (${pieces} unit${pieces > 1 ? 's' : ''}):</div>
          <div style="display: flex; gap: 16px; flex-wrap: wrap; color: var(--text-secondary);">
            <span><strong>CBM:</strong> ${cbm.toFixed(2)} m³</span>
            <span><strong>Air Volumetric Wt:</strong> ~${airVolWeight.toFixed(1)} kg</span>
            <span><strong>Road Volumetric Wt:</strong> ~${roadVolWeight.toFixed(1)} kg</span>
          </div>
          <div style="font-size: 11px; color: var(--text-subtle); margin-top: 4px;">*Informational calculation only. Official billable weight confirmed during cargo measurement.</div>
        </div>
      `;
    } else {
      calcOutput.innerHTML = '';
    }
  }

  [lengthInput, widthInput, heightInput, piecesInput].forEach(inp => {
    inp?.addEventListener('input', recalculate);
  });
}

/**
 * Freight Quote Form Submission and Validation
 */
function initQuoteForm() {
  const form = document.getElementById('freight-quote-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset validation states
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    let isValid = true;

    // Required fields check
    const requiredIds = [
      'company_name',
      'contact_name',
      'business_email',
      'origin_location',
      'dest_location',
      'cargo_description'
    ];

    requiredIds.forEach(id => {
      const field = document.getElementById(id);
      if (field && !field.value.trim()) {
        field.classList.add('is-invalid');
        isValid = false;
      }
    });

    // Email format validation
    const emailField = document.getElementById('business_email');
    if (emailField && emailField.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value.trim())) {
        emailField.classList.add('is-invalid');
        isValid = false;
      }
    }

    // Privacy Consent
    const consent = document.getElementById('privacy_consent');
    if (consent && !consent.checked) {
      consent.closest('.checkbox-group')?.classList.add('is-invalid');
      isValid = false;
    }

    if (!isValid) {
      const firstInvalid = form.querySelector('.is-invalid');
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid?.focus();
      if (window.NEXORA?.showToast) {
        window.NEXORA.showToast('Please complete all required fields accurately.', 'warning');
      }
      return;
    }

    // Collect Form Data
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => { data[key] = val; });

    // Generate Demo Quote Reference ID
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const quoteRef = `NXQ-${dateStr}-${randomHex}`;

    // Render Confirmation Modal
    renderQuoteModal(quoteRef, data);
  });
}

function renderQuoteModal(refId, data) {
  let modal = document.getElementById('quote-result-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quote-result-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-box" style="max-width: 640px;">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(16,185,129,0.15);border:1px solid #10B981;display:flex;align-items:center;justify-content:center;color:#10B981;">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div>
            <h3 class="modal-title" style="font-size: 18px; margin:0;">Quote Request Generated</h3>
            <span class="demo-badge" style="margin-top:2px;">Demonstration Mode</span>
          </div>
        </div>
        <button class="modal-close" onclick="window.NEXORA.closeModal('quote-result-modal')">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div style="background: var(--color-surface-2); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono);">Quotation Reference:</div>
        <div style="font-size: 22px; font-weight: 800; color: var(--color-accent); font-family: var(--font-mono);">${refId}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; margin-bottom: 20px;">
        <div><strong style="color:var(--text-muted)">Origin:</strong> <span style="color:#FFF;">${data.origin_location || 'Not specified'}</span></div>
        <div><strong style="color:var(--text-muted)">Destination:</strong> <span style="color:#FFF;">${data.dest_location || 'Not specified'}</span></div>
        <div><strong style="color:var(--text-muted)">Mode:</strong> <span style="color:#FFF;text-transform:capitalize;">${data.transport_mode || 'Standard Multimodal'}</span></div>
        <div><strong style="color:var(--text-muted)">Estimated Weight:</strong> <span style="color:#FFF;">${data.cargo_weight || 'TBD'} kg</span></div>
        <div><strong style="color:var(--text-muted)">Company:</strong> <span style="color:#FFF;">${data.company_name || 'N/A'}</span></div>
        <div><strong style="color:var(--text-muted)">Contact:</strong> <span style="color:#FFF;">${data.contact_name || 'N/A'}</span></div>
      </div>

      <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; margin-bottom: 20px;">
        <h4 style="font-size: 13px; color: #F8FAFC; margin-bottom: 6px;">Operational Notice</h4>
        <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin:0;">
          This demonstration system creates formatted quotation records without transmitting client data to external servers. For production deployment, configure the backend webhook in <code>assets/js/quote.js</code> (e.g., Formspree, n8n webhook, or corporate ERP endpoint).
        </p>
      </div>

      <div style="display:flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary btn-sm" onclick="downloadQuoteJSON('${refId}', ${JSON.stringify(data).replace(/"/g, '&quot;')})">Download Request (JSON)</button>
        <button class="btn btn-primary btn-sm" onclick="window.NEXORA.closeModal('quote-result-modal')">Close Window</button>
      </div>
    </div>
  `;

  window.NEXORA.openModal('quote-result-modal');
}

window.downloadQuoteJSON = function(refId, data) {
  const exportData = {
    reference_id: refId,
    timestamp: new Date().toISOString(),
    status: "DEMO_PENDING_DISPATCH_REVIEW",
    payload: data
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${refId}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (window.NEXORA?.showToast) {
    window.NEXORA.showToast(`Quote specifications downloaded (${refId}.json)`, 'success');
  }
};
