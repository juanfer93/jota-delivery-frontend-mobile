self.addEventListener('push', (event) => {
  const fallback = {
    title: 'Jota Delivery',
    body: 'Tienes una nueva actualizacion.',
  };

  let payload = fallback;
  try {
    payload = { ...fallback, ...event.data.json() };
  } catch (error) {
    payload = { ...fallback, body: event.data ? event.data.text() : fallback.body };
  }

  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clientsList.forEach((client) => client.postMessage(payload));

    await self.registration.showNotification(payload.title, {
      body: payload.body,
      data: payload,
      tag: payload.notificationId || payload.pedidoId || 'jota-delivery',
      renotify: true,
      silent: false,
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const payload = event.notification.data || {};

  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const visibleClient = clientsList.find((client) => 'focus' in client);

    if (visibleClient) {
      await visibleClient.focus();
      visibleClient.postMessage(payload);
      return;
    }

    const url = new URL('/', self.location.origin);
    if (payload.pedidoId) url.searchParams.set('notificationPedidoId', payload.pedidoId);
    if (payload.notificationId) url.searchParams.set('notificationId', payload.notificationId);
    if (payload.type) url.searchParams.set('notificationType', payload.type);
    if (payload.estado) url.searchParams.set('notificationStatus', payload.estado);
    if (payload.domiciliarioNombre) url.searchParams.set('deliveryName', payload.domiciliarioNombre);
    if (payload.createdAt) url.searchParams.set('notificationCreatedAt', payload.createdAt);
    await self.clients.openWindow(url.toString());
  })());
});
