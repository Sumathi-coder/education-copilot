import { readStore, writeStore, subscribeStore } from './localStore'

const STORE = 'materials'

function load() {
  return readStore(STORE, {})
}

export function getUploadedMaterials(courseId) {
  return load()[courseId] ?? []
}

export function addUploadedMaterial(courseId, material) {
  const store = load()
  store[courseId] = [...(store[courseId] ?? []), material]
  writeStore(STORE, store)
  return material
}

export function updateUploadedMaterial(courseId, materialId, patch) {
  const store = load()
  store[courseId] = (store[courseId] ?? []).map((m) =>
    m.id === materialId ? { ...m, ...patch } : m,
  )
  writeStore(STORE, store)
}

export function removeUploadedMaterial(courseId, materialId) {
  const store = load()
  store[courseId] = (store[courseId] ?? []).filter((m) => m.id !== materialId)
  writeStore(STORE, store)
}

export function onMaterialsUpdated(callback) {
  return subscribeStore(STORE, callback)
}
