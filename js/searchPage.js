const form = document.getElementById('search-form')
const movieSpace = document.getElementById('results')
const modal = document.getElementById('modal-info')
const modalContent = document.getElementById('modal-info-content')

if (!sessionStorage.getItem('active')){
  window.alert("Necesitas iniciar sesión")
  location.pathname = ''
}

const showError = (message) => {
  const error = document.createElement('p')
  error.textContent = message
  movieSpace.textContent = ''
  movieSpace.appendChild(error)
}

//Movies search result: data consuming from omdbapi
const showMovies = (movies) => {
  const fragment = document.createDocumentFragment()
  movies.Search.forEach((obj) => {
    const container = document.createElement('div')
    const favorite = document.createElement('div')
    const imgContainer = document.createElement('div')
    const info = document.createElement('div')
    const img = document.createElement('img')
    const title = document.createElement('p')
    const year = document.createElement('p')
    const type = document.createElement('p')

    container.setAttribute('id', obj.imdbID)
    title.textContent = obj.Title
    year.textContent = obj.Year
    type.textContent = obj.Type
    img.setAttribute('src', obj.Poster)
    
    if (getData().favorites.includes(obj.imdbID)){
      favorite.classList.add('added')      
    }
    favorite.classList.add('movie-container__favorite')
    container.classList.add('movie-container')
    imgContainer.classList.add('movie-container__img-container')
    img.classList.add('movie-container__img')
    title.classList.add('movie-container__title')
    year.classList.add('movie-container__year')
    type.classList.add('movie-container__type')
    info.classList.add('movie-container__info')

    imgContainer.appendChild(img)
    info.append(title, year, type)
    container.append(favorite, imgContainer, info)
    fragment.appendChild(container)
  })
  movieSpace.textContent = ''
  movieSpace.appendChild(fragment)
}

const callMovies = async (movie) => {
  try {
    const dataJson = await fetch(
    `http://www.omdbapi.com/?apikey=13085c3f&s=${movie}`
  )
  const data = await dataJson.json()
  if (data.Response === 'False') showError(data.Error)
  else showMovies(data)
  } catch (error) {
    showError(error)
  }
  
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

const toggleFavorite = (imdbID) => {
  const fav = document.getElementById(imdbID).firstElementChild
  const data = getData()
  if (data.favorites.includes(imdbID)){
    data.favorites.splice(data.favorites.indexOf(imdbID),1)
    fav.classList.remove('added')
  }else {
    data.favorites.push(imdbID)
    fav.classList.add('added')
  }  
  setData(data) 
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const movie = form.searchField.value
  if(movie !== ''){
    movieSpace.textContent = 'Loading...'
    callMovies(movie)
  }
})

movieSpace.addEventListener('click', (e)=> {
  if(e.target.className === "movie-container__img" || e.target.className === 'movie-container__title'){
    movieExtendedInfo(e.target.offsetParent.id)
    modal.classList.add('show')
  }
  
  if(e.target.classList.contains('movie-container__favorite')){
    toggleFavorite(e.target.offsetParent.id)
  }
})
//Get out of modal window
modal.addEventListener('click', (e)=> {
  if (e.target.id === modal.id) modal.classList.remove('show')
})

//Extended Info, calling the api
const movieExtendedInfo = async (imdbID) => {
  modalContent.textContent = 'Loading...'
  try {
    const dataJson = await fetch(
    `http://www.omdbapi.com/?apikey=13085c3f&i=${imdbID}`
  )
  const data = await dataJson.json()
  if (data.Response === 'False') showExtendedInfoError(data.Error)
  else showExtendedInfoMovies(data)
  } catch (error) {
    showExtendedInfoError(error)
  }
}

const showExtendedInfoError = (error) => {
  modalContent.textContent = ''
  modalContent.textContent = error
}

//Extended Info, writing the information on the modal
const showExtendedInfoMovies = (data) => {
  const fragment = document.createDocumentFragment()
  const modalTitle = document.createElement('h2')
  const movieTitle = document.createElement('span')
  const movieTitlePartner = document.createElement('span')

  movieTitle.textContent = data.Title
  movieTitlePartner.textContent = ' extended info'

  movieTitle.classList.add('movie-title')
  modalTitle.classList.add('modal-title')
  movieTitlePartner.classList.add('movie-title-partner')

  modalTitle.append(movieTitle, movieTitlePartner)

  const ratings = document.createElement('div')
  ratings.classList.add('movie-ratings')
  const ratingsTitle = document.createElement('p')
  ratingsTitle.classList.add('movie-ratings__title')
  ratingsTitle.textContent = 'Ratings'

  fragment.appendChild(modalTitle)
  ratings.appendChild(ratingsTitle)
  
  for (const key in data) {
    //Image item
    if(key === 'Poster'){
      const el = document.createElement('img')
      el.setAttribute('src', data[key])
      el.classList.add('movie-poster')
      fragment.appendChild(el)
    }
    //Array with rating information
    else if(Array.isArray(data[key])){      
      data[key].forEach(value => {
        const el = document.createElement('p')
        const category = document.createElement('span')
        const description = document.createElement('span')
        category.textContent = `${value.Source}: `
        description.textContent = value.Value
        el.classList.add('movie-details')
        category.classList.add('movie-categories')
        description.classList.add('movie-descriptions')
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
      el.classList.add('movie-details')
      category.classList.add('movie-categories')
      description.classList.add('movie-descriptions')
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
      el.classList.add('movie-details')
      category.classList.add('movie-categories')
      description.classList.add('movie-descriptions')
      el.append(category, description)
      fragment.appendChild(el)
    }
  }

  modalContent.textContent = ''
  fragment.appendChild(ratings)
  modalContent.appendChild(fragment)  
}