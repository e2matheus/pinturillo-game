import React, { useRef, useEffect } from 'react';

function DrawingCanvas({ socket, roomCode }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    const startDrawing = (e) => {
      isDrawing.current = true;
      draw(e);
    };

    const stopDrawing = () => {
      isDrawing.current = false;
      context.beginPath();
    };

    const draw = (e) => {
      if (!isDrawing.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);

      socket.emit('draw', {
        roomCode,
        drawData: { x, y }
      });
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    socket.on('drawing', (drawData) => {
      context.lineTo(drawData.x, drawData.y);
      context.stroke();
      context.beginPath();
      context.moveTo(drawData.x, drawData.y);
    });

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [socket, roomCode]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: '1px solid black' }}
    />
  );
}

export default DrawingCanvas; 