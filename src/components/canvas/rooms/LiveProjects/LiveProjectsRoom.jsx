import { useEffect } from 'react';

const LiveProjectsRoom = ({ showRoom, onReady }) => {
    useEffect(() => { if (showRoom) onReady?.(); }, [showRoom, onReady]);

    return null;
};

export default LiveProjectsRoom;
