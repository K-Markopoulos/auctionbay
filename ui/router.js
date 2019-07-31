import Vue from 'vue'
import VueRouter from 'vue-router'
import TokenService from './services/token.service'
import Home from './components/Home'
import Login from './components/Login'
import AuctionsList from './components/AuctionsList'
import AuctionPage from './components/AuctionPage'
import UsersList from './components/UsersList'
import UserPage from './components/UserPage'

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    { 
      path: '/',
      component: Home
    },
    {
      path: '/login',
      component: Login,
      meta: {
        public: true,
        onlyWhenLoggedOut: true
      }
    },
    {
      path: '/auctions',
      component: AuctionsList
    },
    {
      path: '/auctions/:id',
      component: AuctionPage
    },
    {
      path: '/users',
      component: UsersList
    },
    {
      path: '/users/:id',
      component: UserPage
    },
    {
      path: '*',
      component: {
        template: '<div>Ops, not found</div>'
      }
    },
  ]
});

router.beforeEach((to, from, next) => {
  const isPublic = to.matched.some(route => route.meta.public);
  const onlyWhenLoggedOut = to.matched.some(route => route.meta.onlyWhenLoggedOut);
  const loggedIn = !!TokenService.getToken();

  if (!isPublic && !loggedIn) {
    // need to login first
    next({
      path: '/login',
        query: {
        redirect: to.fullPath
      }
    });
  } else if (loggedIn && onlyWhenLoggedOut) {
    // nothing to do on login page, go home
    next('/');
  }

  next();
});

export default router;