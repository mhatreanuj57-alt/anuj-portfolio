import { Text } from '@react-three/drei';

import StudioRoom from '../Studio/StudioRoom';

// Reuse the proven interactive monitor installation until the live-project
// screens and their project data are supplied.
const LiveProjectsRoom = (props) => (
    <group>
        <StudioRoom {...props} />
        <group position={[0, 5.6, -10]}>
            <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.72} color="#171411" anchorX="center" anchorY="middle" letterSpacing={0.04}>
                LIVE PROJECTS
            </Text>
            <Text font="/fonts/RubikScribble-Regular.ttf" fontSize={0.24} color="#51483f" anchorX="center" anchorY="middle" position={[0, -0.62, 0]}>
                OPEN BUILDS - LIVE ON THE WEB
            </Text>
        </group>
    </group>
);

export default LiveProjectsRoom;
