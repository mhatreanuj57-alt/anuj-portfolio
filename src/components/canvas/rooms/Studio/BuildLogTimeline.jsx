import { useRef, useState } from 'react';
import { RoundedBox, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const FONT = '/fonts/CabinSketch-Bold.ttf';
const STAGES = [
    { label: 'FIRST BUILD', date: '17 SEP 2026', hash: '6eac1b1', title: 'THE FIRST INTERACTION', detail: 'A paper mask reveal turned the opening page into an experience.', color: '#376ca7', notes: ['START PAGE', 'MASK REVEAL', 'FIRST SHIP'] },
    { label: 'BREAKING POINT', date: '17 SEP 2026', hash: '9c338dc', title: 'TYPE SYSTEM REPAIR', detail: 'Marathi typography and Carousel styles were repaired together.', color: '#ba4439', notes: ['TYPE FAILED', 'STYLE MISMATCH', 'PATCHED'] },
    { label: 'CURRENT VERSION', date: '18 SEP 2026', hash: '2189bb8', title: 'LIVE MMR DIAGNOSTICS', detail: 'Real validation records now power the deployed price explorer.', color: '#297656', notes: ['5,341 RECORDS', '51 LOCALITIES', 'PRODUCTION READY'] },
];

function Control({ position, label, onClick }) {
    return <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }} onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'auto'; }}>
        <RoundedBox args={[.62, .52, .16]} radius={.06} position={[0, 0, .11]}><meshBasicMaterial color="#241c16" /></RoundedBox>
        <Text font={FONT} fontSize={.34} color="#fff8e7" anchorX="center" anchorY="middle" position={[0, 0, .22]}>{label}</Text>
    </group>;
}

function Receipt({ visible }) {
    const receipt = useRef();
    useFrame(({ clock }) => {
        if (receipt.current) receipt.current.position.y = visible ? -1.18 + Math.sin(clock.elapsedTime * 2) * .035 : -1.58;
    });
    return <group ref={receipt} position={[3.85, -1.18, .19]} visible={visible} rotation={[0, 0, -.025]}>
        <mesh><planeGeometry args={[2.25, 2.55]} /><meshBasicMaterial color="#fff9e9" /></mesh>
        <Text font={FONT} fontSize={.19} color="#2b704d" anchorX="center" position={[0, .85, .03]}>DEPLOY RECEIPT</Text>
        <Text font={FONT} fontSize={.14} color="#4d4a42" anchorX="center" position={[0, .5, .03]}>PRODUCTION / READY</Text>
        <mesh position={[0, .22, .03]}><planeGeometry args={[1.63, .03]} /><meshBasicMaterial color="#c8bda8" /></mesh>
        <Text font={FONT} fontSize={.14} color="#191612" anchorX="center" position={[0, -.08, .03]}>anujmhatre.me</Text>
        <Text font={FONT} fontSize={.13} color="#4d4a42" anchorX="center" position={[0, -.42, .03]}>2189bb8 / 18 SEP</Text>
        <Text font={FONT} fontSize={.15} color="#297656" anchorX="center" position={[0, -.8, .03]}>✓ SHIPPED</Text>
    </group>;
}

function StageIllustration({ stage }) {
    if (stage === 0) return <group position={[3.85, -1.18, .18]}>
        <mesh><planeGeometry args={[2.25, 2.55]} /><meshBasicMaterial color="#e5f1fb" /></mesh>
        {[-.65, -.2, .25, .7].map((y) => <mesh key={y} position={[0, y, .03]}><planeGeometry args={[1.72, .025]} /><meshBasicMaterial color="#6d9dc7" /></mesh>)}
        {[-.65, 0, .65].map((x) => <mesh key={x} position={[x, 0, .03]}><planeGeometry args={[.025, 1.75]} /><meshBasicMaterial color="#6d9dc7" /></mesh>)}
        <Text font={FONT} fontSize={.2} color="#173b62" anchorX="center" position={[0, .91, .04]}>BLUEPRINT 01</Text>
        <Text font={FONT} fontSize={.17} color="#376ca7" anchorX="center" position={[0, -.98, .04]}>IDEA → INTERACTION</Text>
    </group>;
    if (stage === 1) return <group position={[3.85, -1.18, .18]}>
        <mesh><planeGeometry args={[2.25, 2.55]} /><meshBasicMaterial color="#f4dad4" /></mesh>
        {['404', 'BUG', 'FIX'].map((note, i) => <group key={note} position={[[-.55, .45, -.22][i], [.5, -.2, -.85][i], .04]} rotation={[0, 0, [-.12, .08, -.07][i]]}>
            <mesh><planeGeometry args={[1.05, .62]} /><meshBasicMaterial color={i === 2 ? '#ffe7a3' : '#fff6dc'} /></mesh>
            <Text font={FONT} fontSize={.27} color={i === 2 ? '#297656' : '#9c2e28'} anchorX="center" anchorY="middle" position={[0, 0, .03]}>{note}</Text>
        </group>)}
        <Text font={FONT} fontSize={.19} color="#661e19" anchorX="center" position={[0, .95, .04]}>ERROR REPORT</Text>
    </group>;
    return <Receipt visible />;
}

