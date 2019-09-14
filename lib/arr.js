let frusts = ['a', 'b', 'c', 'd'];
let b = ['e', 'f', 'g']
let arr = 0;
console.log(arr)
arr = frusts;
b.map(item => {
    arr.push(item);
})
console.log(arr);
console.log(typeof arr)