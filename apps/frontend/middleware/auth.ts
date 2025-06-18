export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('token') // ใช้กับ cookie แทน
    if (!token.value) return navigateTo('/login/')
})