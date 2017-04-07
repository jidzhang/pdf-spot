export default [
  {
    path: '/',
    // name: 'landing-page',
    // component: require('components/LandingPageView')
    name: 'home-page',
    component: require('components/HomePage')
  },
  {
    path: '*',
    redirect: '/'
  }
]
