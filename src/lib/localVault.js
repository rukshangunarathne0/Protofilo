import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

const DB_NAME = 'htc-local-vault';
const STORE = 'files';
const ROOT = 'Happy Time Connect';
export const VAULT_CATEGORIES = [
  { id: 'personal', bn: 'Personal Chat', en: 'Personal Chat' },
  { id: 'groups', bn: 'Group Chat', en: 'Group Chat' },
  { id: 'photos', bn: 'Photos', en: 'Photos' },
  { id: 'videos', bn: 'Videos', en: 'Videos' },
  { id: 'documents', bn: 'Documents', en: 'Documents' },
  { id: 'audio', bn: 'Audio & Voice', en: 'Audio & Voice' },
  { id: 'downloads', bn: 'Downloads', en: 'Downloads' },
];

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function dbAction(mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
const safeName = (name) => name.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-100) || 'file';

function inferMediaCategory(file) {
  const type = file?.type || '';
  const name = file?.name || '';
  if (type.startsWith('image/')) return 'photos';
  if (type.startsWith('video/')) return 'videos';
  if (type.startsWith('audio/')) return 'audio';
  if (/\.(pdf|docx?|xlsx?|pptx?|txt|rtf|odt|ods)$/i.test(name)) return 'documents';
  return 'downloads';
}

/** Save a downloaded conversation attachment locally. */
export async function saveDownloadedAttachment(blob, details = {}) {
  if (!blob) throw new Error('ডাউনলোড করা ফাইল পাওয়া যায়নি।');
  const name = details.fileName || blob.name || 'download';
  const file = new File([blob], name, { type: blob.type || details.mimeType || 'application/octet-stream' });
  const mediaCategory = inferMediaCategory(file);
  const chatType = details.chatType === 'group' ? 'group' : details.chatType === 'personal' ? 'personal' : null;
  const category = chatType === 'group' ? 'groups' : chatType === 'personal' ? 'personal' : mediaCategory;
  const mediaFolder = mediaCategory === 'photos' ? 'Photos'
    : mediaCategory === 'videos' ? 'Videos'
    : mediaCategory === 'audio' ? 'Audio & Voice'
    : mediaCategory === 'documents' ? 'Documents' : 'Downloads';
  return saveLocalFile(file, category, {
    ...details,
    source: 'chat-download',
    folderPath: chatType ? `${chatType === 'group' ? 'Group Chat' : 'Personal Chat'}/${mediaFolder}` : mediaFolder,
  });
}

/** Chat screens dispatch this event when the user downloads an attachment. */
export function listenForChatDownloads(onSaved, onError = () => {}) {
  const handler = async (event) => {
    try {
      const record = await saveDownloadedAttachment(event.detail?.blob, event.detail || {});
      onSaved(record);
    } catch (error) {
      onError(error);
    }
  };
  window.addEventListener('htc:download-attachment', handler);
  return () => window.removeEventListener('htc:download-attachment', handler);
}
const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

export async function saveLocalFile(file, category = 'downloads', details = {}) {
  if (!file) throw new Error('কোনো ফাইল নির্বাচন করা হয়নি।');
  const categoryInfo = VAULT_CATEGORIES.find((item) => item.id === category) || VAULT_CATEGORIES.at(-1);
  const id = crypto.randomUUID();
  const filename = safeName(file.name);
  let storagePath = '';
  let storageType = 'browser';
  if (Capacitor.isNativePlatform()) {
    const folder = details.folderPath || ({
      personal: 'Personal Chat', groups: 'Group Chat', photos: 'Photos',
      videos: 'Videos', documents: 'Documents', audio: 'Audio & Voice',
      downloads: 'Downloads',
    }[categoryInfo.id] || 'Downloads');
    storagePath = `${ROOT}/${folder}/${Date.now()}_${filename}`;
    await Filesystem.writeFile({
      path: storagePath,
      data: await toBase64(file),
      directory: Directory.Documents,
      recursive: true,
    });
    storageType = 'device';
  }
  const record = {
    id, name: file.name, safeName: filename, type: file.type || 'application/octet-stream',
    size: file.size, category: categoryInfo.id, storagePath, storageType,
    savedAt: new Date().toISOString(), conversationId: details.conversationId || null,
    source: details.source || 'manual',
    ...(storageType === 'browser' ? { blob: file } : {}),
  };
  await dbAction('readwrite', (store) => store.put(record));
  return record;
}
export async function listLocalFiles() {
  const records = await dbAction('readonly', (store) => store.getAll());
  return (records || []).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}
export async function deleteLocalFile(record) {
  if (record.storageType === 'device' && record.storagePath) {
    await Filesystem.deleteFile({ path: record.storagePath, directory: Directory.Documents });
  }
  await dbAction('readwrite', (store) => store.delete(record.id));
}
export async function getLocalFileBlob(record) {
  if (record.blob) return record.blob;
  if (record.storageType === 'device' && record.storagePath) {
    const result = await Filesystem.readFile({ path: record.storagePath, directory: Directory.Documents });
    const raw = typeof result.data === 'string' ? atob(result.data) : '';
    const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0));
    return new Blob([bytes], { type: record.type });
  }
  throw new Error('ফাইলটি পাওয়া যায়নি।');
}
export const isNativeVault = () => Capacitor.isNativePlatform();
