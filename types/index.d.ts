import { IRoute } from '@umijs/types';

export interface Application {
  appType: string;
  category: string;
  routes: IRoute[];
}
