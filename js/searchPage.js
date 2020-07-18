const form = document.getElementById('search-form')
const results = document.getElementById('results')
const modal = document.getElementById('modal')
const menu = document.getElementById('menu')

if (!sessionStorage.getItem('active')) {
  window.alert('You need to login')
  location.pathname = ''
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const textToSearch = form.searchField.value
  if (textToSearch !== '') {
    const loading = document.createElement('p')
    loading.textContent = 'Loading...'
    loading.classList.add('loading')
    results.textContent = ''
    results.appendChild(loading)
    callMovies(textToSearch)
  }
})

menu.addEventListener('click', (e) => {
  if (e.target.id === 'favorites-section') {
    modal.classList.add('show')
    showFavorites()
  }
  if (e.target.id === 'logout') {
    sessionStorage.removeItem('active')
    location.pathname = ''
  }
})

results.addEventListener('click', (e) => {
  const addThis = e.target.dataset.favorite
  const infoClick = e.target.dataset.imdbid

  if (addThis) {
    toggleFavorite(addThis)
  }

  if (infoClick) {
    modal.classList.add('show')
    movieExtendedInfo(infoClick)
  }
})

modal.addEventListener('click', (e) => {
  //Get out of modal
  if (e.target === modal) modal.classList.remove('show')

  //Remove favorites
  const favIconClicked = e.target.dataset.favorite
  if (favIconClicked) {
    //From results
    const elUpdate = document.querySelector(`[data-favorite=${favIconClicked}]`)
    elUpdate.classList.remove('added')
    //From favorites section
    e.target.parentElement.parentElement.remove()
    //From localStorage
    const data = getUserData()
    data.favorites.forEach((v, ind) => {
      if (v.imdbID === favIconClicked) {
        data.favorites.splice(ind, 1)
      }
    })
    setUserData(data)
  }
})

let movieName
let loadedPage

const callMovies = async (textToSearch, page = 1) => {
  movieName = textToSearch
  loadedPage = page

  try {
    const dataJson = await fetch(
      `http://www.omdbapi.com/?apikey=13085c3f&s=${textToSearch}&page=${page}&plot=full`
    )
    const data = await dataJson.json()
    if (data.Response !== 'False') {
      showMovies(data)
      setObserver()
    } else {
      showError(data.Error)
    }
  } catch (error) {
    showError(error)
  }
}

const callback = ([entry]) => {
  if (entry.isIntersecting) {
    callMovies(movieName, loadedPage + 1)
  }
}

let lastObserved
const observer = new IntersectionObserver(callback)
const setObserver = () => {
  if (lastObserved) observer.unobserve(lastObserved)
  lastObserved = results.lastElementChild
  observer.observe(lastObserved)
}

//Movies search result: creating, writing & setting atributtes
const showMovies = (movies) => {
  const fragment = document.createDocumentFragment()
  movies.Search.forEach((obj) => {
    const container = document.createElement('div')
    const favorite = document.createElement('div')
    const mediaContainer = document.createElement('div')
    const infoContainer = document.createElement('div')
    const img = document.createElement('img')
    const title = document.createElement('p')
    const year = document.createElement('p')
    const type = document.createElement('p')

    container.dataset.imdbid = obj.imdbID
    title.dataset.imdbid = obj.imdbID
    img.dataset.imdbid = obj.imdbID
    favorite.dataset.favorite = obj.imdbID

    title.textContent = obj.Title
    year.textContent = obj.Year
    type.textContent = obj.Type
    img.setAttribute('src', obj.Poster)

    getUserData().favorites.forEach((v) => {
      if (v.imdbID === obj.imdbID) {
        favorite.classList.add('added')
      }
    })
    container.classList.add('movie-container')
    mediaContainer.classList.add('movie-container__media-container')
    img.classList.add('media-container__img')
    favorite.classList.add('media-container__favorite')
    title.classList.add('info-container__title')
    year.classList.add('info-container__year')
    type.classList.add('info-container__type')

    mediaContainer.append(img, favorite)
    infoContainer.append(title, year, type)
    container.append(mediaContainer, infoContainer)
    fragment.appendChild(container)
  })
  const loading = document.querySelector('.loading')
  if (loading) loading.remove()

  results.appendChild(fragment)
}

const showError = (message) => {
  const error = document.createElement('p')
  const loading = document.querySelector('.loading')
  error.classList.add('error')
  error.textContent = message
  if (loading) loading.remove()
  results.appendChild(error)
}

//Favorites are stored to reduce calls to api
const toggleFavorite = (imdbID) => {
  const movie = document.querySelector(`[data-imdbid=${imdbID}]`)
  const favoriteIcon = document.querySelector(`[data-favorite=${imdbID}]`)
  const data = getUserData()
  let conflict

  const favToSave = {
    imdbID: imdbID,
    image: movie.firstElementChild.firstElementChild.src,
    title: movie.children[1].firstElementChild.textContent,
    year: movie.children[1].children[1].textContent,
    type: movie.children[1].children[2].textContent,
  }

  data.favorites.forEach((value, index) => {
    if (value.imdbID === imdbID) {
      conflict = index
    }
  })

  if (conflict === undefined) {
    data.favorites.push(favToSave)
    favoriteIcon.classList.add('added')
  } else {
    data.favorites.splice(conflict, 1)
    favoriteIcon.classList.remove('added')
  }

  setUserData(data)
}

