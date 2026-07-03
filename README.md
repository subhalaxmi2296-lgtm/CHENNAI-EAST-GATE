# Chennai Eastgate Trading

Static storefront + admin dashboard with a small Express backend for shared state sync.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Hostinger VPS deploy

1. Create a VPS on Hostinger and point your domain's `A` record to the VPS IP.
2. Upload this project to the server.
3. Install Node.js dependencies:

```bash
npm install
```

4. Start the app:

```bash
npm start
```

5. Keep it running with a process manager like `pm2` or Hostinger's app/service tooling.
6. Add HTTPS through Hostinger's SSL tools or a reverse proxy such as Nginx.

## Shared data

The browser syncs storefront and admin state through:

- `GET /api/bootstrap`
- `PUT /api/bootstrap`

This keeps products, categories, orders, cart, wishlist, and login/session data aligned across devices.
