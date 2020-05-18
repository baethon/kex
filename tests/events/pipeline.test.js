const test = require('ava')
const sinon = require('sinon')
const EventsPipeline = require('../../src/events/pipeline')
const Event = require('../../src/events/event')

class TestEvent extends Event {
  static get eventName () {
    return 'test'
  }
}

const defer = (ms, fn) => () => new Promise((resolve) => {
  setTimeout(resolve(fn()), ms)
})

test('add & remove listener', t => {
  const events = new EventsPipeline()
  const remove = events.on('test', sinon.stub())

  t.is(events.listeners.get('test').length, 1)

  remove()
  t.is(events.listeners.get('test').length, 0)
})

test('call listeners', async t => {
  const events = new EventsPipeline()
  const firstListener = sinon.stub()
  const secondListener = sinon.stub()

  events.on('test', firstListener)
  events.on('test', secondListener)

  const event = new TestEvent()

  await events.emit(event)

  t.true(event.emitted)
  t.true(firstListener.calledWith(event))
  t.true(secondListener.calledWith(event))
})

test('prevent second emission of the same event', async t => {
  const events = new EventsPipeline()
  const firstListener = sinon.stub()

  events.on('test', firstListener)

  const event = new TestEvent()
  event.markEmitted()

  await events.emit(event)

  t.false(firstListener.called)
})

test('cancel event', async t => {
  const secondListener = sinon.stub()
  const events = new EventsPipeline([
    ['test', [
      (event) => {
        event.cancel()
      },
      secondListener
    ]]
  ])

  const result = await events.emit(new TestEvent())

  t.false(secondListener.calledOnce)
  t.false(result)
})

test('call listeners in exact order', async t => {
  const events = new EventsPipeline()
  const callsList = []
  const firstListener = () => {
    callsList.push('first')
  }
  const secondListener = () => {
    callsList.push('second')
  }

  events.on('test', defer(100, firstListener))
  events.on('test', defer(10, secondListener))

  await events.emit(new TestEvent())

  t.deepEqual(callsList, [
    'first',
    'second'
  ])
})

test('cloning', t => {
  const listener = sinon.stub()

  const events = new EventsPipeline()
  events.on('test', listener)

  const cloned = events.clone()

  t.false(events === cloned)
  t.false(events.listeners === cloned.listeners)
  t.false(events.listeners.get('test') === cloned.listeners.get('test'))
  t.deepEqual(events.listeners.get('test'), cloned.listeners.get('test'))
})

test('binding', async t => {
  const fakeContext = {}
  const events = new EventsPipeline()
  t.plan(1)

  events.on('test', function () {
    t.is(fakeContext, this)
  })

  const event = new TestEvent()
  await events.emit(event, fakeContext)
})
