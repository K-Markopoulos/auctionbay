
import Vue from 'vue'
import VueRouter from 'vue-router'
import TokenService from './services/token.service'
import Home from './components/Home'
import Login from './components/Login'
import Registration from './components/Registration'
import AuctionsList from './components/AuctionsList'
import AuctionPage from './components/AuctionPage'
import AdminPanel from './components/AdminPanel'
import UserPage from './components/UserPage'
import MessagesPage from './components/MessagesPage'

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    { 
      path: '/',
      component: Home,
      meta: {
        public: true,
      }
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
      path: '/register',
      component: Registration,
      meta: {
        public: true,
        onlyWhenLoggedOut: true
      }
    },
    {
      path: '/auctions',
      component: AuctionsList,
      meta: {
        public: true,
      }
    },
    {
      path: '/auctions/:id',
      component: AuctionPage,
      props: true,
      meta: {
        public: true,
      }
    },
    {
      path: '/admin',
      component: AdminPanel
    },
    {
      path: '/users/:id',
      component: UserPage,
      props: true
    },
    {
      path: '/messages',
      component: MessagesPage
    },
    {
      path: '*',
      component: {
        template: '<div>Ops, not found</div>'
      },
      meta: {
        public: true,
      }
    },
  ],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
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
  } else {
    next();
  }
});

export default router;