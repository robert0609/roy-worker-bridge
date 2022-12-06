import { WorkerModule, createWorkerBridge } from '@/index';
import { MainModule } from './main';

export class ChildModule implements WorkerModule {
  [method: string | symbol]: (...args: any[]) => Promise<any>;

  constructor() {}

  async outputInWorker() {
    const s = await Promise.resolve('outputInWorker');
    console.log('[worker]', s);
    return s;
  }

  async outputErrorInWorker() {
    const s = await Promise.reject('outputErrorInWorker');
    console.log('[worker]', s);
    return s;
  }
}
