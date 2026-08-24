const DATABASE_NAME = "huimeng-partner-projects";
const STORE_NAME = "projects";
const DATABASE_VERSION = 1;
const LEGACY_KEY = "living-drawing-projects";

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("当前浏览器不支持作品数据库。"));
      return;
    }
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("作品数据库打开失败。"));
  });
}

function runTransaction(mode, action) {
  return openDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    let result;
    try { result = action(store); } catch (error) { database.close(); reject(error); return; }
    transaction.oncomplete = () => { database.close(); resolve(result?.result); };
    transaction.onerror = () => { database.close(); reject(transaction.error || new Error("作品保存失败。")); };
    transaction.onabort = () => { database.close(); reject(transaction.error || new Error("作品保存已取消。")); };
  }));
}

export async function loadProjects() {
  const projects = await runTransaction("readonly", (store) => store.getAll());
  return (projects || []).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export function storeProject(project) {
  return runTransaction("readwrite", (store) => store.put(project));
}

export function removeProject(id) {
  return runTransaction("readwrite", (store) => store.delete(id));
}

export function clearProjects() {
  return runTransaction("readwrite", (store) => store.clear());
}

export async function migrateLegacyProjects() {
  let legacy = [];
  try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]"); } catch { legacy = []; }
  if (!Array.isArray(legacy) || legacy.length === 0) return [];
  await Promise.all(legacy.filter((project) => project?.id).map(storeProject));
  localStorage.removeItem(LEGACY_KEY);
  return legacy.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}
