'use client';
import {useSyncExternalStore} from 'react';

// The root layout marks pages opened inside the mobile app's WebView before hydration (html[data-embedded="app"]).
const read=()=>document.documentElement.dataset.embedded==='app';
const subscribe=()=>()=>{};

/** True inside the mobile app; false while prerendering and on the first hydration pass, so markup always matches. */
export function useEmbeddedApp(){return useSyncExternalStore(subscribe,read,()=>false)}
