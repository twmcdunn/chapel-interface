import React, { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent, MiniMap } from "react-zoom-pan-pinch";
import connectToServer from "./Client";



const ChapelAttendanceApp = () => {
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const transformRef = useRef(null);
  const imgRef = useRef(null);
  const [seatCoords, setSeatCoords] = useState(null);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [contextMenuSeat, setContextMenuSeat] = useState(null);
  const [seatData, setSeatData] = useState({});
  const [seatDims, setSeatDims] = useState(null);

  // //fetch seat data
  // useEffect(() => {
  //   fetch('./seats.csv')
  //     .then(response => response.text())
  //     .then(data => {
  //       const grid = data.split('\n').map((row) => row.split(','));


  //       fetch('./empty_seats.csv')
  //         .then(response => response.text())
  //         .then(data1 => {
  //           setSeatCoords(grid);
  //           console.log(data1);
  //           const grid1 = data1.split('\n').map((row) => row.split(','));
  //           for (let r = 0; r < grid.length; r++) {
  //             seatData[grid[r][2] + ""] = { "status": (grid1.some(row => row[2] === grid[r][2]) ? 'absent' : 'present') };
  //             //seatData[grid[r][2] + ""] = { "status": 'present' };
  //           }
  //         });
  //     });

  //   fetch('./seatDims.json')
  //     .then(response => response.json())
  //     .then(data => setSeatDims(data));
  // }, []);

  // useEffect(() => {
  //   fetch('http://localhost:3001/api/csv', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       filename: 'seat_data.json',
  //       data: seatData
  //     })
  //   })
  //     .then(res => res.json())
  //     .then(result => console.log(result.message || result.error))
  //     .catch(err => console.log(err.message));
  // }, [seatData]);
  useEffect(() => {
    connectToServer(setSeatData, setSeatDims, setSeatCoords);
  }, []);

  const handleRightClick = (event, seatKey) => {
    event.preventDefault();
    console.log("CONTEXT MENU LOGIC");

    if (transformRef.current) {
      console.log("CONTEXT MENU LOGIC1");

      setContextMenu({
        x: event.clientX,
        y: event.clientY
      });

      setContextMenuSeat(seatKey);
      //console.log()
    }
  };

  const handleClick = (event) => {
    // Close context menu on regular click
    setContextMenu(null);
    setContextMenuSeat(null);
  };

  const handleSeatStatus = (status) => {
    if (contextMenuSeat) {
      setSeatData(prev => ({
        ...prev,
        [contextMenuSeat]: { "status": status }
      }));
    }
    setContextMenu(null);
    setSelectedSeat(null);
    setContextMenuSeat(null);
  };

  const getSeatStatusColor = (status) => {
    switch (status) {
      case 'present': return '#4CAF50';
      case 'absent': return '#F44336';
      case 'uncertain': return '#FF9800';
      default: return '#2196F3';
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <TransformWrapper
        ref={transformRef}
        initialScale={0.4}
        minScale={0.1}
        maxScale={5}
        centerOnInit={false}
        limitToBounds={false}
        panning={{
          disabled: false,
          velocityDisabled: false,
          lockAxisX: false,
          lockAxisY: false
        }}
        wheel={{
          disabled: false,
          step: 0.1,
          smoothStep: 0.001
        }}
        doubleClick={{
          disabled: false,
          mode: "zoomIn",
          step: 0.7
        }}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => (
          <React.Fragment>
            {/* Control Panel */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 1000,
              background: 'white',
              padding: '10px',
              borderRadius: '5px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              display: 'flex',
              gap: '5px',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => zoomIn()}>Zoom In (+)</button>
                <button onClick={() => zoomOut()}>Zoom Out (-)</button>
                <button onClick={() => resetTransform()}>Reset</button>
                <button onClick={() => centerView()}>Center</button>
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Right-click on seats to mark attendance
              </div>
            </div>

            {/* Stats Panel */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1000,
              background: 'white',
              padding: '10px',
              borderRadius: '5px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              minWidth: '200px'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Attendance Summary</h3>
              <div style={{ fontSize: '12px' }}>
                <div>Present: {Object.values(seatData).filter(s => s.status === 'present').length}</div>
                <div>Absent: {Object.values(seatData).filter(s => s.status === 'absent').length}</div>
                <div>Uncertain: {Object.values(seatData).filter(s => s.status === 'uncertain').length}</div>
                <div>Total Marked: {Object.keys(seatData).length}</div>
              </div>
            </div>

            {/* MiniMap */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              zIndex: 1000,
              border: '2px solid #ccc',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <MiniMap width={200} height={150}>
                <img
                  src="Camera1_00_20250601140000.jpg"
                  alt="Chapel minimap"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </MiniMap>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                cursor: 'grab'
              }}
              contentStyle={{
                width: '100%',
                height: '100%'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  cursor: 'grab'
                }}
                onClick={handleClick}
              >
                <img
                  src="Camera1_00_20250601140000.jpg"
                  alt="Chapel attendance view"
                  style={{
                    display: 'block',
                    maxWidth: 'none',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                  draggable={false}
                  ref={imgRef}
                />

                {/* Render seat markers */}
                {Object.entries(seatData).map(([key, seat]) => {
                  // Calculate marker position as percentage of image dimensions
                  const leftPercent = (seat.x / seat.imageWidth) * 100;
                  const topPercent = (seat.y / seat.imageHeight) * 100;

                  return (
                    <div
                      key={key}
                      style={{
                        position: 'absolute',
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                        width: '12px',
                        height: '12px',
                        backgroundColor: getSeatStatusColor(seat.status),
                        borderRadius: '50%',
                        border: '2px solid white',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        pointerEvents: 'none',
                        zIndex: 10
                      }}
                    />
                  );
                })}
                {seatCoords && seatDims && (
                  seatCoords.map(row => {
                    const seatKey = row[2] + "";
                    const highlighted = seatKey === hoveredSeat || seatKey === contextMenuSeat;
                    const color = (seatData[seatKey].status === 'present') ? [0, 255, 0] : [255, 0, 0];
                    return (
                      <div
                        key={seatKey}
                        className="seat-box"
                        onContextMenu={(event) => handleRightClick(event, seatKey)}
                        style={{
                          position: 'absolute',
                          left: `${row[0]}px`,
                          top: `${row[1]}px`,
                          width: `${seatDims.SEAT_WIDTH}px`,
                          height: `${seatDims.SEAT_HEIGHT}px`,
                          borderRadius: '10%',
                          //transform: 'translate(-50%, -50%)',
                          //boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                          //pointerEvents: 'none',

                          zIndex: 10,
                          cursor: `pointer`,
                          //boarder: highlighted ? `10px solid rgba(${color.join(',')},1)` : `10px solid rgba(${color.join(',')},0.25)`,
                          backgroundColor: highlighted ? `rgba(${color.join(',')},1)` : `rgba(${color.join(',')},0.2)`
                        }}
                        onMouseEnter={() => setHoveredSeat(seatKey)}
                        onMouseLeave={() => setHoveredSeat(null)}
                      />
                    );
                  }
                  )
                )}

              </div>
            </TransformComponent>

            {/* Context Menu */}
            {contextMenu && (
              <div
                style={{
                  position: 'fixed',
                  left: `${contextMenu.x}px`,
                  top: `${contextMenu.y}px`,
                  zIndex: 2000,
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  padding: '5px 0',
                  minWidth: '150px'
                }}
              >
                <button
                  onClick={() => handleSeatStatus('present')}
                  style={{
                    width: '100%',
                    padding: '8px 15px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#4CAF50'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ✓ Mark Present
                </button>
                <button
                  onClick={() => handleSeatStatus('absent')}
                  style={{
                    width: '100%',
                    padding: '8px 15px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#F44336'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ✗ Mark Absent
                </button>
                <button
                  onClick={() => handleSeatStatus('uncertain')}
                  style={{
                    width: '100%',
                    padding: '8px 15px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#FF9800'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ? Mark Uncertain
                </button>
                <hr style={{ margin: '5px 0', border: 'none', borderTop: '1px solid #eee' }} />
                <button
                  onClick={() => setContextMenu(null)}
                  style={{
                    width: '100%',
                    padding: '8px 15px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
              </div>
            )}
          </React.Fragment>
        )}
      </TransformWrapper>
    </div>
  );
};

export default ChapelAttendanceApp;
