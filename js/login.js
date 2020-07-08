const form = document.getElementById('login-form')

if (sessionStorage.getItem('active')){
  location.pathname = '/imdbfinder.html'
}

const activeUser = (key) => {
  sessionStorage.setItem('active', key)
}

const create = (name, password) => {
  const user = {
    name: name,
    password: password,
    favorites: []
  }
  return JSON.stringify(user)
}

const keyGenerator = (name, password) => {
  return name+password
}

const showPerfil = (key) => {
  activeUser(key)
}


const userExist = (user, password) => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    const item = localStorage.getItem(key)
    const data = JSON.parse(item)
    if (data.name === user && data.password === password){
      return showPerfil(key)
    }
  }
  createPerfil(user, password)
}

const createPerfil = (user, password) => {
  const key = keyGenerator(user, password)
  localStorage.setItem(key, create(user, password))
  activeUser(key)
  showPerfil(key)
}

const addFavorite = (fav) => {
  const key = sessionStorage.getItem('active')
  const json = localStorage.getItem(key)
  const data = JSON.parse(json)
  data.favorites.push(fav)
  localStorage.setItem(key, JSON.stringify(data))  
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const name = form.name.value
  const password = form.password.value
  if (name !== '' && password !== ''){
    userExist(name, password)
  }

})