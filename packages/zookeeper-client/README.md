## zookeeper-client

> 提供几个常用的 API： getData, setData getChildren

### getData

```typescript
console.log(await client.getData('/patha/pathb'))
```

### setData

```typescript
await client.setData('/patha/pathb', 123)
console.log(await client.getData('/patha/pathb')) // => 123
```

### getChildren

```typescript
console.log(await client.getChildren('/patha')) // => ['pathb', 'pathc']
```