import { useEffect, useState } from "react";

export function useSeatData() {
    const [seatCoords, setSeatCoords] = useState(null);
    useEffect(() => {
        fetch('./seats.csv')
            .then(response => response.text())
            .then(data => {
                const grid = data.split('\n').map((row) => row.split(','));
                console.log("GRID: " + grid)
                setSeatCoords(grid);
            });
    }, []);
    return seatCoords;
}