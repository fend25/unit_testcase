import * as Cookies from 'js-cookie'

class AbstractStore {
  constructor() {
    this.store = null
  }

  set(key, val) {
    this.store.setItem(key, JSON.stringify(val))
    return val
  }

  get(key) {
    const value = this.store.getItem(key)
    if (typeof value != 'string') {
      return null
    }
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }

  getWithDefault(key, defaultValue) {
    const value = this.get(key)

    if (value == null) return defaultValue
    else {
      if (typeof defaultValue === 'string') return value
      else {
        if (typeof value === 'string') return defaultValue
        else return value
      }
    }
  }

  remove(key) {
    this.store.removeItem(key)
  }

  removeAll() {
    this.store.clear()
  }

  getAll() {
    const res = {}

    for (let i = 0; i < this.store.length; i++) {
      const _key = this.store.key(i)
      if (!_key) continue
      const key = _key.toString()
      res[key] = this.get(key)
    }

    return res
  }
}

class Localstore extends AbstractStore {
  constructor() {
    super()
    this.store = window.localStorage
  }
}

class Sessionstore extends AbstractStore {
  constructor() {
    super()
    this.store = window.sessionStorage
  }
}


const expiresIsOk = (expires) => {
  if (typeof expires === 'number' && !isNaN(expires)) return true
  else return !!expires
}

const processValue = (value) => {
  if (value.substring(0, 1) === '{') {
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }
  return (value !== 'undefined') ? decodeURIComponent(value) : null
}

class Cookiestore extends AbstractStore {
  set(name, value, config) {
    if (!config) config = {}

    const expires = config.expires || new Date(Date.now() + 20 * 365 * (24 * 60 * 60 * 1000))
    const path = config.path || '/'
    const secure = config.secure || false

    const _config = {expires, path, secure}

    const valueToUse = (value !== undefined && typeof (value) === "object")
      ? JSON.stringify(value)
      : value
    Cookies.set(name, valueToUse, _config)

    return value
  }

  get(name) {
    const result = Cookies.get(name)
    if (result) return processValue(result)
    else return null
  }

  getAll() {
    const result = {}
    for (let name in Cookies.get()) {
      result[name] = this.get(name)
    }
    return result
  }

  remove(name, path) {
    const config = {}
    if (path) config.path = path
    Cookies.remove(name, config)
    return null
  }

  removeAll() {
    for (let name in Cookies.get()) {
      Cookies.remove(name)
    }
  }
}

class DummyStore extends AbstractStore {
  set(key, val) {
    return val
  }

  get(key) {
    return null
  }

  remove(key) {
  }

  removeAll() {
  }

  getAll() {
    return {}
  }
}


const storageAvailable = (type) => {
  let storage
  try {
    storage = (window)[type]
    let x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return true
  } catch (e) {
    const errCodes = {nonFf: 22, ff: 1024}
    const errNames = {nonFf: 'QuotaExceededError', ff: 'NS_ERROR_DOM_QUOTA_REACHED'}

    // test name field too, because code might not be present
    const isProperException = e.code === errCodes.nonFf ||
      e.code === errCodes.ff ||
      e.name === errNames.nonFf ||
      e.name === errNames.ff

    // acknowledge QuotaExceededError only if there's something already stored
    return e instanceof DOMException && (isProperException) && storage.length !== 0
  }
}

const cookieAvailable = () => {
  // Quick test if browser has cookieEnabled host property
  if (!navigator.cookieEnabled) return false
  // Create cookie
  document.cookie = "cookietest=1"
  let res = document.cookie.indexOf("cookietest=") != -1
  // Delete cookie
  document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT"
  return res
}

const dummyStore = new DummyStore()

let localStore = dummyStore
let sessionStore = dummyStore
let cookieStore = dummyStore
let storage = dummyStore

const available = {
  local: cookieAvailable(),
  session: storageAvailable('localStorage'),
  cookie: storageAvailable('sessionStorage')
}


if (available.cookie) {
  cookieStore = new Cookiestore()
  storage = cookieStore
}

if (available.local) {
  localStore = new Localstore()
  storage = localStore
}

if (available.session) {
  sessionStore = new Sessionstore()
}

window.storage = storage

export {localStore, sessionStore, cookieStore, storage, available}