//Extended Info, calling the api
const movieExtendedInfo = async (imdbID) => {
  modal.textContent = ''
  const loading = document.createElement('p')
  loading.textContent = 'Loading...'
  loading.classList.add('loading')
  modal.appendChild(loading)

  try {
    const dataJson = await fetch(
      `http://www.omdbapi.com/?apikey=13085c3f&i=${imdbID}`
    )
    const data = await dataJson.json()
    if (data.Response === 'True') showExtendedInfoMovies(data)
    else showExtendedInfoError(data.Error)
  } catch (error) {
    showExtendedInfoError(error)
  }
}

const showExtendedInfoError = (error) => {
  const textError = document.createElement('p')
  textError.textContent = error
  textError.classList.add('error')
  modal.textContent = ''
  modal.appendChild(textError)
}

//Extended Info, writing the information on the modal
const showExtendedInfoMovies = (data) => {
  const modalContent = document.createElement('div')
  const title = document.createElement('h2')
  const highlightText = document.createElement('span')
  const normalText = document.createElement('span')
  const details = document.createElement('div')
  const ratings = document.createElement('div')
  const ratingsTitle = document.createElement('p')

  highlightText.textContent = data.Title
  normalText.textContent = ' extended info'
  ratingsTitle.textContent = 'Ratings'

  modalContent.classList.add('modal__extended-info')
  title.classList.add('extended-info__title')
  normalText.classList.add('extended-info__title--normal-text')
  details.classList.add('extended-info__details')
  ratings.classList.add('extended-info__ratings')
  ratingsTitle.classList.add('ratings__title')

  title.append(highlightText, normalText)
  ratings.appendChild(ratingsTitle)
  modalContent.appendChild(title)

  for (const key in data) {
    //Image item
    if (key === 'Poster') {
      const el = document.createElement('img')
      el.setAttribute('src', data[key])
      el.classList.add('extended-info__poster')
      modalContent.appendChild(el)
    }
    //Array with rating information
    else if (Array.isArray(data[key])) {
      data[key].forEach((value) => {
        const el = document.createElement('p')
        const category = document.createElement('span')
        const description = document.createElement('span')
        category.textContent = `${value.Source}: `
        description.textContent = value.Value
        // category.classList.add('details__categories')
        description.classList.add('details__descriptions')
        el.append(category, description)
        ratings.appendChild(el)
      })
    }
    //Items with rating information
    else if (
      key === 'Metascore' ||
      key === 'imdbRating' ||
      key === 'imdbVotes'
    ) {
      const el = document.createElement('p')
      const category = document.createElement('span')
      const description = document.createElement('span')
      category.textContent = `${key}: `
      description.textContent = data[key]
      description.classList.add('details__descriptions')
      el.append(category, description)
      ratings.appendChild(el)
    }
    //Excluded items
    else if (key === 'imdbID' || key === 'Response') {
      continue
    }
    //All the others
    else {
      const el = document.createElement('p')
      const category = document.createElement('span')
      const description = document.createElement('span')
      category.textContent = `${key}: `
      description.textContent = data[key]
      description.classList.add('details__descriptions')
      el.append(category, description)
      details.appendChild(el)
    }
  }
  modalContent.append(details, ratings)
  modal.textContent = ''
  modal.appendChild(modalContent)
}

//Modal favorites
const showFavorites = () => {
  modal.textContent = ''
  const modalContent = document.createElement('div')
  modalContent.classList.add('modal__favorites')
  const data = getUserData()

  data.favorites.forEach((v) => {
    const faMovieContainer = document.createElement('div')
    const mediaContainer = document.createElement('div')
    const image = document.createElement('img')
    const favIcon = document.createElement('div')
    const infoContainer = document.createElement('div')
    const title = document.createElement('p')
    const year = document.createElement('p')
    const type = document.createElement('p')

    image.setAttribute('src', v.image)
    favIcon.dataset.favorite = v.imdbID
    title.textContent = v.title
    year.textContent = v.year
    type.textContent = v.type

    faMovieContainer.classList.add('favorites__famovie-container')
    mediaContainer.classList.add('famovie-container__famedia')
    image.classList.add('famedia__img')
    favIcon.classList.add('famedia__favorite', 'added')
    title.classList.add('fainfo__title')
    year.classList.add('fainfo__year')
    type.classList.add('fainfo__type')

    mediaContainer.append(image, favIcon)
    infoContainer.append(title, year, type)
    faMovieContainer.append(mediaContainer, infoContainer)
    modalContent.appendChild(faMovieContainer)
  })
  if (modalContent.children.length) {
    modal.appendChild(modalContent)
  } else {
    const empty = document.createElement('p')
    empty.classList.add('empty')
    empty.textContent = 'You have not added favorites yet'
    modal.appendChild(empty)
  }
}

const getUserData = () => {
  const key = sessionStorage.getItem('active')
  const json = localStorage.getItem(key)
  const data = JSON.parse(json)
  return data
}

const setUserData = (data) => {
  const key = sessionStorage.getItem('active')
  localStorage.setItem(key, JSON.stringify(data))
}
