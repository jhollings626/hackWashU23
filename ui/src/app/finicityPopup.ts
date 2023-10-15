import {
  FinicityConnect,
} from '@finicity/connect-web-sdk';
import type {
  ConnectEventHandlers,
  ConnectOptions,
  ConnectDoneEvent,
  ConnectCancelEvent,
  ConnectErrorEvent,
  ConnectRouteEvent
} from '@finicity/connect-web-sdk';

export class ConnectComponent {
  
  connectEventHandlers: ConnectEventHandlers = {
    onDone: (event: ConnectDoneEvent) => { console.log(event); },
    onCancel: (event: ConnectCancelEvent) => { console.log(event); },
    onError: (event: ConnectErrorEvent) => { console.log(event); },
    onRoute: (event: ConnectRouteEvent) => { console.log(event); },
    onUser: (event) => { console.log(event); },
    onLoad: () => { console.log('loaded'); }
  };

  connectOptions: ConnectOptions = {
    popup: true,
    popupOptions: {
      width: 600,
      height: 600,
      top: (window?.top?.outerHeight ?? 1) / 2 + (window?.top?.screenY ?? 1) - (600 / 2),
      left: (window?.top?.outerWidth ?? 1) / 2 + (window?.top?.screenX ?? 1) - (600 / 2)
    }
  };

  constructor(connectUrl: string, onDoneCallback: (event: ConnectDoneEvent) => void) {
    this.connectEventHandlers.onDone = onDoneCallback;
    FinicityConnect.launch(
       connectUrl,
       this.connectEventHandlers,
       this.connectOptions
    );
  }
}

