// 这是项目发布阶段需要用到的 babel 插件,transform-remove-console用于在生产环境删除console.log
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
    prodPlugins.push('transform-remove-console')
}


module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset'
    ],
    plugins: [
        [
            'component',
            {
                libraryName: 'element-ui',
                styleLibraryName: 'theme-chalk'
            }
        ],
        // 发布产品时的插件数组
        ...prodPlugins,
        // 实现路由的懒加载
        '@babel/plugin-syntax-dynamic-import'
    ]
}
