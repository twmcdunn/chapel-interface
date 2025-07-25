
const isProduction = process.env.NODE_ENV === 'production' ||
    window.location.hostname !== 'localhost';
const url = isProduction ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws` : 'ws://localhost:8080?x-authenticated-netid=your-test-netid';
export default function connectToServer(setSeatData, setSeatDims, setSeatCoords) {
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            handleMessage(message);
        } catch (error) {
            console.error("BAD MESSAGE from server: ", error);
        }
    };

    function handleMessage(message) {
        switch (message.type) {
            case 'full_emptySeats':
                const seatsGrid = message.seats.split('\n').map((row) => row.split(',').map(cell => cell.trim()));
                const empties = message.emptySeats.split('\n').map((row) => row.split(',').map(cell => cell.trim()));
                console.log('got the grid:' + empties[0][1]);
                setSeatCoords(seatsGrid);
                var seatData = {};
                seatsGrid.forEach(row => {
                    seatData[row[2] + ""] = {
                        status: empties.some(emptyrow =>
                            emptyrow[2] == row[2]) ? 'absent' : 'present'
                    }
                });
                //console.log(seatData);
                setSeatData(seatData);
                setSeatDims(JSON.parse(message.seatDims));
                break;
        }
    }
};
