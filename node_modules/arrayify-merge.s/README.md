# arrayify-merge.s

Wraps packets of streams into array

## Installation

`npm install arrayify-merge.s`

## Example

```js
var arrayify = require('arrayify-merge.s');
var numbers  = require('stream-spectrum/readable/number');
var inspect  = require('inspect-stream');

var merge = arrayify();

numbers({ from: 1, to: 4, objectMode: true }).pipe(merge);
numbers({ from: 5, to: 8, objectMode: true }).pipe(merge);
merge.pipe(inspect()); // outputs [1, 5], [2, 6], [3, 7], [4, 8]
```

## API

`var merge = require('arrayify-merge.s');`

### var stream = merge()

Creates transform stream that will merge packets from
two streams wraping them into array.

