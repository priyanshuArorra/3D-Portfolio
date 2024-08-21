import { a } from "@react-spring/three";
import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";


import islandScene from "../assets/3d/island.glb";

export function Island({
    isRotating,
    setIsRotating,
    setCurrentStage,
    currentFocusPoint,
    ...props
}) {
    const islandRef = useRef();
    // Get access to the Three.js renderer and viewport
    const { gl, viewport } = useThree();
    const { nodes, materials } = useGLTF(islandScene);

    console.log('Nodes:', nodes);
    console.log('Materials:', materials);


    // Use a ref for the last mouse x position
    const lastX = useRef(0);
    // Use a ref for rotation speed
    const rotationSpeed = useRef(0);
    // Define a damping factor to control rotation damping
    const dampingFactor = 0.95;

    // Handle pointer (mouse or touch) down event
    const handlePointerDown = (event) => {
        event.stopPropagation();
        event.preventDefault();
        setIsRotating(true);

        // Calculate the clientX based on whether it's a touch event or a mouse event
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;

        // Store the current clientX position for reference
        lastX.current = clientX;
    };

    // Handle pointer (mouse or touch) up event
    const handlePointerUp = (event) => {
        event.stopPropagation();
        event.preventDefault();
        setIsRotating(false);
    };

    // Handle pointer (mouse or touch) move event
    const handlePointerMove = (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (isRotating) {
            // If rotation is enabled, calculate the change in clientX position
            const clientX = event.touches ? event.touches[0].clientX : event.clientX;

            // calculate the change in the horizontal position of the mouse cursor or touch input,
            // relative to the viewport's width
            const delta = (clientX - lastX.current) / viewport.width;

            // Update the island's rotation based on the mouse/touch movement
            islandRef.current.rotation.y += delta * 0.01 * Math.PI;

            // Update the reference for the last clientX position
            lastX.current = clientX;

            // Update the rotation speed
            rotationSpeed.current = delta * 0.01 * Math.PI;
        }
    };

    // Handle keydown events
    const handleKeyDown = (event) => {
        if (event.key === "ArrowLeft") {
            if (!isRotating) setIsRotating(true);

            islandRef.current.rotation.y += 0.005 * Math.PI;
            rotationSpeed.current = 0.007;
        } else if (event.key === "ArrowRight") {
            if (!isRotating) setIsRotating(true);

            islandRef.current.rotation.y -= 0.005 * Math.PI;
            rotationSpeed.current = -0.007;
        }
    };

    // Handle keyup events
    const handleKeyUp = (event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            setIsRotating(false);
        }
    };

    // Touch events for mobile devices
    const handleTouchStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsRotating(true);

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        lastX.current = clientX;
    }

    const handleTouchEnd = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsRotating(false);
    }

    const handleTouchMove = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (isRotating) {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const delta = (clientX - lastX.current) / viewport.width;

            islandRef.current.rotation.y += delta * 0.01 * Math.PI;
            lastX.current = clientX;
            rotationSpeed.current = delta * 0.01 * Math.PI;
        }
    }

    useEffect(() => {
        // Add event listeners for pointer and keyboard events
        const canvas = gl.domElement;
        canvas.addEventListener("pointerdown", handlePointerDown);
        canvas.addEventListener("pointerup", handlePointerUp);
        canvas.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        canvas.addEventListener("touchstart", handleTouchStart);
        canvas.addEventListener("touchend", handleTouchEnd);
        canvas.addEventListener("touchmove", handleTouchMove);

        // Remove event listeners when component unmounts
        return () => {
            canvas.removeEventListener("pointerdown", handlePointerDown);
            canvas.removeEventListener("pointerup", handlePointerUp);
            canvas.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            canvas.removeEventListener("touchstart", handleTouchStart);
            canvas.removeEventListener("touchend", handleTouchEnd);
            canvas.removeEventListener("touchmove", handleTouchMove);
        };
    }, [gl, handlePointerDown, handlePointerUp, handlePointerMove]);

    // This function is called on each frame update
    useFrame(() => {
        // If not rotating, apply damping to slow down the rotation (smoothly)
        if (!isRotating) {
            // Apply damping factor
            rotationSpeed.current *= dampingFactor;

            // Stop rotation when speed is very small
            if (Math.abs(rotationSpeed.current) < 0.01) {
                rotationSpeed.current = 0.01;
            }

            islandRef.current.rotation.y += rotationSpeed.current;
        } else {
            // When rotating, determine the current stage based on island's orientation
            const rotation = islandRef.current.rotation.y;

            /**
             * Normalize the rotation value to ensure it stays within the range [0, 2 * Math.PI].
             * The goal is to ensure that the rotation value remains within a specific range to
             * prevent potential issues with very large or negative rotation values.
             *  Here's a step-by-step explanation of what this code does:
             *  1. rotation % (2 * Math.PI) calculates the remainder of the rotation value when divided
             *     by 2 * Math.PI. This essentially wraps the rotation value around once it reaches a
             *     full circle (360 degrees) so that it stays within the range of 0 to 2 * Math.PI.
             *  2. (rotation % (2 * Math.PI)) + 2 * Math.PI adds 2 * Math.PI to the result from step 1.
             *     This is done to ensure that the value remains positive and within the range of
             *     0 to 2 * Math.PI even if it was negative after the modulo operation in step 1.
             *  3. Finally, ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) applies another
             *     modulo operation to the value obtained in step 2. This step guarantees that the value
             *     always stays within the range of 0 to 2 * Math.PI, which is equivalent to a full
             *     circle in radians.
             */
            const normalizedRotation =
                ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

            // Set the current stage based on the island's orientation
            switch (true) {
                case normalizedRotation >= 5.45 && normalizedRotation <= 5.85:
                    setCurrentStage(4);
                    break;
                case normalizedRotation >= 0.85 && normalizedRotation <= 1.3:
                    setCurrentStage(3);
                    break;
                case normalizedRotation >= 2.4 && normalizedRotation <= 2.6:
                    setCurrentStage(2);
                    break;
                case normalizedRotation >= 4.25 && normalizedRotation <= 4.75:
                    setCurrentStage(1);
                    break;
                default:
                    setCurrentStage(null);
            }
        }
    });

    return (
        <a.group ref={islandRef} {...props} >

            <group name="Sketchfab_Scene">
                <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
                    <group name="root">
                        <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
                            <group
                                name="Dragon_Head_1"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_4"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_4.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#ff6666" // Set the color to light red
                                    material-metalness={0.8} // Add some metalness for a glassy look
                                    material-roughness={0.3} // Add some roughness for a glassy look
                                    material-transparency={0.5} // Add some transparency for a glassy look
                                    material-reflectivity={0.5}
                                />
                            </group>
                            <group
                                name="DragonBody_2"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_6"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_6.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#ff6666" // Set the color to light red
                                    material-metalness={0.7} // Add some metalness for a glassy look
                                    material-roughness={0.3} // Add some roughness for a glassy look
                                    material-transparency={0.8} // Add some transparency for a glassy look
                                    material-reflectivity={0.9}

                                />
                            </group>
                            <group
                                name="Eyes_3"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_8"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_8.geometry}
                                    material={materials.Emit}
                                    material-emissive="#ffffff" // Add a bright white glow
                                    material-emissiveIntensity={100} // Control the intensity of the glow

                                />
                            </group>
                            <group
                                name="DragonScales_4"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_10"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_10.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#000000" // Set the color to black
                                    material-metalness={0.7} // Add some metalness for a glassy look
                                    material-roughness={0.3} // Add some roughness for a glassy look
                                    material-transparency={0.9} // Add some transparency for a glassy look
                                    material-reflectivity={0.9}

                                />
                            </group>
                            <group
                                name="Clouds_5"
                                position={[37.085, 56.124, 35.565]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_12"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_12.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFFFF" // Set the color to white
                                    material-metalness={1.3} // Add some metalness for a glassy look
                                    material-roughness={0.000001} // Add some roughness for a glassy look

                                />
                            </group>
                            <group
                                name="Base_6"
                                position={[-3.681, 0.093, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_14"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_14.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#00FF00" // Set the color to light red
                                    material-metalness={0.7} // Add some metalness for a glassy look
                                    material-roughness={0.3} // Add some roughness for a glassy look
                                    material-transparency={0.8} // Add some transparency for a glassy look
                                    material-reflectivity={0.9}

                                />
                            </group>
                            <group
                                name="Hill_1_7"
                                position={[9.046, 0, -9.25]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_16"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_16.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#00FF00"
                                    material-metalness={0.7} // Add some metalness for a glassy look
                                    material-roughness={0.5} // Add some roughness for a glassy look
                                    material-transparency={0.6} // Add some transparency for a glassy look
                                    material-reflectivity={0.7}

                                />
                            </group>
                            <group
                                name="Hill_2_8"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_18"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_18.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#00FF00"
                                />
                            </group>
                            <group
                                name="Circle001_9"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_20"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_20.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#F5DEB3"
                                />
                            </group>
                            <group
                                name="Lamp_10"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_22"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_22.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFFFF"
                                />
                                <mesh
                                    name="Object_23"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_23.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFF00"
                                    material-emissive="#FFFF00" // Emissive color (same as yellow)
                                    material-emissiveIntensity={100} // Adjust the intensity of the glow
                                />
                            </group>
                            <group
                                name="Tori_11"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_25"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_25.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFC5C5"
                                    material-emissive="#FFC5C5"
                                    material-emissiveIntensity={20}
                                />
                                <mesh
                                    name="Object_26"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_26.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFC5C5"
                                />
                            </group>
                            <group
                                name="FireFly_12"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_28"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_28.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFF00"
                                    material-emissive="#666600" // Darker shade of yellow
                                    material-emissiveIntensity={100}
                                />
                            </group>
                            <group
                                name="Grass_1_13"
                                position={[30.552, 0, 2.164]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_30"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_30.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#2F4F4F"
                                />
                            </group>
                            <group
                                name="Grass_2_14"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_32"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_32.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#2F4F4F"
                                />
                            </group>
                            <group
                                name="Grass_3_15"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_34"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_34.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#2F4F4F"
                                />
                            </group>
                            <group
                                name="Grass_5_16"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_36"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_36.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#2F4F4F"
                                />
                            </group>
                            <group
                                name="Grass_4_17"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_38"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_38.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#2F4F4F"
                                />
                            </group>
                            <group
                                name="Laternen_18"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_40"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_40.geometry}
                                    material={materials.Emit}
                                />
                                <mesh
                                    name="Object_41"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_41.geometry}
                                    material={materials.Emit}
                                />
                            </group>
                            <group
                                name="Stone_1_19"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_43"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_43.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFFFF"
                                />
                            </group>
                            <group
                                name="Stone_2_20"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_45"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_45.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFFFF"
                                />
                            </group>
                            <group
                                name="Stone_3_21"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_47"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_47.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFFFF"
                                />
                            </group>
                            <group
                                name="Stone_5_22"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_49"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_49.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFFFF"
                                />
                            </group>
                            <group
                                name="Stone_6_23"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_51"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_51.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFFFF"
                                />
                            </group>
                            <group
                                name="Stone_1001_24"
                                position={[-34.998, -0.657, 0.01]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_53"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_53.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFFFF"
                                />
                            </group>
                            <group
                                name="Plate_1_25"
                                position={[-3.681, 5.046, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_55"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_55.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#000000"
                                />
                            </group>
                            <group
                                name="Plate_2_26"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_57"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_57.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFFFF"
                                />
                            </group>
                            <group
                                name="Plate_3_27"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_59"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_59.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#000000"
                                />
                            </group>
                            <group
                                name="Plate_4_28"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_61"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_61.geometry}
                                    material={materials.Normal_Color}
                                />
                            </group>
                            <group
                                name="Stones_Tori_29"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_63"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_63.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FFFFFF"
                                />
                            </group>
                            <group
                                name="Zaun_2_30"
                                position={[9.046, 0, -9.25]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_65"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_65.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#964B00"
                                />
                            </group>
                            <group
                                name="Tempel_31"
                                position={[9.046, 0, -9.25]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_67"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_67.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FF3737"

                                />
                            </group>
                            <group
                                name="Stairs_32"
                                position={[9.046, 0, -9.25]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_69"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_69.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#808080"
                                />
                            </group>
                            <group
                                name="Stones_tempel_33"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_71"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_71.geometry}
                                    material={materials.Normal_Color}
                                />
                            </group>
                            <group
                                name="Windows_Plane_34"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_73"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_73.geometry}
                                    material={materials.Normal_Color}
                                />
                                <mesh
                                    name="Object_74"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_74.geometry}
                                    material={materials.Emit}
                                />
                            </group>
                            <group
                                name="Door_Temple_35"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_76"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_76.geometry}
                                    material={materials.Normal_Color}
                                />
                            </group>
                            <group
                                name="Tree_1_36"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_78"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_78.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#964B00"
                                    material-metalness={0.7} // Add some metalness for a glassy look
                                    material-roughness={0.3} // Add some roughness for a glassy look
                                    material-transparency={0.8} // Add some transparency for a glassy look
                                    material-reflectivity={0.9}

                                />
                            </group>
                            <group
                                name="Tree_2_37"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_80"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_80.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#964B00"
                                    material-metalness={0.7} // Add some metalness for a glassy look
                                    material-roughness={0.3} // Add some roughness for a glassy look
                                    material-transparency={0.8} // Add some transparency for a glassy look
                                    material-reflectivity={0.9}

                                />
                            </group>
                            <group
                                name="Tree_3_38"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_82"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_82.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#964B00"
                                    material-metalness={0.7} // Add some metalness for a glassy look
                                    material-roughness={0.3} // Add some roughness for a glassy look
                                    material-transparency={0.8} // Add some transparency for a glassy look
                                    material-reflectivity={0.9}

                                />
                            </group>
                            <group
                                name="Tree_Bush_39"
                                position={[-13.156, 9.208, 13.067]}
                                rotation={[-3.129, -0.337, 3.107]}
                                scale={1.386}>
                                <mesh
                                    name="Object_84"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_84.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#FF99CC"
                                    material-metalness={0.4} // Add some metalness for a glassy look
                                    material-roughness={0.5} // Add some roughness for a glassy look
                                    material-transparency={0.5} // Add some transparency for a glassy look
                                    material-reflectivity={0.5}

                                />
                            </group>
                            <group
                                name="Water_40"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_86"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_86.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#56C2F2"
                                    material-metalness={1.9} // Add some metalness for a glassy look
                                    material-roughness={0.5} // Add some roughness for a glassy look
                                    material-transparency={0.5} // Add some transparency for a glassy look
                                    material-reflectivity={6}

                                />
                                <mesh
                                    name="Object_87"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_87.geometry}
                                    material={materials.Normal_Color.clone()}
                                    material-color="#F8E231"
                                    material-metalness={0.7} // Add some metalness for a glassy look
                                    material-roughness={0.3} // Add some roughness for a glassy look
                                    material-transparency={0.8} // Add some transparency for a glassy look
                                    material-reflectivity={0.9}

                                />
                            </group>
                            <group
                                name="Water__41"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_89"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_89.geometry}
                                    material={materials.Transparent.clone()}
                                    material-color="#87CEEB"
                                    material-metalness={1.9} // Add some metalness for a glassy look
                                    material-roughness={0.5} // Add some roughness for a glassy look
                                    material-transparency={0.5} // Add some transparency for a glassy look
                                    material-reflectivity={6}

                                />
                            </group>
                            <group
                                name="Fish_42"
                                position={[-3.681, 0, -2.11]}
                                rotation={[-Math.PI, -Math.PI / 9, -Math.PI]}>
                                <mesh
                                    name="Object_91"
                                    castShadow
                                    receiveShadow
                                    geometry={nodes.Object_91.geometry}
                                    material={materials.Normal_Color}
                                />
                            </group>
                        </group>
                    </group>
                </group>
            </group>
        </a.group>
    )
}
useGLTF.preload('/scene.gltf')