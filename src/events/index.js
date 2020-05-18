module.exports = {
  EventsPipeline: require('./pipeline'),
  DeletingEvent: require('./deleting'),
  DeletedEvent: require('./deleted'),
  FetchingEvent: require('./fetching'),
  FetchedEvent: require('./fetched'),
  UpdatingEvent: require('./updating'),
  UpdatedEvent: require('./updated'),
  InsertingEvent: require('./inserting'),
  InsertedEvent: require('./inserted')
}
