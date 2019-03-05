import {storage} from 'src/utils'

import {STORAGE_KEYS, defaultUnits} from 'src/constants'

export const getUnits = () => {
  const units = storage.get(STORAGE_KEYS.allUnits)

  return Array.isArray(units) ? units : defaultUnits
}

export const setUnits = (units) => {
  storage.set(STORAGE_KEYS.allUnits, units)
}

window.clearUnits = () => {
  storage.remove(STORAGE_KEYS.allUnits)
  location.reload()
}