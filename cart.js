document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('cartPage');
  if (!window.EastgateStore) return;
  function render() {
    const cart = EastgateStore.getCart() || {};
    const store = EastgateStore.getStore();
    const products = store.products || [];
    const ids = Object.keys(cart);
    container.innerHTML = '';
    if (!ids.length) {
      container.innerHTML = '<div class="empty-state">Your cart is empty.</div>';
      return;
    }
    const list = document.createElement('div');
    list.className = 'stack';
    let total = 0;
    ids.forEach(id => {
      const qty = Number(cart[id] || 0);
      const prod = products.find(p => p.id === id) || { name: id, price: 0 };
      const line = document.createElement('div');
      line.className = 'cart-item';
      const lineHtml = `
        <div class="row">
          <div>
            <strong>${prod.name}</strong>
            <div class="muted">${prod.brand || ''}</div>
          </div>
          <div>
            <div class="price">${EastgateStore.formatPrice(prod.price)}</div>
            <div class="muted">Qty: ${qty}</div>
          </div>
        </div>
      `;
      line.innerHTML = lineHtml;
      const actions = document.createElement('div');
      actions.className = 'product-actions';
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-secondary';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', function () {
        delete cart[id];
        EastgateStore.saveCart(cart);
        render();
      });
      actions.appendChild(removeBtn);
      line.appendChild(actions);
      list.appendChild(line);
      total += (prod.price || 0) * qty;
    });
    const tot = document.createElement('div');
    tot.className = 'panel-total';
    tot.innerHTML = `<span>Total</span><strong>${EastgateStore.formatPrice(total)}</strong>`;
    const checkout = document.createElement('button');
    checkout.className = 'btn btn-primary full';
    checkout.textContent = 'Place order';
    checkout.addEventListener('click', function () {
      alert('Checkout is a placeholder in this demo.');
    });

    container.appendChild(list);
    container.appendChild(tot);
    container.appendChild(checkout);
  }
  render();
});
