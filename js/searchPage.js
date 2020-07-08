const form = document.getElementById('search-form')
const movieSpace = document.getElementById('results')

const showError = (message) => {
  const error = document.createElement('p')
  error.textContent = message
  movieSpace.appendChild(error)
}

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
    
    container.classList.add('movie-container')
    favorite.classList.add('movie-container__favorite')
    imgContainer.classList.add('movie-container__img-container')
    img.classList.add('movie-container__img')
    title.classList.add('movie-container__title')
    year.classList.add('movie-container__year')
    type.classList.add('movie-container__type')

    imgContainer.appendChild(img)
    info.append(title, year, type)
    container.append(favorite, imgContainer, info)
    fragment.appendChild(container)
  })
  movieSpace.appendChild(fragment)
}

const callMovies = async (movie) => {
  const dataJson = await fetch(
    `http://www.omdbapi.com/?apikey=13085c3f&s=${movie}`
  )
  const data = await dataJson.json()
  if (data.Response === 'False') showError(data.Error)
  else showMovies(data)
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const movie = form.searchField.value
  movieSpace.textContent = ''
  callMovies(movie)
})

movieSpace.addEventListener('click', (e)=> {
  console.log(e.target)
})