# client

各种常用`client`的统一封装。
实现自统一接口，目的在于后期方便的横向扩展（增加新的`client`类型）。

- [mysql](packages/mysql-client)
- [redis](packages/redis-client)
- [kafka](packages/kafka-client)
- [http](packages/http-client)
- [raven](packages/raven-client)
- [statsd](packages/statsd-client)
- [exception-report](packages/exception-report-client)

> 接口的定义：[client-intl](packages/client-intl)
> 抽象类的实现：[client](packages/client)
