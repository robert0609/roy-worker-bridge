# roy-worker-bridge

> Web worker communication brigde. Use this, you can communicate between main thread and worker thread like function calling

## Build Setup

``` bash
# install dependencies
npm install

# start development server for debug
npm run dev

# build in production
npm run build
```

## Sample

in main thread:

```javascript
import { createWorkerBridge } from 'roy-worker-bridge';

export class MainModule {
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
  'XXXXXX' // worker js file's url
);

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
```

in worker thread:

```javascript
import { createWorkerBridge } from 'roy-worker-bridge';

export class ChildModule {
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
const bridge = createWorkerBridge(selfModule);

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
```
