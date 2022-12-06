import { WorkerModule, createWorkerBridge } from '@/index';
import { ChildModule } from './worker';

export class MainModule implements WorkerModule {
  [method: string]: (...args: any[]) => Promise<any>;

  constructor() {}

  async outputInMain() {
    const s = await Promise.resolve('outputInMain');
    console.log('[main]', s);
    return s;
  }

  async outputErrorInMain() {
    const s = await Promise.reject('outputErrorInMain');
    console.log('[main]', s);
    return s;
  }
}

const selfModule = new MainModule();
const bridge = createWorkerBridge(
  selfModule,
  '/dist/wwb.umd.js'
) as ChildModule;

setTimeout(() => {
  bridge
    .outputInWorker()
    .then((v) => {
      console.log('[main]', 'childModule.outputInWorker result: ', v);
    })
    .catch((e) => {
      console.log('[main]', 'childModule.outputInWorker error: ', e);
    });
}, 5000);

setTimeout(() => {
  bridge
    .outputErrorInWorker()
    .then((v) => {
      console.log('[main]', 'childModule.outputErrorInWorker result: ', v);
    })
    .catch((e) => {
      console.log('[main]', 'childModule.outputErrorInWorker error: ', e);
    });
}, 10000);
