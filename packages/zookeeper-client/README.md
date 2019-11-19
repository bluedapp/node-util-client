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

### create

```typescript
await client.create('/patha/pathb', 1)
await client.create('/patha/pathc', 2)
console.log(await client.getChildren('/patha')) // => ['pathb', 'pathc']
console.log(await client.getData('/patha/pathb')) // => '1'
console.log(await client.getData('/patha/pathc')) // => '2'
```

### remove 

```typescript
await client.create('/patha/pathb', 1)
await client.create('/patha/pathc', 2)
await client.remove('/patha/pathc')
console.log(await client.getChildren('/patha')) // => ['pathb']
console.log(await client.getData('/patha/pathb')) // => '1'
```

### exists 

```typescript
await client.create('/patha/pathb', 1)
console.log(await client.exists('/patha/pathb')) // => true
console.log(await client.exists('/patha/pathc')) // => false
```
