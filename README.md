# What Is This?
This is a super simple signal library for browser and Node. It's mostly an experiment which provided good benchmarks and a nice, clean and simple API.

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
### `new Signal(value)`
Creates a new signal with the given initial value.

### `new Signal(node)`
Creates a new signal which is attached to the given node. 

### `new Signal(node, value)`
Creates a new signal which is attached to the given node and has the given initial value.

### `new Signal(node, value, property)`
Creates a new signal which is attached to the given node and has the given initial value. The signal will update the given property of the node. Defaults to `innerHTML`.

### `signal.value`
The current value of the signal.

### `signal.subscribe(callback)`
Subscribes the given callback to the signal. The callback will be called whenever the signal's value changes. The callback will be called with the new value as the first argument.

### `signal.unsubscribe(callback)`
Unsubscribes the given callback from the signal.

### `signal.attachTo(node, property)`
Attaches the signal to the given node. The signal will update the node's given property whenever the signal's value changes. Defaults to `innerHTML`.

### `signal.detachFrom(node)`
Detaches the signal from the given node.

### `signal.copyTo(node, property, keepInSync)`
Copies the signal's value to the given node. This will actually create a new `Signal`. If `keepInSync` is `true`, the new signal will be updated whenever the initial signal changes. Defaults to `false`.



# Considerations
- Currently the library only supports one-way binding. Updating the signal will update the DOM but not the other way around.

# ToDo
- [ ] Add tests
- [ ] Two-way binding