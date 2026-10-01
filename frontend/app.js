/**
 * Blacklight Enterprise Operations Portal Application Logic
 */

const CONFIG = {
  OPERATIONS_API: 'http://localhost:5183',
  HIVEMIND_MCP: 'http://127.0.0.1:5106/mcp',
  INKEEP_API: 'http://127.0.0.1:3002',
};

// State
let operations = [];
let isChatOpen = false;

// Initialize Lucide Icons
function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ==========================================
// 1. Health Checks
// ==========================================
async function checkHealth() {
  // Check Operations API
  try {
    const res = await fetch(`${CONFIG.OPERATIONS_API}/operations`, { method: 'GET' });
    updateHealthStatus('health-api', res.ok);
    updateHealthStatus('health-db', res.ok);
  } catch {
    updateHealthStatus('health-api', false);
    updateHealthStatus('health-db', false);
  }

  // Check Hivemind MCP
  try {
    const res = await fetch(`http://localhost:5106/health`, { method: 'GET' });
    updateHealthStatus('health-mcp', res.ok);
  } catch {
    // Fallback check
    try {
      const resFallback = await fetch(`http://127.0.0.1:5106/health`, { method: 'GET' });
      updateHealthStatus('health-mcp', resFallback.ok);
    } catch {
      updateHealthStatus('health-mcp', false);
    }
  }

  // Check Inkeep Agent Runtime
  try {
    const res = await fetch(`${CONFIG.INKEEP_API}/health`);
    updateHealthStatus('health-agent', res.ok);
  } catch {
    updateHealthStatus('health-agent', false);
  }
}

function updateHealthStatus(elementId, isHealthy) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const dot = el.querySelector('.status-dot');
  if (dot) {
    if (isHealthy) {
      dot.classList.remove('error');
    } else {
      dot.classList.add('error');
    }
  }
}

// ==========================================
// 2. Fetch & Render Operations
// ==========================================
async function fetchOperations() {
  const tbody = document.getElementById('operations-tbody');
  try {
    const res = await fetch(`${CONFIG.OPERATIONS_API}/operations`);
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    operations = Array.isArray(data) ? data : [];
    renderOperations(operations);
    updateStats(operations);
  } catch (error) {
    tbody.innerHTML = `
      <tr class="loading-row">
        <td colspan="5" style="color: var(--accent-rose);">
          ⚠️ Failed to connect to C# Operations API at ${CONFIG.OPERATIONS_API}
        </td>
      </tr>
    `;
  }
}

function renderOperations(list) {
  const tbody = document.getElementById('operations-tbody');
  if (!list || list.length === 0) {
    tbody.innerHTML = `
      <tr class="loading-row">
        <td colspan="5">No operations recorded yet. Use the AI Copilot to create one!</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list
    .map(
      (op) => `
    <tr>
      <td style="font-family: var(--font-mono); color: var(--primary); font-size: 0.8rem;">#${op.id || op.ID || '-'}</td>
      <td style="font-weight: 600; color: #fff;">${escapeHtml(op.name || op.Name || 'Unnamed')}</td>
      <td style="color: var(--text-muted); max-width: 400px;">${escapeHtml(op.description || op.Description || 'No description provided')}</td>
      <td style="font-size: 0.8rem; color: var(--text-dim);">${formatDate(op.createdAt || op.CreatedAt)}</td>
      <td><span class="badge-status">Active</span></td>
    </tr>
  `
    )
    .join('');
}

function updateStats(list) {
  document.getElementById('stat-total').textContent = list.length;
  document.getElementById('stat-active').textContent = list.length;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================
// 3. Create Operation Modal
// ==========================================
function setupModal() {
  const modal = document.getElementById('modal-backdrop');
  const btnOpen = document.getElementById('btn-create-modal');
  const btnClose = document.getElementById('btn-close-modal');
  const btnCancel = document.getElementById('btn-cancel-modal');
  const form = document.getElementById('create-operation-form');

  const openModal = () => modal.classList.remove('hidden');
  const closeModal = () => {
    modal.classList.add('hidden');
    form.reset();
  };

  btnOpen.addEventListener('click', openModal);
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('op-name').value;
    const description = document.getElementById('op-desc').value;

    try {
      const res = await fetch(`${CONFIG.OPERATIONS_API}/operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) throw new Error('Create failed');
      closeModal();
      await fetchOperations();
    } catch (err) {
      alert('Error creating operation: ' + err.message);
    }
  });
}

