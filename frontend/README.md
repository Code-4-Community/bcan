## Why We Use Satchel

Satchel is influenced by patterns found in Flux, Redux, and MobX, while minimizing the boilerplate often associated with those libraries. It offers:

- **Observable state**: Thanks to MobX, UI updates happen automatically whenever the store changes, avoiding large re-renders.  
- **Unidirectional data flow**: Actions “dispatch” changes to the store, keeping data flow predictable.  
- **Type-safe**: With TypeScript, it’s straightforward to ensure typed actions and avoid many runtime errors.  
- **Server-side rendering**: Satchel’s stores can be serialized and hydrated on the client if needed.  
- **Middleware**: You can intercept every action dispatch for logging, performance instrumentation, or other side effects.

---

## Core Concepts

### 1. Store

- A **store** is where the application state lives.  
- In Satchel, you typically create one or more stores with `createStore`.  
- Because it’s backed by MobX observables, React components that read from the store automatically update when the store changes.


<summary>Example</summary>

```ts
// store.ts
import { createStore } from 'satcheljs'

interface AuthStore {
  isAuthenticated: boolean
  user: any | null
  accessToken: string | null
}

// We'll export a getter function to keep it consistent with how Satchel works
export let getStore = createStore<AuthStore>('authStore', {
  isAuthenticated: false,
  user: null,
  accessToken: null,
})
```


### 2. Actions

An action is how you trigger a change or side effect in Satchel. You create and dispatch it in one go with the action() helper or do them separately with actionCreator() and dispatch(). Important: Actions are the only way to mutate the store or kick off orchestrators (side effects).

<summary>Example</summary>

```ts
// actions.ts
import { action } from 'satcheljs';

// This will create and dispatch the action in one go.
export let setAuthentication = action(
  'SET_AUTHENTICATION',
  (isAuthenticated: boolean, user: any, accessToken: string | null) => ({
    isAuthenticated,
    user,
    accessToken,
  })
);
```

### 3. Mutators
A mutator is a function that modifies the store in response to an action.
You subscribe to an action by referencing the same action creator you used to define the action.
The store is changed synchronously inside the mutator.
<summary>Example</summary>

```ts
// mutators.ts
import { mutator } from 'satcheljs';
import { getStore } from './store';
import { setAuthentication } from './actions';

// Subscribe to the "setAuthentication" action
mutator(setAuthentication, actionMessage => {
  const store = getStore();
  store.isAuthenticated = actionMessage.isAuthenticated;
  store.user = actionMessage.user;
  store.accessToken = actionMessage.accessToken;
});
```

### 4. Orchestrators
An orchestrator is also triggered by an action, but it’s intended for asynchronous or side-effect logic (e.g., network requests, additional actions).
You do not modify the store directly in an orchestrator. Instead, you might dispatch other actions that mutators listen to.

```ts
// orchestrators.ts
import { orchestrator } from 'satcheljs';
import { setAuthentication } from './actions';

orchestrator(setAuthentication, async actionMessage => {
  // Example side effect: log an analytics event
  console.log('User login status changed:', actionMessage.isAuthenticated);
  // Possibly dispatch another action if needed
});
```

### 5. Dispatch
dispatch() is a lower-level API in Satchel that you typically don’t need if you use action() or actionCreator().
By default, calling myActionCreator(somePayload) creates and dispatches that action.
If you need more advanced control, you can manually create an action and dispatch it.