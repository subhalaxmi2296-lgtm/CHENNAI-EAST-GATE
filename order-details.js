document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('orderDetailsPage');
  if (!window.EastgateStore) return;
  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }
  const orderId = getParam('order');
  const store = EastgateStore.getStore();
  const orders = store.orders || [];
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    container.innerHTML = '<div class="empty-state">Order not found. Use the Track Order page to lookup an order.</div>';
    return;
  }
  const el = document.createElement('div');
  el.className = 'stack';
  el.innerHTML = `
    <div class="section-heading compact">
      <p class="eyebrow">Order</p>
      <h3>${order.id} — ${order.status}</h3>
    </div>
    <div class="panel-card">
      <div><strong>Customer</strong></div>
      <div>${order.customerName} &middot; ${order.phone} &middot; ${order.email}</div>
      <div style="padding-top:12px"><strong>Shipping address</strong></div>
      <div>${order.address}</div>
      <div style="padding-top:12px"><strong>Items</strong></div>
      <div class="stack">
        ${order.items.map(it => `<div class="table-row"><div>${it.name} x ${it.qty}</div><div>${EastgateStore.formatPrice(it.price)}</div></div>`).join('')}
      </div>
      <div class="panel-total" style="margin-top:12px"><span>Total</span><strong>${EastgateStore.formatPrice(order.total)}</strong></div>
    </div>
  `;
  container.innerHTML = '';
  container.appendChild(el);
});
