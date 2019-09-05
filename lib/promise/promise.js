let obj = { username: 'Đặng Quang Vũ', userId: '5d5e3273f78d5d3824e444bb', count: 1 };
let obj2 = { username: 'Đặng Văn Kiên', userId: '5d5e30ae48d5f12ec016c845', count: 1 }
let userId1 = '5d5e30ae48d5f12ec016c845'
let o = [obj, obj2];
o.map(item => {
    if (item.userId == userId1) {
        item.count++;
    }
})
console.log(o)
const arr = [];
console.log(arr.length)
    // let count = 0;
    // o.map(item => {
    //     if (item.userId == userId1) {
    //         break;
    //     }
    //     count++z
    // })
    // console.log(count)
    // let index = o.findIndex((user) => user.userId === id
    // });
    // console.log(index)
    // if (count > -1) {
    //     o.splice(count, 1)[0]
    // }
    //console.log(o);