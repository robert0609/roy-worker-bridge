import { guid } from './guid';
import { isFunction, isPromise } from './typeAssert';

export interface BridgeCallMessage {
  name: 'call';
  method: string | symbol;
  callId: string;
  data: any[];
}

export interface BridgeResultMessage {
  name: 'result';
  method: string | symbol;
  callId: string;
  error?: Error;
  data?: any;
}

export interface WorkerModule {
  [method: string | symbol]: (...args: any[]) => Promise<any>;
}

const bridgeMap: { [key: string]: WorkerModule } = {};

export function createWorkerBridge(
  selfModule: WorkerModule,
  targetWorkerUrl?: string
): WorkerModule {
  const resultCallbackMap: Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
    }
  > = new Map();

  let targetWorker: Worker | undefined;

  // 针对跨worker访问的代理
  const proxyTarget: WorkerModule = {};

  // 单例判断
  const singleKey = targetWorkerUrl || 'main';
  if (!!bridgeMap[singleKey]) {
    return bridgeMap[singleKey];
  }

  if (targetWorkerUrl !== undefined) {
    targetWorker = new Worker(targetWorkerUrl);
  }

  function onMessageCallback(
    e: MessageEvent<BridgeCallMessage | BridgeResultMessage>
  ) {
    const msg = e.data;
    const callId = msg.callId;
    switch (msg.name) {
      case 'call':
        const method = selfModule[msg.method];
        if (isFunction(method)) {
          try {
            const r = method.call(selfModule, ...msg.data);
            if (isPromise(r)) {
              r.then((data) => {
                sendMessage({
                  name: 'result',
                  method: msg.method,
                  callId,
                  data
                });
              }).catch((e) => {
                sendMessage({
                  name: 'result',
                  method: msg.method,
                  callId,
                  error: e
                });
              });
            } else {
              sendMessage({
                name: 'result',
                method: msg.method,
                callId,
                data: r
              });
            }
          } catch (e) {
            sendMessage({
              name: 'result',
              method: msg.method,
              callId,
              error: e as Error
            });
          }
        } else {
          sendMessage({
            name: 'result',
            method: msg.method,
            callId,
            error: new Error(`方法[${msg.method.toString()}]不存在`)
          });
        }
        break;
      case 'result':
        const cbs = resultCallbackMap.get(callId);
        if (!!cbs) {
          resultCallbackMap.delete(callId);

          const { resolve, reject } = cbs;
          if (!msg.error) {
            // 成功的情况
            resolve(msg.data);
          } else {
            // 失败的情况
            reject(msg.error);
          }
        }
        break;
    }
  }

  if (targetWorker === undefined) {
    onmessage = onMessageCallback;
  } else {
    targetWorker.onmessage = onMessageCallback;
  }

  function sendMessage(message: BridgeCallMessage | BridgeResultMessage) {
    if (targetWorker === undefined) {
      postMessage(message);
    } else {
      targetWorker.postMessage(message);
    }
  }

  async function callMethod(methodName: string | symbol, data: any[]) {
    return new Promise<any>((resolve, reject) => {
      const callId = guid();
      resultCallbackMap.set(callId, { resolve, reject });
      sendMessage({
        name: 'call',
        method: methodName,
        data,
        callId
      });
    });
  }

  bridgeMap[singleKey] = new Proxy(proxyTarget, {
    get(target, p, receiver) {
      return async function (...args: any[]): Promise<any> {
        return callMethod(p, args);
      };
    }
  });

  return bridgeMap[singleKey];
}
