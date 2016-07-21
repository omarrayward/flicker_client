// Network concern
const htmlImageLoaderID = 'images-loader'

const getJSONP = (url, callback, JSONPCallback) => {
  store.dispatch({name: BEGIN_IMAGE_FETCH})
  JSONPCallback = JSONPCallback || 'jsonFlickrFeed'
  window[JSONPCallback] = callback

  const head = document.getElementsByTagName('head')[0]
  const prevLoader = document.getElementById(htmlImageLoaderID)

  const newLoader = document.createElement('script')
  newLoader.setAttribute('type', 'text/javascript')
  newLoader.setAttribute('src', url)
  newLoader.setAttribute('id', htmlImageLoaderID)
  if (prevLoader) {
    head.replaceChild(newLoader, prevLoader)
  } else {
    head.appendChild(newLoader)
  }
}

// End Network concern

// Storage concern

class Store {
  constructor (reducer) {
    this.reducer = reducer
    this.state = null
    this.subscribers = []
  }
  get () {
    return this.state
  }
  set (value) {
    this.state = value
    this.subscribers.forEach(subscriber => subscriber(this.state))
  }
  subscribe (subscriber) {
    this.subscribers.push(subscriber)
  }
  dispatch (action) {
    this.set(this.reducer(this.state, action))
  }
}

// End Storage concern


// Business logic concern
const oneMinute = 60000
const baseURL = 'http://api.flickr.com/services/feeds/photos_public.gne?format=json'
const appID = '9a867f83-19aa-414d-85e4-64edbe499605'

  // Action names
const INIT = 'INIT'
const BEGIN_IMAGE_FETCH = 'BEGIN_IMAGE_FETCH'
const END_IMAGE_FETCH = 'END_IMAGE_FETCH'
const FAVORITE = 'FAVORITE'
const UNFAVORITE = 'UNFAVORITE'
const SHOW_FAVORITES = 'SHOW_FAVORITES'
const SHOW_ALL = 'SHOW_ALL'
const LOAD = 'LOAD'
  // End Action names

const reducer = (state, {name, payload}) => {
  switch (name) {
    case INIT:
      return init()
    case BEGIN_IMAGE_FETCH:
      return Object.assign({}, state, {isLoading: true})
    case END_IMAGE_FETCH:
      return endImageFetch(state, payload)
    case FAVORITE:
      return favorite(state, payload)
    case UNFAVORITE:
      return unFavorite(state, payload)
    case SHOW_FAVORITES:
      return Object.assign({}, state, {showOnlyFavorite: true})
    case SHOW_ALL:
      return Object.assign({}, state, {showOnlyFavorite: false})
    case LOAD:
      return load(payload)
  }
}

  // Actions
const init = () => {
  return {
    loadedImages: {},
    showOnlyFavorite: false,
    isLoading: false,
    favorited: {},
    pageCounter: 0
  }
}

const endImageFetch = (state, normalizedImages) => {
  const newLoadedImageRecords = Object.assign({}, state.loadedImages)
  normalizedImages.forEach(record => newLoadedImageRecords[record.id] = record)
  return Object.assign(
    {},
    state,
    {
      loadedImages: newLoadedImageRecords,
      isLoading:false,
      pageCounter: state.pageCounter + 1
    }
  )
}

const favorite = (state, favoriteId) => {
  const newFavoriteImageRecords = Object.assign({}, state.favorited)
  newFavoriteImageRecords[favoriteId] = state.loadedImages[favoriteId]
  return Object.assign({}, state, {favorited: newFavoriteImageRecords})
}

const unFavorite = (state, favoriteId) => {
  const newFavoriteImageRecords = Object.assign({}, state.favorited)
  delete newFavoriteImageRecords[favoriteId]
  return Object.assign({}, state, {favorited: newFavoriteImageRecords})
}

const load = ({favorited, showOnlyFavorite}) => {
  const state = init()
  state.loadedImages = favorited
  state.favorited = favorited
  state.showOnlyFavorite = showOnlyFavorite
  return state
}
  // End Actions
const url = () => `${baseURL}&page=${store.get().pageCounter}`

const getImagesHandler = (jsonData) =>
  store.dispatch({name: END_IMAGE_FETCH, payload: normalizedImages(jsonData.items)})