// ==========================================
// 4. Copilot Chat Drawer
// ==========================================
function setupCopilot() {
  const toggleBtn = document.getElementById('copilot-toggle-btn');
  const closeBtn = document.getElementById('btn-close-drawer');
  const clearBtn = document.getElementById('btn-clear-chat');
  const drawer = document.getElementById('copilot-drawer');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const messagesContainer = document.getElementById('chat-messages');
  const chips = document.querySelectorAll('.chip');

  const toggleChat = () => {
    isChatOpen = !isChatOpen;
    drawer.classList.toggle('hidden', !isChatOpen);
    if (isChatOpen) {
      chatInput.focus();
    }
  };

  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  clearBtn.addEventListener('click', () => {
    messagesContainer.innerHTML = `
      <div class="message ai-message">
        <div class="message-content">
          Conversation cleared. How can I assist you with Blacklight operations?
        </div>
      </div>
    `;
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      if (prompt) {
        if (!isChatOpen) toggleChat();
        chatInput.value = prompt;
        sendMessage(prompt);
      }
    });
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;
    sendMessage(msg);
  });
}

async function sendMessage(text) {
  const messagesContainer = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  chatInput.value = '';

  // 1. Append user message to UI
  const userMsgEl = document.createElement('div');
  userMsgEl.className = 'message user-message';
  userMsgEl.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
  messagesContainer.appendChild(userMsgEl);

  // 2. Append AI response bubble with tool indicator
  const aiMsgEl = document.createElement('div');
  aiMsgEl.className = 'message ai-message';
  aiMsgEl.innerHTML = `
    <div class="message-content">
      <div class="tool-badge" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--primary); background: rgba(6, 182, 212, 0.1); padding: 3px 8px; border-radius: 6px; margin-bottom: 8px; border: 1px solid rgba(6, 182, 212, 0.2);">
        <i data-lucide="loader-2" class="spin"></i> Connecting to Inkeep & Hivemind...
      </div>
      <div class="ai-text"></div>
    </div>
  `;
  messagesContainer.appendChild(aiMsgEl);
  initIcons();
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  const aiTextEl = aiMsgEl.querySelector('.ai-text');
  const badgeEl = aiMsgEl.querySelector('.tool-badge');

  try {
    // 3. Initiate SSE Streaming request to Inkeep API
    const response = await fetch(`${CONFIG.INKEEP_API}/run/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-bypass-secret-123',
        'x-inkeep-tenant-id': 'default',
        'x-inkeep-project-id': 'blacklight',
        'x-inkeep-agent-id': 'operations-agent',
      },
      body: JSON.stringify({
        model: 'operations-agent',
        messages: [{ role: 'user', content: text }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      badgeEl.style.display = 'none';
      aiTextEl.innerHTML = `⚠️ <strong>Error (${response.status}):</strong> ${escapeHtml(errBody || 'Failed to connect')}`;
      return;
    }

    // 4. Stream tokens chunk-by-chunk in real-time
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const raw = line.replace(/^data:\s*/, '').trim();
          if (!raw || raw === '[DONE]') continue;

          try {
            const parsed = JSON.parse(raw);

            // Update badge if a tool is being called
            const toolCall = parsed.choices?.[0]?.delta?.tool_calls?.[0];
            if (toolCall?.function?.name) {
              badgeEl.innerHTML = `<i data-lucide="cog" class="spin"></i> Executing tool: <strong>${escapeHtml(toolCall.function.name)}</strong>`;
              initIcons();
            }

            // Extract content piece
            const deltaContent = parsed.choices?.[0]?.delta?.content || '';
            if (deltaContent) {
              // Ignore internal telemetry / data operations
              if (
                !deltaContent.includes('"type":"data-operation"') &&
                !deltaContent.includes('"type":"tool-output-available"')
              ) {
                accumulatedText += deltaContent;
              } else if (deltaContent.includes('"type":"tool-output-available"')) {
                badgeEl.innerHTML = `<i data-lucide="check-circle-2"></i> Hivemind MCP Tool Executed`;
                initIcons();
              }
            }
          } catch {
            if (!raw.startsWith('{') && !raw.startsWith('[')) {
              accumulatedText += raw;
            }
          }
        }
      }

      if (accumulatedText.trim()) {
        aiTextEl.innerHTML = formatMarkdown(accumulatedText);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }

    // 5. Finalize status badge
    badgeEl.innerHTML = `<i data-lucide="check-circle-2"></i> Hivemind MCP Ready`;
    initIcons();

    if (!accumulatedText.trim()) {
      aiTextEl.textContent = 'Operation completed successfully.';
    }

    // 6. Refresh operations table in case the agent created or modified operations
    await fetchOperations();
  } catch (err) {
    badgeEl.style.display = 'none';
    aiTextEl.innerHTML = `⚠️ <strong>Network error:</strong> ${escapeHtml(err.message)}`;
  }
}


function formatMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>')
    .replace(/\n/g, '<br />');
}

// ==========================================
// 5. Initial Boot
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  setupModal();
  setupCopilot();
  fetchOperations();
  checkHealth();

  document.getElementById('btn-refresh').addEventListener('click', () => {
    fetchOperations();
    checkHealth();
  });

  // Search filter
  document.getElementById('table-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = operations.filter(
      (op) =>
        (op.name || op.Name || '').toLowerCase().includes(term) ||
        (op.description || op.Description || '').toLowerCase().includes(term)
    );
    renderOperations(filtered);
  });

  // Periodic health check
  setInterval(checkHealth, 15000);
});
