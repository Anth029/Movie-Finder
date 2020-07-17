const form = document.getElementById('search-form')
const results = document.getElementById('results')
const modal = document.getElementById('modal')
const menu = document.getElementById('menu')
// const modalContent = document.getElementById('modal-info-content')

if (!sessionStorage.getItem('active')){
  window.alert("Necesitas iniciar sesión")
  location.pathname = ''
}

form.addEventListener('submit', (e) => {
  console.log('Form')
  e.preventDefault()
  const movie = form.searchField.value
  if(movie !== ''){
    const loading = document.createElement('p')
    loading.textContent = 'Loading...'
    loading.classList.add('loading')
    results.textContent = ''
    results.appendChild(loading)
    callMovies(movie)
  }
})

menu.addEventListener('click', (e) => {
  console.log('Menu')
  if(e.target.id === "favorites-section") {
    modal.classList.add('show')
    showFavorites()
  } 
})

results.addEventListener('click', (e)=> {
  console.log('Results')
  const addThis = e.target.dataset.favorite
  const infoClick = e.target.dataset.imdbid
  
  if(addThis){
    toggleFavorite(addThis)
  }
  
  if (infoClick){
    modal.classList.add('show')
    movieExtendedInfo(infoClick)
  }
  
})

modal.addEventListener('click', (e)=> {
  console.log('Modal')
  if (e.target === modal) modal.classList.remove('show')
})

const callMovies = async (movie) => {
  try {
    const dataJson = await fetch(
      `http://www.omdbapi.com/?apikey=13085c3f&s=${movie}`
  )
  const data = await dataJson.json()
  if (data.Response !== 'False') showMovies(data)
  else showError(data.Error)
  } catch (error) {
    showError(error)
  }
  
}

//Movies search result: data consuming from omdbapi
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
    
    getData().favorites.forEach((v)=> {
      if(v.imdbID === obj.imdbID){
        favorite.classList.add('added')
      }
    })
    container.classList.add('movie-container')
    mediaContainer.classList.add('movie-container__media-container')
    infoContainer.classList.add('movie-container__info-container')
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
  results.textContent = ''
  results.appendChild(fragment)
}

const showError = (message) => {
  const error = document.createElement('p')
  error.classList.add('error')
  error.textContent = message
  results.textContent = ''
  results.appendChild(error)
}



const toggleFavorite = (imdbID) => {
  const movie = document.querySelector(`[data-imdbid=${imdbID}]`)
  const favoriteIcon = document.querySelector(`[data-favorite=${imdbID}]`)
  const data = getData()
  let conflict
  
  const favToSave = {
    imdbID: imdbID,
    data: movie.innerHTML
  }
  
  data.favorites.forEach((value, index)=> {
    if(value.imdbID === imdbID){
      conflict = index
    }
  })
  
  if(conflict === undefined){
    data.favorites.push(favToSave)
    favoriteIcon.classList.add('added')
  }else {
    data.favorites.splice(conflict, 1)
    favoriteIcon.classList.remove('added')    
  }

  setData(data) 
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
  modalContent.textContent = ''
  modalContent.appendChild(textError)
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
  highlightText.classList.add('extended-info__title--highlight-text')
  normalText.classList.add('extended-info__title--normal-text')
  details.classList.add('extended-info__details')
  ratings.classList.add('extended-info__ratings')
  ratingsTitle.classList.add('ratings__title')
  
  
  
  title.append(highlightText, normalText)
  ratings.appendChild(ratingsTitle)
  modalContent.appendChild(title)
  
  for (const key in data) {
    //Image item
    if(key === 'Poster'){
      const el = document.createElement('img')
      el.setAttribute('src', data[key])
      el.classList.add('extended-info__poster')
      modalContent.appendChild(el)
    }
    //Array with rating information
    else if(Array.isArray(data[key])){      
      data[key].forEach(value => {
        const el = document.createElement('p')
        const category = document.createElement('span')
        const description = document.createElement('span')
        category.textContent = `${value.Source}: `
        description.textContent = value.Value
        category.classList.add('details__categories')
        description.classList.add('details__descriptions')
        el.append(category, description)
        ratings.appendChild(el)
      })
    }
    //Items with rating information
    else if(key === 'Metascore' || key === 'imdbRating' || key === 'imdbVotes'){
      const el = document.createElement('p')
      const category = document.createElement('span')
      const description = document.createElement('span')
      category.textContent = `${key}: `
      description.textContent = data[key]
      category.classList.add('details__categories')
      description.classList.add('details__descriptions')
      el.append(category, description)
      ratings.appendChild(el)
    }
    //Excluded items
    else if(key === 'imdbID' || key === 'Response'){
      continue
    }
    //All the others
    else {
      const el = document.createElement('p')
      const category = document.createElement('span')
      const description = document.createElement('span')
      category.textContent = `${key}: `
      description.textContent = data[key]
      category.classList.add('details__categories')
      description.classList.add('details__descriptions')
      el.append(category, description)
      details.appendChild(el)
    }
  }
  modalContent.append(details ,ratings)
  modal.textContent = ''
  modal.appendChild(modalContent)  
}

//Modal favorites

const showFavorites = () => {
  modal.textContent = ''
  const modalContent = document.createElement('div')
  modalContent.classList.add('favorites')
  const data = getData()
  console.log(data.favorites[0].data)
  
  data.favorites.forEach((v) => {
    const container = document.createElement('div')
    container.classList.add('movie-container')
    container.innerHTML = v.data
    modalContent.appendChild(container)
  })
  console.log(modalContent)
  modal.appendChild(modalContent)
}

const getData = () => {
  const key = sessionStorage.getItem('active')
  const json = localStorage.getItem(key)
  const data = JSON.parse(json)
  return data
}

const setData = (data) => {
  const key = sessionStorage.getItem('active')
  localStorage.setItem(key, JSON.stringify(data)) 
}