/**
 * NEXORA AI LOGISTICS ASSISTANT
 * Interactive floating AI assistant widget with offline contextual intelligence,
 * prompt suggestions, quoting hand-off, and live API connection hooks.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAssistantWidget();
});

function initAssistantWidget() {
  // Inject Assistant HTML if not present
  if (!document.getElementById('nexora-assistant-root')) {
    const root = document.createElement('div');
    root.id = 'nexora-assistant-root';
    root.innerHTML = `
      <div class="ai-assistant-widget">
        <button id="assistant-toggle-btn" class="assistant-trigger-btn" aria-label="Open NEXORA AI Logistics Assistant" aria-expanded="false">
          <div class="assistant-avatar">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div class="assistant-btn-text">
            <span class="assistant-btn-title">NEXORA AI</span>
            <span class="assistant-btn-status">Operational Assistant</span>
          </div>
        </button>

        <div id="assistant-chat-panel" class="assistant-panel" role="dialog" aria-label="NEXORA AI Logistics Assistant">
          <div class="assistant-header">
            <div class="assistant-header-info">
              <div class="assistant-avatar" style="width:28px;height:28px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div>
                <div class="assistant-header-title">NEXORA AI Assistant</div>
                <div class="assistant-header-sub">Automated Logistics Guidance</div>
              </div>
            </div>
            <button id="assistant-close-btn" class="assistant-close-btn" aria-label="Close Assistant">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="assistant-disclaimer">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Informational AI demo. Rates & bookings require human dispatch verification.</span>
          </div>

          <div id="assistant-chat-messages" class="assistant-messages">
            <!-- Messages rendered dynamically -->
          </div>

          <div class="assistant-footer">
            <form id="assistant-input-form" class="assistant-input-form">
              <input type="text" id="assistant-user-input" class="assistant-input" placeholder="Ask about routes, quoting, modes..." autocomplete="off">
              <button type="submit" class="assistant-send-btn" aria-label="Send message">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
  }

  const toggleBtn = document.getElementById('assistant-toggle-btn');
  const closeBtn = document.getElementById('assistant-close-btn');
  const panel = document.getElementById('assistant-chat-panel');
  const form = document.getElementById('assistant-input-form');
  const input = document.getElementById('assistant-user-input');
  const messagesBox = document.getElementById('assistant-chat-messages');

  let hasGreeted = false;

  // Toggle open/close
  toggleBtn.addEventListener('click', () => {
    const isOpen = panel.classList.contains('is-active');
    if (!isOpen) {
      panel.classList.add('is-active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (!hasGreeted) {
        showGreeting();
        hasGreeted = true;
      }
      setTimeout(() => input.focus(), 200);
    } else {
      panel.classList.remove('is-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('is-active');
    toggleBtn.setAttribute('aria-expanded', 'false');
  });

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    appendMessage('user', query);
    input.value = '';

    // Show typing state then respond
    simulateBotResponse(query);
  });

  function showGreeting() {
    appendMessage('bot', `Welcome to NEXORA. I'm your AI logistics assistant. I can help you explore transportation options, prepare a freight quotation request, or find shipment information. How can I help your business today?`, [
      "Request a freight quote",
      "Compare transport options",
      "Explore logistics services",
      "Track a shipment",
      "Speak with the team"
    ]);
  }

  function appendMessage(sender, text, suggestions = [], actionButton = null) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerHTML = `<div>${text}</div>`;

    if (actionButton) {
      const btnWrapper = document.createElement('div');
      btnWrapper.style.marginTop = '8px';
      btnWrapper.innerHTML = actionButton;
      bubble.appendChild(btnWrapper);
    }

    if (suggestions && suggestions.length > 0) {
      const sugContainer = document.createElement('div');
      sugContainer.className = 'chat-suggestions';
      suggestions.forEach(sug => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'suggestion-pill';
        pill.textContent = sug;
        pill.addEventListener('click', () => {
          appendMessage('user', sug);
          simulateBotResponse(sug);
        });
        sugContainer.appendChild(pill);
      });
      bubble.appendChild(sugContainer);
    }

    messagesBox.appendChild(bubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function simulateBotResponse(userText) {
    const q = userText.toLowerCase();

    // Typing simulation
    setTimeout(() => {
      let reply = "";
      let suggestions = [];
      let actionBtn = null;

      if (q.includes('quote') || q.includes('price') || q.includes('rate') || q.includes('cost')) {
        reply = `To prepare an accurate freight quotation, our coordination team needs basic shipment parameters: origin, destination, cargo type, approximate weight, and timeline. Note that rates depend on route capacity and require verification.`;
        suggestions = ["Open quote form", "Compare transport modes", "How is weight calculated?"];
        actionBtn = `<a href="quote.html" class="btn btn-primary btn-sm" style="font-size:12px;padding:6px 12px;">Go to Quotation Form →</a>`;
      } 
      else if (q.includes('compare') || q.includes('mode') || q.includes('options') || q.includes('air vs ocean')) {
        reply = `Here is how our primary modes compare:<br>
        • <strong>Air Freight:</strong> Fastest transit (1-5 days), ideal for high-value or urgent goods, higher cost per kg.<br>
        • <strong>Road Freight:</strong> Door-to-door flexibility across continental corridors (FTL/LTL).<br>
        • <strong>Ocean Freight:</strong> Most cost-efficient for heavy, high-volume containerized cargo (FCL/LCL).<br>
        • <strong>Rail & Multimodal:</strong> Balanced transit time and lower carbon emissions for land bridges.`;
        suggestions = ["Quote for Air Freight", "Quote for Ocean Freight", "Customs coordination"];
      } 
      else if (q.includes('track') || q.includes('status') || q.includes('where is')) {
        reply = `You can inspect live milestone checkpoints in our Shipment Tracking portal. In demonstration mode, you can test with sample codes <code>NEX-849201</code> (Ocean/Rail) or <code>NEX-104928</code> (Air Priority).`;
        suggestions = ["Track NEX-849201", "Track NEX-104928", "Contact dispatch"];
        actionBtn = `<a href="tracking.html?track=NEX-849201" class="btn btn-secondary btn-sm" style="font-size:12px;padding:6px 12px;">Open Sample Tracking →</a>`;
      }
      else if (q.includes('services') || q.includes('what do you do') || q.includes('transport')) {
        reply = `NEXORA coordinates Road Freight, Air Cargo, Ocean Container Shipping, Intermodal Rail, Warehousing & Fulfillment, Customs Coordination, and End-to-End Supply Chain Management.`;
        suggestions = ["Warehousing details", "Customs clearance", "Automotive logistics"];
        actionBtn = `<a href="services.html" class="btn btn-outline btn-sm" style="font-size:12px;padding:6px 12px;">Explore All Services →</a>`;
      }
      else if (q.includes('weight') || q.includes('cbm') || q.includes('volumetric') || q.includes('dimension')) {
        reply = `Freight carriers bill by either <em>gross weight</em> or <em>volumetric (chargeable) weight</em>, whichever is higher. For air cargo, IATA standard is 1 CBM ≈ 167 kg (L×W×H in cm ÷ 6000). You can test our built-in dimensional calculator directly on the quotation page!`;
        suggestions = ["Try CBM calculator", "Request freight quote"];
        actionBtn = `<a href="quote.html#volume-calc" class="btn btn-primary btn-sm" style="font-size:12px;padding:6px 12px;">Open Calculator on Quote Page</a>`;
      }
      else if (q.includes('team') || q.includes('contact') || q.includes('human') || q.includes('call') || q.includes('speak')) {
        reply = `Our logistics operations coordinators and sales specialists are available during business hours. You can send a direct inquiry or contact our regional coordination desks.`;
        actionBtn = `<a href="contact.html" class="btn btn-secondary btn-sm" style="font-size:12px;padding:6px 12px;">View Contact Desks →</a>`;
        suggestions = ["Request quote instead", "Tracking inquiry"];
      }
      else if (q.includes('incoterm') || q.includes('fob') || q.includes('cif') || q.includes('ddp')) {
        reply = `Incoterms define buyer and seller responsibilities. Common terms we coordinate include:<br>
        • <strong>FOB (Free on Board):</strong> Seller delivers goods on vessel; buyer pays freight & import.<br>
        • <strong>CIF (Cost, Insurance & Freight):</strong> Seller pays sea transit; buyer handles import customs.<br>
        • <strong>DDP (Delivered Duty Paid):</strong> Seller delivers to door with customs duties cleared.`;
        suggestions = ["Customs assistance", "Request a quote"];
      }
      else {
        reply = `Thank you for your question. As an AI demonstration assistant for NEXORA LOGISTICS, I can help you understand our transport services, prepare for a quotation request, or navigate shipment tracking. For binding operational agreements, our human coordination team is ready to assist.`;
        suggestions = ["Request a freight quote", "Compare transport modes", "Track sample shipment", "Contact team"];
      }

      appendMessage('bot', reply, suggestions, actionBtn);
    }, 400);
  }
}
