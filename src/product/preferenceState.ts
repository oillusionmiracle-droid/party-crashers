import type {Preferences} from './data';
/** A partial cloud profile must never erase setup completed on this device. */
export function reconcilePreferences(local:Preferences,remote?:Preferences|null):Preferences{
 if(!remote)return local;
 if(local.complete&&!remote.complete)return local;
 return remote;
}
export function afterSignInRoute(complete:boolean,requested:string|null):string{
 if(!complete)return 'setup/interests';
 if(requested&&/^(discover|map|post|saved|profile|event\/[\w-]+)$/.test(requested))return requested;
 return 'discover';
}
