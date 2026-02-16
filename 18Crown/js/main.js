// サービスワーカー登録
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('Service Worker登録成功'))
    .catch(err => console.log('Service Worker登録失敗:', err));
}