const BuildLogTimeline = ({ position = [0, 5.9, -15] }) => {
    const [stageIndex, setStageIndex] = useState(2);
    const current = STAGES[stageIndex];
    const step = (direction) => setStageIndex((old) => (old + direction + STAGES.length) % STAGES.length);
    return <group position={position}>
        <Text font={FONT} fontSize={.56} color="#171411" anchorX="center" maxWidth={8} textAlign="center" position={[0, .14, 0]}>THE VERSION CONTROL</Text>
        <Text font={FONT} fontSize={.31} color="#8c6947" anchorX="center" position={[0, -.29, 0]}>TIME MACHINE</Text>
        <RoundedBox args={[12.85, 4.55, .16]} radius={.18} smoothness={4} position={[0, -2.75, 0]}><meshBasicMaterial color="#2b2119" /></RoundedBox>
        <RoundedBox args={[12.5, 4.2, .09]} radius={.1} smoothness={3} position={[0, -2.75, .13]}><meshBasicMaterial color="#f6edda" /></RoundedBox>
        <Text font={FONT} fontSize={.18} color={current.color} anchorX="center" position={[-2.15, -.86, .2]}>{current.date}  /  {current.hash}</Text>
        <Text font={FONT} fontSize={.39} color="#201914" anchorX="center" maxWidth={5.2} textAlign="center" position={[-2.15, -1.36, .2]}>{current.title}</Text>
        <Text font={FONT} fontSize={.21} color="#5d5145" anchorX="center" maxWidth={4.8} textAlign="center" lineHeight={1.25} position={[-2.15, -2.2, .2]}>{current.detail}</Text>
        <StageIllustration stage={stageIndex} />
        <group position={[-2.15, -3.38, .23]} scale={[.45, .45, .45]}>
            <Text font={FONT} fontSize={.15} color="#5d5145" anchorX="center" position={[0, 1.08, .16]}>COMMIT SELECTOR</Text>
            <mesh position={[0, -.03, .11]}><circleGeometry args={[.94, 40]} /><meshBasicMaterial color="#b58a46" /></mesh>
            <mesh position={[0, -.03, .13]}><circleGeometry args={[.84, 40]} /><meshBasicMaterial color="#211a15" /></mesh>
            <mesh position={[0, -.03, .15]}><circleGeometry args={[.72, 40]} /><meshBasicMaterial color="#e9dcc4" /></mesh>
            {Array.from({ length: 12 }, (_, tick) => {
                const angle = (tick / 12) * Math.PI * 2;
                return <mesh key={tick} position={[Math.sin(angle) * .78, Math.cos(angle) * .78 - .03, .18]} rotation={[0, 0, -angle]}>
                    <planeGeometry args={[.035, tick % 3 === 0 ? .17 : .085]} /><meshBasicMaterial color="#4d4034" />
                </mesh>;
            })}
            <mesh position={[0, -.03, .22]} onClick={(e) => { e.stopPropagation(); step(1); }} onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'auto'; }}><circleGeometry args={[.55, 32]} /><meshBasicMaterial color={current.color} /></mesh>
            <group position={[0, -.03, .25]} rotation={[0, 0, stageIndex === 0 ? -.82 : stageIndex === 1 ? 0 : .82]}>
                <mesh position={[0, .29, 0]}><planeGeometry args={[.09, .5]} /><meshBasicMaterial color="#fff8e7" /></mesh>
                <mesh position={[0, .57, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[.13, .22, 3]} /><meshBasicMaterial color="#fff8e7" /></mesh>
            </group>
            <mesh position={[0, -.03, .28]}><circleGeometry args={[.12, 18]} /><meshBasicMaterial color="#f0c86f" /></mesh>
            <Text font={FONT} fontSize={.13} color="#5d5145" anchorX="center" position={[0, -1.1, .16]}>CLICK WHEEL TO TURN</Text>
        </group>
        {STAGES.map((stage, index) => <group key={stage.label} position={[[-.25, 1.2, 2.65][index], -3.65, .22]} onClick={(e) => { e.stopPropagation(); setStageIndex(index); }} onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'auto'; }}>
            <mesh><circleGeometry args={[.19, 20]} /><meshBasicMaterial color={stageIndex === index ? stage.color : '#cfc2ae'} /></mesh>
            <Text font={FONT} fontSize={.12} color="#4b4138" anchorX="center" maxWidth={1.15} textAlign="center" position={[0, -.38, .03]}>{stage.label}</Text>
        </group>)}
        <Control position={[-5.43, -2.75, .25]} label="‹" onClick={() => step(-1)} />
        <Control position={[5.43, -2.75, .25]} label="›" onClick={() => step(1)} />
        <Text font={FONT} fontSize={.13} color={current.color} anchorX="center" position={[2.1, -3.02, .21]}>{current.notes.join('  ·  ')}</Text>
    </group>;
};

export default BuildLogTimeline;
