const form = document.getElementById('login-form')

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const name = form.name.value
  const password = form.password.value
  if (name !== '' && password !== ''){
    userExist(name, password)
  }

})

const isLoged = () => {
  if (sessionStorage.getItem('active')){
    location.pathname = '/imdbfinder.html'
  }
}

isLoged()

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
  localStorage.setItem(key, userInfo(user, password))
  showPerfil(key)
}

const keyGenerator = (name, password) => {
  return name+password
}

const userInfo = (name, password) => {
  const user = {
    name: name,
    password: password,
    favorites: []
  }
  return JSON.stringify(user)
}

const showPerfil = (key) => {
  sessionStorage.setItem('active', key)
  isLoged()
}