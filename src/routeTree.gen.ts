import { Route as rootRouteImport } from './routes/__root'
import { Route as SignupRouteImport } from './routes/signup'
import { Route as SettingsRouteImport } from './routes/settings'
import { Route as MessagesRouteImport } from './routes/messages'
import { Route as LoginRouteImport } from './routes/login'
import { Route as HelpRouteImport } from './routes/help'
import { Route as DashboardRouteImport } from './routes/dashboard'
import { Route as CoursesRouteImport } from './routes/courses'
import { Route as AssessmentsRouteImport } from './routes/assessments'
import { Route as AnalyticsRouteImport } from './routes/analytics'
import { Route as AdminRouteImport } from './routes/admin'
import { Route as IndexRouteImport } from './routes/index'

const SignupRoute = SignupRouteImport.update({
  id: '/signup',
  path: '/signup',
  getParentRoute: () => rootRouteImport,
} as any)
const SettingsRoute = SettingsRouteImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => rootRouteImport,
} as any)
const MessagesRoute = MessagesRouteImport.update({
  id: '/messages',
  path: '/messages',
  getParentRoute: () => rootRouteImport,
} as any)
const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)
const HelpRoute = HelpRouteImport.update({
  id: '/help',
  path: '/help',
  getParentRoute: () => rootRouteImport,
} as any)
const DashboardRoute = DashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => rootRouteImport,
} as any)
const CoursesRoute = CoursesRouteImport.update({
  id: '/courses',
  path: '/courses',
  getParentRoute: () => rootRouteImport,
} as any)
const AssessmentsRoute = AssessmentsRouteImport.update({
  id: '/assessments',
  path: '/assessments',
  getParentRoute: () => rootRouteImport,
} as any)
const AnalyticsRoute = AnalyticsRouteImport.update({
  id: '/analytics',
  path: '/analytics',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminRoute = AdminRouteImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/analytics': typeof AnalyticsRoute
  '/assessments': typeof AssessmentsRoute
  '/courses': typeof CoursesRoute
  '/dashboard': typeof DashboardRoute
  '/help': typeof HelpRoute
  '/login': typeof LoginRoute
  '/messages': typeof MessagesRoute
  '/settings': typeof SettingsRoute
  '/signup': typeof SignupRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/analytics': typeof AnalyticsRoute
  '/assessments': typeof AssessmentsRoute
  '/courses': typeof CoursesRoute
  '/dashboard': typeof DashboardRoute
  '/help': typeof HelpRoute
  '/login': typeof LoginRoute
  '/messages': typeof MessagesRoute
  '/settings': typeof SettingsRoute
  '/signup': typeof SignupRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/analytics': typeof AnalyticsRoute
  '/assessments': typeof AssessmentsRoute
  '/courses': typeof CoursesRoute
  '/dashboard': typeof DashboardRoute
  '/help': typeof HelpRoute
  '/login': typeof LoginRoute
  '/messages': typeof MessagesRoute
  '/settings': typeof SettingsRoute
  '/signup': typeof SignupRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/admin'
    | '/analytics'
    | '/assessments'
    | '/courses'
    | '/dashboard'
    | '/help'
    | '/login'
    | '/messages'
    | '/settings'
    | '/signup'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/admin'
    | '/analytics'
    | '/assessments'
    | '/courses'
    | '/dashboard'
    | '/help'
    | '/login'
    | '/messages'
    | '/settings'
    | '/signup'
  id:
    | '__root__'
    | '/'
    | '/admin'
    | '/analytics'
    | '/assessments'
    | '/courses'
    | '/dashboard'
    | '/help'
    | '/login'
    | '/messages'
    | '/settings'
    | '/signup'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdminRoute: typeof AdminRoute
  AnalyticsRoute: typeof AnalyticsRoute
  AssessmentsRoute: typeof AssessmentsRoute
  CoursesRoute: typeof CoursesRoute
  DashboardRoute: typeof DashboardRoute
  HelpRoute: typeof HelpRoute
  LoginRoute: typeof LoginRoute
  MessagesRoute: typeof MessagesRoute
  SettingsRoute: typeof SettingsRoute
  SignupRoute: typeof SignupRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/signup': {
      id: '/signup'
      path: '/signup'
      fullPath: '/signup'
      preLoaderRoute: typeof SignupRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/settings': {
      id: '/settings'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof SettingsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/messages': {
      id: '/messages'
      path: '/messages'
      fullPath: '/messages'
      preLoaderRoute: typeof MessagesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/help': {
      id: '/help'
      path: '/help'
      fullPath: '/help'
      preLoaderRoute: typeof HelpRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/dashboard': {
      id: '/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/courses': {
      id: '/courses'
      path: '/courses'
      fullPath: '/courses'
      preLoaderRoute: typeof CoursesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/assessments': {
      id: '/assessments'
      path: '/assessments'
      fullPath: '/assessments'
      preLoaderRoute: typeof AssessmentsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/analytics': {
      id: '/analytics'
      path: '/analytics'
      fullPath: '/analytics'
      preLoaderRoute: typeof AnalyticsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AdminRoute: AdminRoute,
  AnalyticsRoute: AnalyticsRoute,
  AssessmentsRoute: AssessmentsRoute,
  CoursesRoute: CoursesRoute,
  DashboardRoute: DashboardRoute,
  HelpRoute: HelpRoute,
  LoginRoute: LoginRoute,
  MessagesRoute: MessagesRoute,
  SettingsRoute: SettingsRoute,
  SignupRoute: SignupRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
