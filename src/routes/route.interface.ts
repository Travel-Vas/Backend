import { IRouter } from 'express';

export default interface IRoute {
  router: IRouter;
  path: string;
}
