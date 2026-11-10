import type { AudioAsset, EditorProject, ProjectSummary } from '../types/project'

const DATABASE_NAME = 'waveform-editor'
const DATABASE_VERSION = 1
const PROJECTS = 'projects'
const ASSETS = 'assets'

interface StoredAsset extends AudioAsset {
  projectId: string
  blob: Blob
}

let databasePromise: Promise<IDBDatabase> | undefined

function database() {
  if (!('indexedDB' in globalThis)) return Promise.reject(new Error('이 브라우저에서는 로컬 저장소를 사용할 수 없습니다.'))
  if (!databasePromise) databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(PROJECTS)) db.createObjectStore(PROJECTS, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(ASSETS)) db.createObjectStore(ASSETS, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('로컬 저장소를 열지 못했습니다.'))
  })
  return databasePromise
}

async function request<T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await database()
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const result = action(transaction.objectStore(storeName))
    result.onsuccess = () => resolve(result.result)
    result.onerror = () => reject(result.error ?? new Error('로컬 저장소 작업에 실패했습니다.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('로컬 저장소 작업이 취소되었습니다.'))
  })
}

export async function saveProject(project: EditorProject) {
  await request(PROJECTS, 'readwrite', (store) => store.put({ ...project, updatedAt: Date.now() }))
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const projects = await request<EditorProject[]>(PROJECTS, 'readonly', (store) => store.getAll())
  return projects.map(({ id, name, updatedAt }) => ({ id, name, updatedAt })).sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function loadProject(id: string): Promise<EditorProject | undefined> {
  return request(PROJECTS, 'readonly', (store) => store.get(id))
}

export async function saveAsset(projectId: string, asset: AudioAsset, blob: Blob) {
  const record: StoredAsset = { ...asset, projectId, blob }
  await request(ASSETS, 'readwrite', (store) => store.put(record))
}

export async function loadAsset(id: string): Promise<Blob | undefined> {
  const record = await request<StoredAsset | undefined>(ASSETS, 'readonly', (store) => store.get(id))
  return record?.blob
}

export async function deleteAssetsNotInProject(project: EditorProject) {
  const db = await database()
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(ASSETS, 'readwrite')
    const store = transaction.objectStore(ASSETS)
    const requestAll = store.getAll() as IDBRequest<StoredAsset[]>
    requestAll.onsuccess = () => requestAll.result.filter((asset) => asset.projectId === project.id && !project.assets.some((item) => item.id === asset.id)).forEach((asset) => store.delete(asset.id))
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('사용하지 않는 오디오 파일을 정리하지 못했습니다.'))
  })
}
