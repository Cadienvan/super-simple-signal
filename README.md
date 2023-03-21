# What Is This?
This is a super simple signal library for browser. It's mostly an experiment which provided good benchmarks and a nice, clean and simple API. It's also very small, weighing in at 296B minified and gzipped.

# Installation
```bash
npm install super-simple-signal
```

# Usage
```html
<!-- Load the library from your node_modules or from a CDN -->
<script src="./node_modules/super-simple-signal/index.js"></script>
<script>
  const signal = new Signal(0);

  signal.subscribe(value => {
    console.log(value);
  });

  window.addEventListener("load", () => {
    const s1 = document.getElementById("s1");
    signal.attachTo(s1);
  });
</script>
<div id="s1"></div>
<button onclick="signal.value++">Click me</button>
```

# API
## Signal
A `Signal` is a reactive javascript variable which can be attached to a DOM node and create a one-way or two-way data binding mechanism with it.

### `new Signal(value)`
Creates a new signal with the given initial value.

### `new Signal(node)`
Creates a new signal which is attached to the given node. 

### `new Signal(node, value)`
Creates a new signal which is attached to the given node and has the given initial value.

### `new Signal(node, value, opts)`
Creates a new signal which is attached to the given node and has the given initial value. The opts object can have the following properties:
- `property` - The property of the node to attach to. Defaults to `innerHTML`.
- `bind` - Whether to bind the signal to the node. Defaults to `true`. If so, the signal will be updated whenever the node's `bindEvents` are fired.
- `bindEvents` - The events to bind to. Defaults to an empty array.
- `render` - A function which will be called whenever the signal's value changes. The function will be called with the new value as the first argument. This means you can have a signal value of any type and render it however you want.
- `allowDirty` - Whether to allow dirty values. Defaults to `false`. If so, the signal will fire its subscribers and re-render even if the value hasn't changed.

### `signal.value`
The current value of the signal. Setting this will update the signal's value and call all the signal's subscribers and re-render the signal's node.

### `signal.subscribe(callback)`
Subscribes the given callback to the signal. The callback will be called whenever the signal's value changes. The callback will be called with the new value as the first argument and the old value as the second argument.

### `signal.unsubscribe(callback)`
Unsubscribes the given callback from the signal.

### `signal.attachTo(node, property)`
Attaches the signal to the given node. The signal will update the node's given property whenever the signal's value changes. Defaults to `innerHTML`. If the signal already has a node attached, it will be detached first.

### `signal.detach()`
Detaches the signal from the current node.

### `signal.copyTo(node, opts, keepInSync)`
Copies the signal's value to the given node. This will actually create a new `Signal`. If `keepInSync` is `true`, the new signal will be updated whenever the initial signal changes. Defaults to `true`. To prevent circular updates, we only subscribe to the signal if keepInSync is true and don't subscribe back.

## Computed
A `Computed` is a `Signal` which is dependent on given input signals.  
Its API, being a Signal itself, is totally compatible with the Signal, with some differences explained below.

### `new Computed(dependencies, fn, node, opts)`
Creates a new Computed which is attached to the given node and has the given initial value.  
It takes the following parameters:
- `dependencies`: An array of Signals from which the Computed depends.
- `fn`: The function to be called whenever a dependency changes. It takes the Signal `value` as the first parameter, the Signal `oldValue` as the second parameter and the `computedOldValue` as the third parameter.
- `node`: The node to attach the Computed to.
- `opts`: A Signal-compatible opts parameter.

# Benchmarks

If you open the `examples/bechmark.html` file in your browser, you can see the time needed to update 3 signals 100.000 times with random numbers. The results are as follows on a 2021 Macbook Pro M1 Max with 32GB of RAM:  
`12ms for 300.000 updates`

# ToDo
- [ ] Add tests