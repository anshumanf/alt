Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setAppState = setAppState;
exports.snapshot = snapshot;
exports.saveInitialSnapshot = saveInitialSnapshot;
exports.filterSnapshots = filterSnapshots;

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function setAppState(instance, data, onStore) {
  var obj = instance.deserialize(data);
  fn.eachObject(function (key, value) {
    var store = instance.stores[key];
    if (store) {
      var config = store.StoreModel.config;

      var state = store.state;
      if (config.onDeserialize) obj[key] = config.onDeserialize(value) || value;
      if (fn.isMutableObject(state)) {
        fn.eachObject(function (k) {
          return delete state[k];
        }, [state]);
        fn.assign(state, obj[key]);
      } else {
        store.state = obj[key];
      }
      onStore(store, store.state);
    }
  }, [obj]);
}

function snapshot(instance) {
  var storeNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  var stores = storeNames.length ? storeNames : Object.keys(instance.stores);
  return stores.reduce(function (obj, storeHandle) {
    var storeName = storeHandle.displayName || storeHandle;
    var store = instance.stores[storeName];
    var config = store.StoreModel.config;

    store.lifecycle('snapshot');
    var customSnapshot = config.onSerialize && config.onSerialize(store.state);
    obj[storeName] = customSnapshot ? customSnapshot : store.getState();
    return obj;
  }, {});
}

function saveInitialSnapshot(instance, key) {
  var state = instance.deserialize(instance.serialize(instance.stores[key].state));
  instance._initSnapshot[key] = state;
  instance._lastSnapshot[key] = state;
}

function filterSnapshots(instance, state, stores) {
  return stores.reduce(function (obj, store) {
    var storeName = store.displayName || store;
    if (!state[storeName]) {
      throw new ReferenceError(String(storeName) + ' is not a valid store');
    }
    obj[storeName] = state[storeName];
    return obj;
  }, {});
}