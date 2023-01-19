import { environment } from 'src/environments/environment';
import { Message } from './../models/message';
import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hub: signalR.HubConnection | undefined
  refreshChart$ = new Subject<boolean>();
  message$ = new Subject<string>();
  isTyping$ = new Subject<boolean>();
  seen$ =new Subject<boolean>();

  constructor() {
    this.refreshChart$.next(true);
  }

  public startConnection = () => {
    this.hub = new signalR.HubConnectionBuilder()
                            .withUrl(`${environment.BaseUrl}/client`,{ skipNegotiation: true, transport: signalR.HttpTransportType.WebSockets})
                            .build();
    this.hub.start().then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public refreshChart = () => {
    this.hub?.on('refreshChart', () => {this.refreshChart$.next(!this.refreshChart$); console.log("Am primit prin webSocket");})
  }

  public notification = () => {
    this.hub?.on('notifyClient', () => alert("Energy limit exceeded!"))
  }

  public sendMessageToClient = (messageToSend : string) => {
    this.hub?.invoke('SendClientMessage', messageToSend);
  }
  public sendMessageToAdmin = (messageToSend: string) => {
    this.hub?.invoke('SendAdminMessage', messageToSend);
  }

  public reciveMessageFromClient = () => {
    this.hub?.on('reciveAdminMessage', (message: string) => {
      this.message$.next(message);
    })
  }
  public reciveMessageFromAdmin = () => {
    this.hub?.on('reciveClientMessage', (message: string) => {
      this.message$.next(message);
    })
  }

  public sendAdminIsTyping = (isTyping : boolean) => {
    this.hub?.invoke('TypingAdmin', isTyping);
  }
  public sendClientIsTyping = (isTyping: boolean) => {
    this.hub?.invoke('TypingClient', isTyping);
  }

  public reciveAdminIsTyping = () => {
    this.hub?.on('adminIsTyping', (isTyping: boolean) => {
      this.isTyping$.next(isTyping);
    })
  }
  public reciveClientIsTyping = () => {
    this.hub?.on('clientIsTyping', (isTyping: boolean) => {
      this.isTyping$.next(isTyping);
    })
  }

  public sendClientSeenMessage = (seen : boolean) => {
    this.hub?.invoke('SeenClient', seen);
  }
  public sendAdminSeenMessage = (seen: boolean) => {
    this.hub?.invoke('SeenAdmin', seen);
  }

  public reciveSeenFormAdmin = () => {
    this.hub?.on('adminSeen', (seen: boolean) => {
      this.seen$.next(seen);
    })
  }
  public reciveSeenFormClient = () => {
    this.hub?.on('clientSeen', (seen: boolean) => {
      this.seen$.next(seen);
    })
  }

}
