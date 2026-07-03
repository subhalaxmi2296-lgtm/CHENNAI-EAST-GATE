document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('wishlistPage');
  if (!window.EastgateStore) return;
  function render() {
    const wishlistSet = EastgateStore.getWishlist() || new Set();
    const wishlist = Array.isArray(wishlistSet) ? wishlistSet : Array.from(wishlistSet);
    const store = EastgateStore.getStore();
    const products = store.products || [];
    container.innerHTML = '';
    if (!wishlist.length) {
      container.innerHTML = '<div class="empty-state">Your wishlist is empty.</div>';
      return;
    }
    const list = document.createElement('div');
    list.className = 'stack';
    wishlist.forEach(id => {
      const prod = products.find(p => p.id === id) || { name: id, price: 0 };
      const item = document.createElement('div');
      item.className = 'wish-item';
      item.innerHTML = `
        <div class="row">
          <div>
            <strong>${prod.name}</strong>
            <div class="muted">${prod.brand || ''}</div>
          </div>
          <div>
            <div class="price">${EastgateStore.formatPrice(prod.price)}</div>
          </div>
        </div>
      `;
      const actions = document.createElement('div');
      actions.className = 'product-actions';
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-primary';
      addBtn.textContent = 'Add to cart';
      addBtn.addEventListener('click', function () {
        const cart = EastgateStore.getCart() || {};
        cart[id] = (Number(cart[id] || 0) + 1);
        EastgateStore.saveCart(cart);
        render();
      });
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-secondary';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', function () {
        wishlistSet.delete(id);
        EastgateStore.saveWishlist(wishlistSet);
        render();
      });
      actions.appendChild(addBtn);
      actions.appendChild(removeBtn);
      item.appendChild(actions);
      list.appendChild(item);
    });
    container.appendChild(list);
  }
  render();
});
