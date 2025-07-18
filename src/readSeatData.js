
function getData(callback){
    fetch('seats.csv')
    .then(response => response.text())
    .then(data => {
        const grid = data.split('\n').map((row) => row.split(','));
        console.log("GRID: " + grid)
        callback(grid);
    });
}

export default getData;