const normalizedImages = images => images.map((image, index) => ({
  id: image.link,
  date_taken: image.date_taken,
  author: image.author,
  title: image.title,
  src: image.media.m,
  favorited: false
}))

const savedData = state => ({
    showOnlyFavorite: state.showOnlyFavorite,
    favorited: state.favorited
  }
)

const persist = state => localStorage.setItem(appID, JSON.stringify(savedData(state)))

// End Business logic concern


// UI concern

const htmlIcon = (imageId, isFavorited) =>
  isFavorited ? `<i imageId=${imageId} class="material-icons favorite">favorite</i>` :
                `<i imageId=${imageId} class="material-icons favorite-border">favorite_border</i>`

const htmlImage = (image, isFavorited) =>
  `<div class='image-container'>
    ${htmlIcon(image.id, isFavorited)}
    <div class='image' style="background-image:url(${image.src})">
      <span class="tooltiptext">
        <span>Title: ${image.title}</span>
        <span>Author: ${image.author}</span>
        <span>Date taken: ${image.date_taken}</span>
      </span>
    </div>
  </div>`

const htmlImageList = (imageStore, favorited) => {
  return Object.keys(imageStore).map(imageId => {
    const isFavorited = !!favorited[imageId]
    return htmlImage(imageStore[imageId], isFavorited)
  }).join('')
}

const htmlSpinner = () => `<div> Loading
                             <span class="ellipsis">
                               <span>.</span><span>.</span><span>.</span>
                             </span>
                           </div>`

const throttle = (callback, limit) => {
  let wait = false;
  return () => {
    if (!wait) {
      callback();
      wait = true;
      setTimeout(() => {wait = false}, limit)
    }
  }
}

const throttledGetJSONP = throttle(() => {getJSONP(url(), getImagesHandler)}, 1000)

  // UI event handlers
const scrollHandler = () => {
  const isScrollingAtBottom = document.body.scrollHeight === document.body.scrollTop + window.innerHeight
  // Only fetch more images if client scrolling at the end of file and not showing "only favorites"
  if (!store.get().showOnlyFavorite && isScrollingAtBottom) {
    throttledGetJSONP()
  }
}

const clickHandler = event => {
  if (event.target.tagName === 'I' && event.target.getAttribute('imageId')) {
    const imageId = event.target.getAttribute('imageId')
    const actionName = store.get().favorited[imageId] ? UNFAVORITE : FAVORITE
    store.dispatch({name: actionName, payload: imageId})
  } else if (event.target.getAttribute('toggleAction') === 'show-favorites') {
    store.dispatch({name: SHOW_FAVORITES})
  } else if  (event.target.getAttribute('toggleAction') === 'show-all') {
    store.dispatch({name: SHOW_ALL})
  }
}
  // End UI event handlers


  // UI subscribers
const renderImages = state => {
  const htmlImageListContainer = document.getElementById('image-list-container')
  if (state.showOnlyFavorite) {
    htmlImageListContainer.innerHTML = htmlImageList(state.favorited, state.favorited)
  } else {
    htmlImageListContainer.innerHTML = htmlImageList(state.loadedImages, state.favorited)
  }
}

const renderLoadingSpinner = state => {
  const htmlImageListContainer = document.getElementById('loading-spinner')
  if (state.isLoading) {
    htmlImageListContainer.innerHTML = htmlSpinner()
  } else {
    htmlImageListContainer.innerHTML = ''
  }
}

const renderImageToggler = state => {
  const icon = state.showOnlyFavorite ?
    `<i toggleAction="show-all" class="material-icons favorite">favorite</i>` :
    `<i toggleAction="show-favorites" class="material-icons favorite-border">favorite_border</i>`
  document.getElementById('image-toggler').innerHTML = icon
}

  // End UI subscribers
// End UI concern


// Driver code
const store = new Store(reducer)
store.subscribe(renderImages)
store.subscribe(renderLoadingSpinner)
store.subscribe(renderImageToggler)
store.subscribe(persist)


const prevSavedState = JSON.parse(localStorage.getItem(appID))
if (!prevSavedState) {
  store.dispatch({name: INIT})
} else {
  store.dispatch({name: LOAD, payload: prevSavedState})
}

document.addEventListener('click', clickHandler)
document.addEventListener('scroll', scrollHandler)

getJSONP(url(), getImagesHandler)
setInterval(() => getJSONP(url(), getImagesHandler), oneMinute)

// End Driver code



