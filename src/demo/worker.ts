import { WorkerModule, createWorkerBridge } from '@/index';
import { MainModule } from './main';

export class ChildModule implements WorkerModule {
  [method: string]: (...args: any[]) => Promise<any>;

  constructor() {}

  async outputInWorker() {
    const s = await Promise.resolve('outputInWorker');
    console.log('[worker]', s);
    return s;
  }

  async outputErrorInWorker() {
    const s = await Promise.reject(new Error('outputErrorInWorker'));
    console.log('[worker]', s);
    return s;
  }
}

const selfModule = new ChildModule();
const bridge = createWorkerBridge(selfModule) as MainModule;

setTimeout(() => {
  bridge
    .outputInMain()
    .then((v) => {
      console.log('[worker]', 'childModule.outputInMain result: ', v);
    })
    .catch((e) => {
      console.log('[worker]', 'childModule.outputInMain error: ', e);
    });
}, 15000);

setTimeout(() => {
  bridge
    .outputErrorInMain()
    .then((v) => {
      console.log('[worker]', 'childModule.outputErrorInMain result: ', v);
    })
    .catch((e) => {
      console.log('[worker]', 'childModule.outputErrorInMain error: ', e);
    });
}, 20000);
