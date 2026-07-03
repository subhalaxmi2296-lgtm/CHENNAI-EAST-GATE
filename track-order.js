document.addEventListener('DOMContentLoaded', function () {
  if (!window.EastgateStore) return;
  const form = document.querySelector('#trackOrderPage form');
  const notice = document.createElement('div');
  form.appendChild(notice);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const orderNo = form.querySelector('input[placeholder="EG-10421"]').value.trim();
    const contact = form.querySelector('input[placeholder="customer@example.com"]').value.trim();
    const store = EastgateStore.getStore();
    const orders = store.orders || [];
    let found = orders.find(o => o.id === orderNo || o.email === contact || o.phone === contact);
    if (!found) {
      notice.className = 'notice';
      notice.textContent = 'No order found for that input.';
      return;
    }
    // redirect to order details
    const url = new URL(window.location.href);
    const target = new URL('order-details.html', url.origin + url.pathname);
    target.searchParams.set('order', found.id);
    window.location = target.toString();
  });
});
