import { DEFAULT_CHILD_ID, LEGACY_PROFILE_KEY, PROFILE_KEY_PREFIX, ROSTER_KEY } from "./storageKeys";

/** Tiny pre-hydration script that applies the active learner's motion preference
 * before first paint. It understands both the roster-era namespaced profile and
 * the legacy single-profile key. */
export const motionInit = `(function(){try{var r=JSON.parse(localStorage.getItem(${JSON.stringify(ROSTER_KEY)})||"{}");var id=(r&&typeof r.activeId==="string"&&r.activeId)||${JSON.stringify(DEFAULT_CHILD_ID)};var raw=localStorage.getItem(${JSON.stringify(PROFILE_KEY_PREFIX)}+id)||localStorage.getItem(${JSON.stringify(LEGACY_PROFILE_KEY)})||"{}";var p=JSON.parse(raw);if(p&&p.reduceMotion){document.documentElement.dataset.reduceMotion="true"}else{delete document.documentElement.dataset.reduceMotion};var d=document.documentElement;var t=p&&(p.textScale==="lg"||p.textScale==="xl")?p.textScale:null;if(t){d.dataset.textScale=t}else{delete d.dataset.textScale}if(p&&p.openReading){d.dataset.readingSpace="open"}else{delete d.dataset.readingSpace}}catch(e){}})();`;
