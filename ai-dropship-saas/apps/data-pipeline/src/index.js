const config = {
  eventBus: 'kafka-ready',
  warehouse: 'clickhouse-ready',
  etl: ['extract-trend-signals', 'transform-product-metrics', 'load-analytics-facts'],
  eventSourcing: true,
};

console.log('data-pipeline booted', config);
