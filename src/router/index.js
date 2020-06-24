import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
// 突然间发现import后面的值是自定义的，我一直以为是和文件名要保持一致的
import GoodsList from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'

Vue.use(VueRouter)

const routes = [{
    path: '/',
    redirect: '/login'
}, {
    path: '/login',
    component: Login
}, {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
        path: '/welcome',
        component: Welcome
    }, {
        path: '/users',
        component: Users
    }, {
        path: '/rights',
        component: Rights
    }, {
        path: '/roles',
        component: Roles
    }, {
        path: '/categories',
        component: Cate
    }, {
        path: '/params',
        component: Params
    }, {
        path: '/goods',
        component: GoodsList
    }, {
        path: '/goods/add',
        component: Add
    }, {
        path: '/orders',
        component: Order
    }]
}]

const router = new VueRouter({
    routes
})

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

// 创建路由导航守卫
router.beforeEach((to, from, next) => {
    // to 将要访问的路径
    // from 代表从哪个路径来
    // next 是一个函数，表示放行 next('/login')强制跳转
    if (to.path === '/login') return next()
        // 获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})

export default router
