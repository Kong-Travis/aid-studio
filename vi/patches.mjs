// Exact text substitutions applied after the dictionary rewrite. Each `find` must still exist
// upstream; apply.mjs warns (and CI reports) when a sync makes one stale.
export const PATCHES = {
  admin: [
    { why: 'antd locale', file: 'src/App.tsx', find: "import zhCN from 'antd/locale/zh_CN';", replace: "import zhCN from 'antd/locale/vi_VN';" },
    { why: 'dayjs locale import', file: 'src/App.tsx', find: "import 'dayjs/locale/zh-cn';", replace: "import 'dayjs/locale/vi';" },
    { why: 'dayjs locale', file: 'src/App.tsx', find: "dayjs.locale('zh-cn');", replace: "dayjs.locale('vi');" },
    { why: 'html lang', file: 'index.html', find: '<html lang="zh-CN">', replace: '<html lang="vi">' },
    { why: 'document title', file: 'index.html', find: '<title>管理系统</title>', replace: '<title>Hệ thống quản trị</title>' }
  ],
  web: [
    { why: 'html lang', file: 'app/layout.tsx', find: '<html lang="zh-CN">', replace: '<html lang="vi">' },
    { why: 'og:locale', file: 'components/app/PublicSiteHead.tsx', find: '<meta property="og:locale" content="zh_CN" />', replace: '<meta property="og:locale" content="vi_VN" />' },
    {
      why: 'antd locale import',
      file: 'components/app/AntdThemeProvider.tsx',
      find: "import { App, ConfigProvider } from 'antd'\n",
      replace: "import { App, ConfigProvider } from 'antd'\nimport viVN from 'antd/locale/vi_VN'\n"
    },
    {
      why: 'antd locale on providers',
      file: 'components/app/AntdThemeProvider.tsx',
      find: '      theme={AID_ANTD_THEME}\n      wave={{ disabled: true }}\n',
      replace: '      locale={viVN}\n      theme={AID_ANTD_THEME}\n      wave={{ disabled: true }}\n'
    }
  ]
}
