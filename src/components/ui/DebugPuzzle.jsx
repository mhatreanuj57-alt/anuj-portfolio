import { useEffect, useState } from 'react';
import '../../styles/DebugPuzzle.scss';

const STARTING_ORDER = [4, 0, 7, 2, 8, 1, 6, 3, 5];

const DebugPuzzle = ({ open, onClose, onEnterSecret }) => {
    const [pieces, setPieces] = useState(STARTING_ORDER);
    const [selected, setSelected] = useState(null);
    const solved = pieces.every((piece, index) => piece === index);

    useEffect(() => {
        if (!open) return;
        setPieces(STARTING_ORDER);
        setSelected(null);
    }, [open]);

    if (!open) return null;

    const selectPiece = (index) => {
        if (solved) return;
        if (selected === null) return setSelected(index);
        if (selected === index) return setSelected(null);
        const next = [...pieces];
        [next[selected], next[index]] = [next[index], next[selected]];
        setPieces(next);
        setSelected(null);
    };

    return <div className="debug-puzzle" role="dialog" aria-modal="true" aria-label="Debug the Bug puzzle">
        <div className="debug-puzzle__card">
            <button className="debug-puzzle__close" onClick={onClose} aria-label="Close puzzle">×</button>
            <p className="debug-puzzle__eyebrow">SECRET DEBUG TASK</p>
            <h2>DEBUG THE BUG</h2>
            {!solved ? <p>Put the image back together. Click one piece, then another to swap them.</p> : <p className="debug-puzzle__success">CASE CLOSED — SECRET ROOM UNLOCKED.</p>}
            <div className={`debug-puzzle__grid ${solved ? 'is-solved' : ''}`}>
                {pieces.map((piece, index) => <button key={`${piece}-${index}`} className={`debug-puzzle__piece ${selected === index ? 'is-selected' : ''}`} onClick={() => selectPiece(index)} style={{ backgroundPosition: `${(piece % 3) * 50}% ${Math.floor(piece / 3) * 50}%` }} aria-label={`Puzzle piece ${index + 1}`} />)}
            </div>
            {solved && <button className="debug-puzzle__unlock" onClick={onEnterSecret}>ENTER SECRET ROOM ↗</button>}
        </div>
    </div>;
};

export default DebugPuzzle;
