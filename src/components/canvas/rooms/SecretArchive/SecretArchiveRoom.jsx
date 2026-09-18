import { useEffect, useState } from 'react';
import { Float, RoundedBox, Text } from '@react-three/drei';

const FILES = [
    {
        id: 'proof', number: '01', title: 'THE PROOF', color: '#c85b4a',
        summary: 'LIVE WORK, NOT JUST MOCKUPS.',
        detail: 'Open the Live Projects room to see deployed work, including the Navi Mumbai / BMC house-price prediction system.'
    },
    {
        id: 'builder', number: '02', title: 'THE BUILDER', color: '#457b67',
        summary: 'IDEAS TURNED INTO WORKING EXPERIENCES.',
        detail: 'The Studio Build Log documents how this portfolio is designed, iterated, debugged, and shipped.'
    },
    {
        id: 'mind', number: '03', title: 'THE MIND', color: '#536fa2',
        summary: 'CREATIVE CODE WITH REAL CURIOSITY.',
        detail: 'React, Three.js, Python, AI/ML, interfaces, and a habit of making technical work feel memorable.'
    },
    {
        id: 'signal', number: '04', title: 'THE SIGNAL', color: '#b18a35',
        summary: 'READY FOR THE NEXT CONVERSATION.',
        detail: 'The CV and Contact rooms have the direct details. The point of this archive: there is always evidence behind the claim.'
    }
];

const CaseFile = ({ file, position, active, onOpen }) => (
    <group position={position} rotation={[0, 0, active ? 0 : (file.number === '01' ? -.08 : .08)]}>
        <RoundedBox
            args={[2.45, 1.36, .08]}
            radius={.06}
            smoothness={3}
            onClick={(event) => { event.stopPropagation(); onOpen(file.id); }}
            onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
            <meshBasicMaterial color={active ? file.color : '#e9dec6'} />
        </RoundedBox>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.18} color={active ? '#fffaf0' : '#4a3826'} anchorX="left" position={[-.94, .35, .07]}>{file.number} / CASE FILE</Text>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.27} color={active ? '#fffaf0' : '#2b2119'} anchorX="center" position={[0, .02, .07]}>{file.title}</Text>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.15} color={active ? '#fffaf0' : '#6e5842'} anchorX="center" position={[0, -.36, .07]}>CLICK TO OPEN</Text>
    </group>
);

const SecretArchiveRoom = ({ showRoom, onReady }) => {
    const [activeId, setActiveId] = useState('proof');
    const [opened, setOpened] = useState(new Set());
    const active = FILES.find((file) => file.id === activeId);
    const filesComplete = opened.size === FILES.length;
    const openFile = (id) => {
        setActiveId(id);
        setOpened((current) => new Set([...current, id]));
    };

    useEffect(() => { if (showRoom) onReady?.(); }, [showRoom, onReady]);

    return <group position={[0, .25, -8.2]}>
        <mesh position={[0, -2.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[15, 13]} /><meshBasicMaterial color="#17130f" />
        </mesh>
        <RoundedBox args={[13.3, 7.45, .16]} radius={.2} smoothness={5} position={[0, .55, -2.5]}><meshBasicMaterial color="#382f27" /></RoundedBox>
        <RoundedBox args={[12.72, 6.85, .12]} radius={.16} smoothness={5} position={[0, .55, -2.38]}><meshBasicMaterial color="#f5eddc" /></RoundedBox>

        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.66} color="#32251b" anchorX="center" position={[0, 3.18, -2.27]}>THE ARCHIVE</Text>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.2} color="#886c4a" anchorX="center" position={[0, 2.55, -2.27]}>CONFIDENTIAL: WHY SHOULD ANUJ BE HIRED?</Text>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.15} color="#9c8060" anchorX="center" position={[0, 2.2, -2.27]}>{filesComplete ? 'CASE CLOSED — A DEVELOPER WHO SHIPS.' : `MISSION: FIND THE FOUR PROOFS  •  ${opened.size}/4 FOUND`}</Text>

        <CaseFile file={FILES[0]} position={[-4.35, .82, -2.2]} active={activeId === 'proof'} onOpen={openFile} />
        <CaseFile file={FILES[1]} position={[-1.45, .82, -2.2]} active={activeId === 'builder'} onOpen={openFile} />
        <CaseFile file={FILES[2]} position={[1.45, .82, -2.2]} active={activeId === 'mind'} onOpen={openFile} />
        <CaseFile file={FILES[3]} position={[4.35, .82, -2.2]} active={activeId === 'signal'} onOpen={openFile} />

        <RoundedBox args={[10.8, 2.05, .09]} radius={.12} smoothness={4} position={[0, -1.16, -2.18]}><meshBasicMaterial color="#e8dcc5" /></RoundedBox>
        <RoundedBox args={[10.3, 1.55, .04]} radius={.1} smoothness={4} position={[0, -1.16, -2.1]}><meshBasicMaterial color="#fffaf0" /></RoundedBox>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.18} color={active.color} anchorX="center" position={[0, -.62, -2.04]}>OPEN FILE {active.number}: {active.title}</Text>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.27} color="#2d251d" anchorX="center" maxWidth={8.8} textAlign="center" position={[0, -.98, -2.04]}>{active.summary}</Text>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.16} color="#665445" anchorX="center" maxWidth={8.8} textAlign="center" position={[0, -1.4, -2.04]}>{active.detail}</Text>

        <RoundedBox args={[5.25, .32, 2.5]} radius={.08} smoothness={4} position={[0, -2.35, -.52]}><meshBasicMaterial color="#5e3d28" /></RoundedBox>
        <RoundedBox args={[1.55, .9, .12]} radius={.06} smoothness={4} position={[3.55, -1.94, -.62]}><meshBasicMaterial color="#231f1a" /></RoundedBox>
        <RoundedBox args={[1.28, .64, .04]} radius={.04} smoothness={3} position={[3.55, -1.94, -.52]}><meshBasicMaterial color="#9bcbb7" /></RoundedBox>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.12} color="#18362e" anchorX="center" position={[3.55, -1.84, -.47]}>{filesComplete ? 'CASE CLOSED' : `FILES: ${opened.size}/4`}</Text>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.1} color="#18362e" anchorX="center" position={[3.55, -2.06, -.47]}>evidence &gt; promises</Text>
        {filesComplete && <Float speed={2} rotationIntensity={.15} floatIntensity={.18}><Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.23} color="#c85b4a" anchorX="center" position={[0, -2.02, -.44]}>✓ CASE CLOSED. YOU FOUND A DEVELOPER WHO SHIPS.</Text></Float>}
        <Float speed={2} rotationIntensity={.1} floatIntensity={.25}><Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.32} color="#d7a852" anchorX="center" position={[0, 1.72, -.4]}>✦</Text></Float>
        <pointLight position={[0, 1.4, 1.5]} color="#d9aa58" intensity={16} distance={9} />
    </group>;
};

export default SecretArchiveRoom;
