// ref:
// - https://umijs.org/plugins/api
import { IApi, IRoute } from '@umijs/types';
import { join } from 'path';
// const { register } = require('@adonisjs/require-ts');
const DEFAULT_APP_PREFIX = '@sensoro/application-';

// const appRoot = __dirname;

// const options = {
//   cache: false,
//   transformers: {
//     before: [{ transform: './transformer-before' }],
//     // after: [{ transform: './transformer-after' }],
//     afterDeclarations: [],
//   },
// };
// console.log('appRoot = ', appRoot);
// register(appRoot, options);

export default function(api: IApi) {
  api.logger.info('use plugin');
  api.describe({
    key: 'application',
    config: {
      schema(joi) {
        return joi.object({
          container: joi.boolean(),
          regular: joi.any(),
        });
      },
    },
  });

  const { application } = api.userConfig;

  const container =
    typeof application === 'undefined'
      ? false
      : typeof application.container === 'boolean'
      ? application.container
      : true;
  const regular = (application && application.regular) ?? DEFAULT_APP_PREFIX;

  if (container) {
    if (api?.paths?.cwd) {
      const packageJson = require(join(api.paths.cwd, 'package.json'));
      const apps = Object.keys(packageJson.dependencies ?? {}).reduce<string[]>(
        (prev, c) => {
          if (typeof regular === 'string') {
            if (c.startsWith(regular)) {
              prev.push(c);
            }
          } else {
            if (regular.test(c)) {
              prev.push(c);
            }
          }
          return prev;
        },
        [],
      );

      function reslovePath(path: string, namespace: string) {
        if (path.startsWith('@/')) {
          const nPath = path.replace('@/', `${namespace}/lib/`);
          const index = nPath.indexOf('@sensoro/');
          return nPath.slice(index);
        } else {
          throw new Error('路由compontent暂时只支持以@/开头的路径');
        }
      }

      function resloveRoutes(routes: IRoute[], namespace: string) {
        routes.forEach(route => {
          if (route.component) {
            route.component = reslovePath(route.component, namespace);
          }
          if (route.routes && route.routes.length > 0) {
            resloveRoutes(route.routes, namespace);
          }
        });
      }

      apps.forEach(app => {
        if (api?.paths?.cwd) {
          const manifestPath = join(
            api.paths.cwd,
            `node_modules/${app}/lib`,
            'manifest.js',
          );
          try {
            const { routes: appRoutes } = require(manifestPath);
            resloveRoutes(appRoutes, app);
            api.modifyRoutes(routes => {
              if (appRoutes && appRoutes?.length > 0 && routes?.[0]?.routes) {
                routes[0].routes = routes[0].routes.concat(appRoutes);
              }
              return routes;
            });
          } catch (error) {}
        }
      });
      console.log('apps = ', apps);
    }
  } else {
    function checkManifest() {
      console.log('检查manifest信息...');
      if (api?.paths?.cwd) {
        const manifestFile = require(join(api.paths.cwd, 'src', 'manifest.js'));
        const { appType, category } = manifestFile;
        console.log('appType = ', appType);
        console.log('category = ', category);
        if (!(typeof appType === 'string' && typeof category === 'string')) {
          throw new Error('检查到manifest信息不合法!');
        }
        return manifestFile;
      }
      console.log('manifest合法...');
    }

    if (api.env === 'development') {
      const { routes: appRoutes } = checkManifest();

      api.modifyRoutes(routes => {
        return appRoutes && appRoutes?.length > 0
          ? (routes ?? []).concat(appRoutes)
          : routes;
      });
    }
  }
}
