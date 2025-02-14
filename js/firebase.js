import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, get, update, remove, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  databaseURL: "https://portfolio-maximo-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
let app;
let database;

export async function initializeFirebase() {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
}

// Tabs operations
export async function getTabs() {
  const tabsRef = ref(database, 'tabs');
  const snapshot = await get(tabsRef);

  if (snapshot.exists()) {
    return Object.entries(snapshot.val())
      .map(([id, data]) => ({ id, ...data}))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } else {
    return [];
  }
}

export async function addTab(name, order) {
  const tabsRef = ref(database, 'tabs');
  const newTabRef = push(tabsRef);
  await set(newTabRef, { name, order });
  return newTabRef.key;
}

export async function updateTab(id, name) {
  const tabRef = ref(database, `tabs/${id}`);
  await update(tabRef, { name });
}

export async function updateTabOrder(tabId, order) {
  const tabRef = ref(database, `tabs/${tabId}`);
  await update(tabRef, { order });
}

export async function deleteTab(id) {
  const tabRef = ref(database, `tabs/${id}`);
  await remove(tabRef);

  // Delete all items within the deleted tab
  const itemsRef = ref(database, 'items');
  const snapshot = await get(itemsRef);

  if (snapshot.exists()) {
    const items = snapshot.val();
    for (const itemId in items) {
      if (items[itemId].tabId === id) {
        await remove(ref(database, `items/${itemId}`));
      }
    }
  }
}

// Items operations
export async function getItems(tabId, topicId) {
  const itemsRef = ref(database, 'items');
  const snapshot = await get(itemsRef);

  if (snapshot.exists()) {
    return Object.entries(snapshot.val())
      .filter(([, item]) => item.tabId === tabId && item.topicId === topicId)
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => ((a.order !== undefined) ? a.order : 9999) - ((b.order !== undefined) ? b.order : 9999));
  } else {
    return [];
  }
}

export async function addItem(tabId, topicId, title, link, fonte, description) {
  const itemsRef = ref(database, 'items');
  const newItemRef = push(itemsRef);
  await set(newItemRef, { tabId, topicId, title, link, fonte, description });
  return newItemRef.key;
}

export async function updateItem(tabId, itemId, topicId, title, link, fonte, description) {
  const itemRef = ref(database, `items/${itemId}`);
  await update(itemRef, { tabId, topicId, title, link, fonte, description });
}

export async function deleteItem(tabId, itemId) {
  const itemRef = ref(database, `items/${itemId}`);
  await remove(itemRef);
}

// New function: Update item order and topic assignment
export async function updateItemOrder(itemId, topicId, order) {
  const itemRef = ref(database, `items/${itemId}`);
  await update(itemRef, { topicId, order });
}

// Topics operations
export async function getTopics(tabId) {
  const topicsRef = ref(database, 'topics');
  const snapshot = await get(topicsRef);

  if (snapshot.exists()) {
    return Object.entries(snapshot.val())
      .filter(([, topic]) => topic.tabId === tabId)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } else {
    return [];
  }
}

export async function addTopic(tabId, name, order) {
  const topicsRef = ref(database, 'topics');
  const newTopicRef = push(topicsRef);
  await set(newTopicRef, { tabId, name, order });
  return newTopicRef.key;
}

export async function updateTopic(id, name) {
  const topicRef = ref(database, `topics/${id}`);
  await update(topicRef, { name });
}

export async function updateTopicOrder(topicId, order) {
  const topicRef = ref(database, `topics/${topicId}`);
  await update(topicRef, { order });
}

export async function deleteTopic(id) {
  const topicRef = ref(database, `topics/${id}`);
  await remove(topicRef);

  // Delete all items within the deleted topic
  const itemsRef = ref(database, 'items');
  const snapshot = await get(itemsRef);

  if (snapshot.exists()) {
    const items = snapshot.val();
    for (const itemId in items) {
      if (items[itemId].topicId === id) {
        await remove(ref(database, `items/${itemId}`));
      }
    }
  }
}
