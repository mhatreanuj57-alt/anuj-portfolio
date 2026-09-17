import { memo, useEffect, useRef } from 'react';

// Carousel is a fullscreen editor. This bridge lets the door complete its
// normal loading sequence without rendering a temporary 3D preview room.
const CarouselRoom = memo(({ showRoom, onReady, isWarmup = false }) => {
    const hasSignaledReady = useRef(false);

    useEffect(() => {
        if (showRoom && !isWarmup && !hasSignaledReady.current) {
            hasSignaledReady.current = true;
            onReady?.();
        }
    }, [showRoom, isWarmup, onReady]);

    useEffect(() => {
        if (!showRoom) hasSignaledReady.current = false;
    }, [showRoom]);

    return null;
});

CarouselRoom.displayName = 'CarouselRoom';

export default CarouselRoom;
