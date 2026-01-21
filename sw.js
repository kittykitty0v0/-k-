/*
 * EPhone Service Worker
 * 核心功能：接管安卓系统的通知弹窗点击事件，并在安装后立即激活。
 */

// 1. 安装事件：强制跳过等待，立即让新版本生效
self.addEventListener('install', event => {
  // console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// 2. 激活事件：立即接管所有页面
self.addEventListener('activate', event => {
  // console.log('[Service Worker] Activating...');
  event.waitUntil(self.clients.claim());
});

// 3. 核心：处理通知的点击事件
self.addEventListener('notificationclick', event => {
  // 点击通知后，第一件事是关闭通知栏
  event.notification.close();

  // 获取通知携带的数据（如果有的话，比如 chatId）
  // const chatId = event.notification.data ? event.notification.data.chatId : null;

  // 尝试寻找已打开的浏览器窗口并聚焦
  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true, // 包含所有受控和未受控的窗口
      })
      .then(clientList => {
        // 策略 A: 如果已经有打开的窗口，直接聚焦第一个
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          // 如果窗口可见或不可见，且具有聚焦能力
          if ('focus' in client) {
            return client.focus();
          }
        }

        // 策略 B: 如果没有打开的窗口，打开主页
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      }),
  );
});

// 4. (可选) 监听来自服务器的推送（如果你以后接了 Web Push 服务器）
self.addEventListener('push', event => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: '新消息', body: event.data.text() };
  }

  const title = data.title || 'EPhone';
  const options = {
    body: data.body,
    icon: 'https://i.postimg.cc/Kj8JnRcp/267611-CC01-F8-A3-B4910-A2-C2-FFDE479-DC.jpg',
    badge: 'https://i.postimg.cc/Kj8JnRcp/267611-CC01-F8-A3-B4910-A2-C2-FFDE479-DC.jpg',
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
