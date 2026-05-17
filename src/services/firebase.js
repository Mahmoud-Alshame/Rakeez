/**
 * طبقة Firebase — جاهزة للربط لاحقاً.
 *
 * 1. npm install firebase
 * 2. استبدال القيم من وحدة تحكم Firebase
 * 3. initializeApp ثم تصدير auth و db
 *
 * @see https://firebase.google.com/docs/web/setup
 */

export const firebaseConfigPlaceholder = {
  apiKey: 'ضع_مفتاح_API_هنا',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:xxxxxxxx',
}

/** يُغيّر إلى true بعد تهيئة Firebase فعلياً */
export const firebaseReady = false
