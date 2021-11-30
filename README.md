
This library contains some commonly needed React utilities.

### useArray
```tsx
function TestComponent() {
  const { at, moveUp, moveDown, remove /* and more */ } = useArray<MyType>();

  return (
    ...
  )
}
```

### useAsync
```tsx
function TestComponent() {
  const { result, previousResult, loading, error, load } = useAsync<UserProfile>({
    load: async () => {
      const res = await fetch('/api/profile');
      return res.json();
    }
  }):

  useEffect(load, []);
  
  return (
    ...
  )
}
```

### useForceRender
```tsx
function TestComponent() {
  const forceRender = useForceRender();
  
  return (
    <div>
      <h1>{Math.random()}</h1>
      <button onClick={forceRender}>Rerender</button>
    </div>
  )
}
```

### useIsMounted
```tsx
function TestComponent() {
  const [someData, setSomeData] = useState<any>();
  const isMounted = useIsMounted();
  
  async function longRunningOperation() {
    const data = await ... // some async op

    if (isMounted()) { // here
      setSomeData(data);
    }
  }

  return (
    <div>
      <h1>{Math.random()}</h1>
      <button onClick={forceRender}>Rerender</button>
    </div>
  )
}
```

### useMap
```tsx
function TestComponent() {
  const { get, set, size /* and more */ } = useMap();

  return (
    ...
  )
}
```

### useTimeout
```tsx
function TestComponent() {
  const [num, setNum] = useState<number>();
  const { running, start, restart, stop } = useTimeout({
    autoStart: true,
    delay: 2000,
    callback: () => setNum(Math.random()),
    repeat: true
  });

  return (
    <div>Random value: {num}</div>
  )
}
```

### Also check out

See package [`use-between`](https://www.npmjs.com/package/use-between). It goes pretty well with the hooks in this package.